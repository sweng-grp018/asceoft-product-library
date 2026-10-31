import { config as loadDotenv } from "dotenv";
import { z } from "zod";

loadDotenv({ path: new URL("../../../.env", import.meta.url), quiet: true });

const configSchema = z.object({
  DATABASE_URL: z.string().min(1),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  WEB_ORIGIN: z.url().default("http://localhost:3000"),
  JWT_SECRET: z.string().min(32),
  JWT_ISSUER: z.string().default("lensistry-api"),
  JWT_AUDIENCE: z.string().default("lensistry-cms"),
  S3_ENDPOINT: z.url(),
  S3_REGION: z.string().default("us-east-1"),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  AI_SERVICE_URL: z.url().default("http://localhost:8000"),
});

export const config = configSchema.parse(process.env);
