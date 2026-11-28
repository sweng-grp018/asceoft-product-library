import { test, expect } from "../../support/qa.mjs";

test.use({ role: "PUBLIC" });

test("product photos open a gallery and a separate enlarged preview", async ({ page, key, db }) => {
  const product = await db.product.create({
    data: {
      name: key,
      sku: key,
      brand: "Test groceries",
      images: {
        create: [
          { objectKey: "qa/" + key + "/front", contentType: "image/png", isPrimary: true },
          { objectKey: "qa/" + key + "/back", contentType: "image/png" },
          { objectKey: "qa/" + key + "/missing", contentType: "image/png" },
        ],
      },
    },
  });
  await page.route("**/qa/" + key + "/**", async (route) => {
    if (new URL(route.request().url()).pathname.endsWith("/missing")) {
      await route.fulfill({ status: 404 });
      return;
    }
    await route.fulfill({ path: "public/images/yellowChips.png", contentType: "image/png" });
  });
  await page.goto("/search/" + product.id);
  const detailsUrl = page.url();
  const openGallery = page.getByRole("button", { name: "View 3 product photos for " + key });
  await expect(openGallery.getByRole("img", { name: key, exact: true })).toBeVisible();
  await expect(openGallery).toContainText("3 photos");
  await openGallery.click();
  const gallery = page.getByRole("dialog", { name: "Product photos", exact: true });
  await expect(gallery).toBeVisible();
  await expect(gallery.getByRole("button", { name: /^Enlarge photo/ })).toHaveCount(3);
  await expect(gallery.getByText("Photo unavailable")).toBeVisible();
  const firstPhoto = gallery.getByRole("button", { name: "Enlarge photo 1 of " + key });
  await firstPhoto.click();
  const preview = page.getByRole("dialog", { name: key, exact: true });
  await expect(preview).toBeVisible();
  // Radix hides the underlying dialog from assistive technology while the preview is open.
  await expect(page.getByRole("dialog", { name: "Product photos", exact: true })).toHaveCount(0);
  await expect(preview.getByRole("img")).toHaveCSS("object-fit", "contain");
  await preview.getByRole("button", { name: "Close", exact: true }).click();
  await expect(preview).toHaveCount(0);
  await expect(gallery).toBeVisible();
  await expect(firstPhoto).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  const tiles = gallery.getByRole("button", { name: /^Enlarge photo/ });
  await expect
    .poll(() =>
      tiles.evaluateAll((elements) => {
        const first = elements[0].getBoundingClientRect();
        const second = elements[1].getBoundingClientRect();
        return second.top - first.bottom;
      }),
    )
    .toBeGreaterThan(0);
  await gallery.getByRole("button", { name: "Close", exact: true }).click();
  await expect(gallery).toHaveCount(0);
  await expect(openGallery).toBeFocused();
  expect(page.url()).toBe(detailsUrl);

  // A single photo uses the same gallery and preview interaction.
  await db.referenceImage.deleteMany({
    where: { productId: product.id, isPrimary: false },
  });
  await page.reload();
  await page.getByRole("button", { name: "View 1 product photo for " + key }).click();
  await expect(gallery.getByRole("button", { name: /^Enlarge photo/ })).toHaveCount(1);
  await gallery.getByRole("button", { name: /^Enlarge photo/ }).click();
  await expect(preview).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(preview).toHaveCount(0);
  await expect(gallery).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(gallery).toHaveCount(0);
});

test("a product without reference photos shows the empty state", async ({ page, key, db }) => {
  const product = await db.product.create({ data: { name: key, sku: key } });
  await page.goto("/search/" + product.id);
  await expect(page.getByText("No photos available", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /^View .* product photo/ })).toHaveCount(0);
});
