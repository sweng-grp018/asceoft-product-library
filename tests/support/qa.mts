import { test as base, expect, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

export const qaUrl = "postgresql://lensistry:lensistry@127.0.0.1:5433/lensistry_qa";
export type Role = "STAFF" | "ADMIN" | "PUBLIC";
export const png = {
  name: "pack.png",
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAFUlEQVR4nGP8//8/AzbAhFV00EoAAFbUAw037MyjAAAAAElFTkSuQmCC",
    "base64",
  ),
};
export async function login(page: Page, email: string, password: string) {
  await page.goto("/sign-in");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}
export async function connect() {
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { PrismaClient } = await import("../../src/api/generated/prisma/client.js");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: qaUrl }) });
}
export const test = base.extend<{
  role: Role;
  db: Awaited<ReturnType<typeof connect>>;
  key: string;
  account: string;
}>({
  role: ["ADMIN", { option: true }],
  key: async ({}, use) => {
    await use("QA-" + randomUUID());
  },
  db: async ({ key }, use) => {
    const db = await connect();
    try {
      await use(db);
    } finally {
      try {
        await db.product.deleteMany({
          where: { OR: [{ sku: key }, { name: { startsWith: key } }] },
        });
        await db.user.deleteMany({ where: { email: key.toLowerCase() + "@example.test" } });
      } finally {
        await db.$disconnect();
      }
    }
  },
  account: async ({ page, role }, use) => {
    const cache = process.env.ASSIGNED_QA_SESSIONS;
    if (cache) {
      const sessions = JSON.parse(cache);
      await page.context().addCookies(sessions[role].cookies);
      const session = await (await page.request.get("/api/auth/session")).json();
      expect(session.user.role).toBe(role);
      await use(sessions[role].email);
      return;
    }
    const { withSignInAccount } = await import("../../src/api/test-support/sign-in-account.js");
    await withSignInAccount(role, async ({ email, password }) => {
      await login(page, email, password);
      await expect(page).not.toHaveURL(/\/sign-in(?:\?|$)/);
      const session = await (await page.request.get("/api/auth/session")).json();
      expect(session.user.role).toBe(role);
      await use(email);
    });
  },
});
export { expect };
