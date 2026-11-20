import type { DefaultSession } from "next-auth";

type Role = "ADMIN" | "STAFF" | "PUBLIC";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: DefaultSession["user"] & { id: string; role: Role };
  }
  interface User {
    role: Role;
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    accessToken?: string;
  }
}
