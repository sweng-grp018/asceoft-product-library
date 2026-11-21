import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client.js";

export async function withSignInAccount(
  role: "PUBLIC" | "STAFF" | "ADMIN",
  run: (credentials: { email: string; password: string }) => Promise<void>,
) {
  // Use the Compose QA database, independent of the application's .env.
  const db = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: "postgresql://lensistry:lensistry@127.0.0.1:5433/lensistry_qa",
    }),
  });
  const email = `qa-sign-in-${randomUUID()}@example.test`;
  const password = randomUUID();
  try {
    const user = await db.user.create({
      data: { name: "QA Sign In", email, role, passwordHash: await hash(password, 12) },
    });
    try {
      await run({ email, password });
    } finally {
      await db.user.delete({ where: { id: user.id } });
    }
  } finally {
    await db.$disconnect();
  }
}
