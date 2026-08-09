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
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/**
 * In dev, Next.js hot-reload re-executes modules on every change. Without this
 * global cache each reload would open a brand-new pool and exhaust the database
 * connection limit. In production we just create one client per process.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
