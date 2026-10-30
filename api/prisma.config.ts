import { config as loadDotenv } from "dotenv";
import { defineConfig, env } from "prisma/config";

loadDotenv({ path: new URL("../.env", import.meta.url), quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL") },
});
