import { config as loadDotenv } from "dotenv";
import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "../src/lib/db.js";

loadDotenv({ path: new URL("../../.env", import.meta.url), quiet: true });

const seed = z
  .object({
    ADMIN_EMAIL: z.email(),
    ADMIN_PASSWORD: z.string().min(12),
    ADMIN_NAME: z.string().min(1),
  })
  .parse(process.env);

try {
  await db.user.upsert({
    where: { email: seed.ADMIN_EMAIL.toLowerCase() },
    create: {
      email: seed.ADMIN_EMAIL.toLowerCase(),
      name: seed.ADMIN_NAME,
      passwordHash: await hash(seed.ADMIN_PASSWORD, 12),
      role: "ADMIN",
    },
    update: {
      name: seed.ADMIN_NAME,
      passwordHash: await hash(seed.ADMIN_PASSWORD, 12),
      role: "ADMIN",
    },
  });
  console.log("Admin account created/updated");
} finally {
  await db.$disconnect();
}
