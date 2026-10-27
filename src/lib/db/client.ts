import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalDb = globalThis as unknown as { lensistryPool?: Pool };
const pool =
  globalDb.lensistryPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
  });
if (process.env.NODE_ENV !== "production") globalDb.lensistryPool = pool;

export const db = drizzle({ client: pool, schema, casing: "snake_case" });
