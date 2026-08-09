import type { Role } from "@/generated/prisma/client";
import type { DefaultSession } from "next-auth";

/**
 * Teaches TypeScript about the custom fields we put on the session and JWT in
 * `src/lib/auth.config.ts`. Without this, `session.user.role` is a type error.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      credits: number;
      branch: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    credits: number;
    branch: string | null;
  }
}

/**
 * Note this augments `@auth/core/jwt`, not `next-auth/jwt`. The latter is a
 * bare `export * from "@auth/core/jwt"`, and augmenting a re-export does not
 * reach the original interface — the fields would silently stay `unknown`.
 */
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    credits: number;
    branch: string | null;
  }
}

export {};
