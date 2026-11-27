import { test, expect, png, unavailablePhoto } from "../../support/qa.mjs";
for (const role of ["ADMIN", "STAFF", "PUBLIC"] as const) {
  test.describe(role, () => {
    test.use({ role });
    test("reference upload and preparation follow role", async ({ page, account, key, db }) => {
      const product = await db.product.create({ data: { name: key, sku: key } });
      if (role === "STAFF") {
        // Existing reference makes the prepare button eligible if permissions are wrong.
        await db.referenceImage.create({
          data: { productId: product.id, objectKey: "qa/" + key, contentType: "image/png" },
        });
      }
      await page.goto("/products/" + product.id);
      const prepare = page.getByRole("button", { name: "Prepare photos for search" });
      if (role !== "ADMIN") {
        if (role === "PUBLIC") await expect(page).toHaveURL(/\/search$/);
        else await expect(page.getByRole("heading", { name: key, exact: true })).toBeVisible();
        await expect(page.locator("#upload-photo")).toHaveCount(0);
        await expect(prepare).toHaveCount(0);
        const url = "http://localhost:4000/products/" + product.id;
        for (const path of ["/images", "/index"]) {
          const denied = await page.request.post(url + path, {
            headers: account.headers,
            data: { contentType: "image/png" },
          });
          expect(denied.status(), path).toBe(403);
        }
        expect(
          (await db.product.findUniqueOrThrow({ where: { id: product.id } })).indexStatus,
        ).toBe("PENDING");
        return;
      }
      await expect(page.getByText("Not ready", { exact: true })).toBeVisible();
      await page.locator("#upload-photo").setInputFiles(png);
      await page.getByRole("button", { name: "Save photo" }).click();
      await prepare.click();
      await expect(page.getByText("Ready", { exact: true })).toBeVisible();
      await page.reload();
      await expect(page.getByText("Ready", { exact: true })).toBeVisible();
      expect((await db.product.findUniqueOrThrow({ where: { id: product.id } })).indexStatus).toBe(
        "INDEXED",
      );
    });
  });
}

test("failed preparation is visible after reload", async ({ page, key, db }) => {
  const product = await db.product.create({ data: { name: key, sku: key } });
  await page.goto("/products/" + product.id);
  await page.getByLabel("Photo", { exact: true }).setInputFiles(unavailablePhoto);
  await page.getByRole("button", { name: "Save photo" }).click();
  await page.getByRole("button", { name: "Prepare photos for search" }).click();
  await expect(page.getByText(/Indexing failed/i)).toBeVisible();
  await page.reload();
  await expect(page.getByText("Needs attention", { exact: true })).toBeVisible();
  expect((await db.product.findUniqueOrThrow({ where: { id: product.id } })).indexStatus).toBe(
    "FAILED",
  );
});
