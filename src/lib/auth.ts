import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";
import { ALLOWED_EMAIL_DOMAIN } from "./constants";

/**
 * Full Auth.js setup — Node runtime only (Prisma cannot run on the Edge).
 * `middleware.ts` imports `auth.config.ts` instead.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),

  events: {
    /**
     * Defence in depth: if a non-Terna user were ever created (a bug, a config
     * change, a seeded row), delete it rather than leave a dormant account.
     */
    async createUser({ user }) {
      const email = user.email?.toLowerCase() ?? "";
      if (!email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
        await prisma.user.delete({ where: { id: user.id } });
        throw new Error(
          `Refusing to create user outside @${ALLOWED_EMAIL_DOMAIN}: ${email}`,
        );
      }
    },
  },
});
