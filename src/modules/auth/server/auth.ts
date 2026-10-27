import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins/admin";
import { db } from "@/lib/db/client";
import * as schema from "@/modules/auth/db/auth.schema";

export const auth = betterAuth({
  appName: "Lensistry",
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true, disableSignUp: true },
  plugins: [admin()],
  rateLimit: { enabled: true, storage: "database" },
});
