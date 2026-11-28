import { test, expect } from "../../support/qa.mjs";

test.use({ role: "PUBLIC" });

test("catalog cards show the first uploaded photo and fall back for missing photos", async ({
  page,
  key,
  db,
}) => {
  const multiple = await db.product.create({
    data: {
      name: key + " Multiple photos",
      sku: key + "-MULTI",
      images: {
        create: [
          {
            objectKey: "qa/" + key + "/first.png",
            contentType: "image/png",
            createdAt: new Date("2026-01-01"),
          },
          {
            objectKey: "qa/" + key + "/later.png",
            contentType: "image/png",
            createdAt: new Date("2026-01-02"),
            isPrimary: true,
          },
        ],
      },
    },
  });
  const single = await db.product.create({
    data: {
      name: key + " Single photo",
      sku: key + "-SINGLE",
      images: { create: { objectKey: "qa/" + key + "/single.png", contentType: "image/png" } },
    },
  });
  const missing = await db.product.create({
    data: {
      name: key + " Missing photo",
      sku: key + "-MISSING",
      images: { create: { objectKey: "qa/" + key + "/missing.png", contentType: "image/png" } },
    },
  });
  const empty = await db.product.create({
    data: { name: key + " No photos", sku: key + "-EMPTY" },
  });
  await page.route("**/qa/" + key + "/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/missing.png")) {
      await route.fulfill({ status: 404 });
      return;
    }
    await route.fulfill({
      path: path.endsWith("/single.png")
        ? "public/images/orangeChips.png"
        : "public/images/yellowChips.png",
      contentType: "image/png",
    });
  });
  await page.goto("/search?q=" + encodeURIComponent(key));
  const cards = page
    .getByRole("tabpanel", { name: "Search by name", exact: true })
    .locator('[data-slot="card"]');
  const multipleCard = cards.filter({
    has: page.getByRole("link", { name: multiple.name, exact: true }),
  });
  const firstPhoto = multipleCard.getByRole("img", { name: multiple.name, exact: true });
  await expect(firstPhoto).toBeVisible();
  await expect
    .poll(() => firstPhoto.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);
  await expect(firstPhoto).toHaveAttribute("src", /\/first\.png\?/);
  await expect(firstPhoto).toHaveCSS("object-fit", "contain");
  const singleCard = cards.filter({
    has: page.getByRole("link", { name: single.name, exact: true }),
  });
  await expect(singleCard.getByRole("img")).toHaveAttribute("src", /\/single\.png\?/);
  await expect
    .poll(() =>
      singleCard.getByRole("img").evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);
  for (const product of [missing, empty]) {
    const card = cards.filter({ has: page.getByRole("link", { name: product.name, exact: true }) });
    await expect(card.locator('[data-slot="card-header"] svg')).toBeVisible();
    await expect(card.getByRole("img")).toHaveCount(0);
  }
  const heights = await cards
    .locator('[data-slot="card-header"] > div:first-child')
    .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().height));
  expect(heights).toHaveLength(4);
  expect(new Set(heights).size).toBe(1);

  const response = await page.request.get(
    "http://localhost:4000/products?q=" + encodeURIComponent(key),
  );
  expect(response.ok()).toBe(true);
  const result = await response.json();
  const listedProduct = result.products.find(
    (product: { id: string }) => product.id === multiple.id,
  );
  expect(listedProduct.imageUrl).toContain("/first.png?");
  expect(listedProduct.images).toHaveLength(2);
  for (const image of listedProduct.images) expect(image).not.toHaveProperty("objectKey");
  await multipleCard.getByRole("link", { name: multiple.name, exact: true }).click();
  await expect(page.getByRole("heading", { name: multiple.name, exact: true })).toBeVisible();
});
