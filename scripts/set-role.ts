/**
 * Changes a user's role.
 *
 *   npm run set-role -- --email you@ternaengg.ac.in --role ADMIN
 *   npm run set-role -- --email someone@ternaengg.ac.in --role STUDENT
 *
 * Prisma Studio can do this by hand, but a script is safer for the one operation
 * that grants editorial power: it checks the role is real, names the user it is
 * about to change, and prints what changed — so there is no "I clicked the wrong
 * row in a table of 400 students" failure mode.
 *
 * The new role takes effect at the *next sign-in*. Roles are carried in the JWT,
 * which is minted when you sign in and then read without touching the database,
 * so a promotion mid-session is invisible until you sign out and back in. That
 * is the trade for not querying the database on every request in the proxy.
 */
import { config as loadEnv } from "dotenv";

loadEnv({ path: [".env.local", ".env"], quiet: true });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { Role } from "../src/generated/prisma/enums";

const ROLES = Object.values(Role);

function arg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const email = arg("--email")?.trim().toLowerCase();
  const role = arg("--role")?.trim().toUpperCase();

  if (!email || !role) {
    throw new Error(
      `Usage: npm run set-role -- --email <address> --role <${ROLES.join("|")}>`,
    );
  }
  if (!ROLES.includes(role as Role)) {
    throw new Error(`"${role}" is not a role. Use one of: ${ROLES.join(", ")}`);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set.");
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      // A user row only exists after a first sign-in — the adapter creates it.
      const known = await prisma.user.findMany({ select: { email: true }, take: 10 });
      throw new Error(
        `No user with email ${email}. They have to sign in once first.` +
          (known.length
            ? `\nKnown accounts: ${known.map((u) => u.email).join(", ")}`
            : ""),
      );
    }

    if (user.role === role) {
      console.log(`${user.email} is already ${role}. Nothing to do.`);
      return;
    }

    await prisma.user.update({ where: { id: user.id }, data: { role: role as Role } });

    console.log(`${user.name ?? user.email}: ${user.role} → ${role}`);
    console.log(
      "\nSign out and back in for it to take effect — the role lives in the session token.",
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(`\n${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});
