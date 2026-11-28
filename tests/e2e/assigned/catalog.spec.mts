import { test, expect, type Role } from "../../support/qa.mjs";

for (const role of ["STAFF", "ADMIN", "PUBLIC"] as Role[]) {
  test.describe(role, () => {
    test.use({ role });
    test("catalog creation follows role", async ({ page, key, db }) => {
      await page.goto("/products/new");
      if (role === "PUBLIC") {
        await expect(page).toHaveURL(/\/search$/);
        return;
      }
      await expect(page.getByRole("heading", { name: "Add a product" })).toBeVisible();
      await page.getByLabel(/Product name/).fill(key);
      await page.getByRole("button", { name: "Save product" }).click();
      await expect.poll(() => db.product.count({ where: { name: key } })).toBe(1);
      await expect(page.getByRole("heading", { name: key, exact: true })).toBeVisible();
    });
    test("only Admin may edit the product", async ({ page, account, key, db }) => {
      const product = await db.product.create({ data: { sku: key, name: key } });
      const headers = account.headers;
      const url = "http://localhost:4000/products/" + product.id;
      const edit = await page.request.patch(url, { headers, data: { name: key + " revised" } });
      expect(edit.status()).toBe(role === "ADMIN" ? 200 : 403);
      expect((await db.product.findUniqueOrThrow({ where: { id: product.id } })).name).toBe(
        role === "ADMIN" ? key + " revised" : key,
      );
    });
    test("only Admin may soft-delete a product", async ({ page, account, key, db }) => {
      const product = await db.product.create({ data: { sku: key, name: key } });
      const headers = account.headers;
      const url = "http://localhost:4000/products/" + product.id;
      const deletion = await page.request.delete(url, { headers });
      expect(deletion.status()).toBe(role === "ADMIN" ? 204 : 403);
      expect(
        await db.product.count({ where: { id: product.id } }),
        "Soft deletion retains the product row",
      ).toBe(1);
      const list = await (
        await page.request.get("http://localhost:4000/products", { params: { q: key } })
      ).json();
      expect(list.total).toBe(role === "ADMIN" ? 0 : 1);
    });
  });
}
test("duplicate product code is rejected", async ({ account, page, key, db }) => {
  await db.product.create({ data: { sku: key.toUpperCase(), name: key } });
  const response = await page.request.post("http://localhost:4000/products", {
    headers: account.headers,
    data: { sku: key, name: key + " duplicate" },
  });
  expect(response.status()).toBe(409);
  expect(await db.product.count({ where: { sku: key.toUpperCase() } })).toBe(1);
});
