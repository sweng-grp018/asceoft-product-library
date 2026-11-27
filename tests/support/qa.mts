import { test as base, expect, type Page, type Response } from "@playwright/test";
import { crc32 } from "node:zlib";
import { deleteUploadedFixture } from "../../src/api/test-support/qa-storage.js";
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
// Insert a valid PNG text chunk before IEND, giving each test a distinct image.
export function uniquePhoto(key: string) {
  const text = Buffer.from("tEXtFixture\0" + key);
  const chunk = Buffer.alloc(text.length + 8);
  chunk.writeUInt32BE(text.length - 4);
  text.copy(chunk, 4);
  chunk.writeUInt32BE(crc32(text), chunk.length - 4);
  return {
    ...png,
    buffer: Buffer.concat([png.buffer.subarray(0, -12), chunk, png.buffer.subarray(-12)]),
  };
}
export const unavailablePhoto = {
  ...png,
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEklEQVR4nGP8z4AdMOEQH6QSAM1BAQ/oQeJvAAAAAElFTkSuQmCC",
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
  account: { email: string; headers: { Authorization: string } };
  uploadedObjects: void;
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
  account: [
    async ({ page, role }, use) => {
      const cache = process.env.ASSIGNED_QA_SESSIONS;
      if (!cache) throw new Error("Start this suite with bun run test:qa.");
      const saved = JSON.parse(cache)[role];
      await page.context().addCookies(saved.cookies);
      const session = await (await page.request.get("/api/auth/session")).json();
      expect(session.user).toMatchObject({ email: saved.email, role });
      await use({
        email: saved.email,
        headers: { Authorization: "Bearer " + session.accessToken },
      });
    },
    { auto: true },
  ],
  uploadedObjects: [
    async ({ page, db }, use) => {
      const keys = new Set<string>();
      function record(response: Response) {
        const url = new URL(response.url());
        if (
          response.request().method() === "PUT" &&
          response.ok() &&
          url.origin === "http://127.0.0.1:9000" &&
          url.pathname.startsWith("/lensistry-qa/")
        )
          keys.add(url.pathname.slice("/lensistry-qa/".length));
      }
      page.on("response", record);
      try {
        await use();
      } finally {
        page.off("response", record);
        for (const key of keys) {
          if (key.startsWith("shelf/")) {
            const imageId = key.slice("shelf/".length);
            await db.searchHistory.deleteMany({ where: { imageId } });
            await db.repositoryImage.deleteMany({ where: { id: imageId } });
          }
          await deleteUploadedFixture(key);
        }
      }
    },
    { auto: true },
  ],
});
export { expect };
