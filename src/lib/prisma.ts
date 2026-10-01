import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma 7 requires an explicit driver adapter — the old bundled engine is
 * gone. `PrismaPg` speaks plain node-postgres, which works against Neon's
 * pooled connection string as well as a local Postgres.
 */
function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and fill it in.",
    );
  }

  // The placeholder in .env.example parses as a valid URL and fails only later,
  // deep inside an Auth.js adapter call, as an opaque "Configuration" error.
  // Catching it here names the actual problem.
  if (/\/\/(user|USER):(password|PASSWORD)@/.test(connectionString)) {
    throw new Error(
      "DATABASE_URL is still the placeholder from .env.example. Create a database " +
        "(`npx prisma dev` for a local one, or neon.tech for a hosted one), put its " +
        "connection string in .env, then run `npm run db:migrate`.",
    );
  }

  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      /*
       * Pool settings, measured rather than guessed.
       *
       * Against Neon, opening a connection costs ~3 seconds (TLS, auth, and
       * waking the compute); a query on an already-open one costs one network
       * round trip. node-postgres defaults to closing idle connections after
       * ten seconds, so a dev server that is quiet for a minute paid three
       * seconds on the next page — and a page that fires three queries in
       * parallel opened three connections and paid it three times over.
       *
       * Keeping a handful of connections open for five minutes turns that into
       * a single round trip. Neon's own idle timeout is around five minutes, so
       * there is no point holding them longer.
       */
      max: 8,
      idleTimeoutMillis: 5 * 60 * 1000,
      connectionTimeoutMillis: 15_000,
      // TCP keepalives stop a NAT or load balancer silently dropping an idle
      // connection and leaving us to discover it on the next query.
      keepAlive: true,
    }),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/**
 * Opens a few connections immediately, instead of making the first visitor wait
 * for them.
 *
 * Fire-and-forget on purpose: if the database is unreachable the real query will
 * report it properly, and a warm-up failure must never take down module
 * initialisation. Dev warms more because a dev server is one process serving one
 * person; a production instance warms two and lets demand open the rest.
 */
function warmUp(client: PrismaClient) {
  const connections = process.env.NODE_ENV === "production" ? 2 : 4;
  void Promise.all(
    Array.from({ length: connections }, () =>
      client.$queryRaw`SELECT 1`.catch(() => undefined),
    ),
  );
}

/**
 * In dev, Next.js hot-reload re-executes modules on every change. Without this
 * global cache each reload would open a brand-new pool and exhaust the database
 * connection limit. In production we just create one client per process.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  (() => {
    const client = createClient();
    warmUp(client);
    return client;
  })();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
