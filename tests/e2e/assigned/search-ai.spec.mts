import { test, expect, uniquePhoto, unavailablePhoto } from "../../support/qa.mjs";
for (const role of ["ADMIN", "STAFF"] as const) {
  test.describe(role, () => {
    test.use({ role });
    test("mocked shelf match and correction permissions", async ({ page, account, key, db }) => {
      const photo = uniquePhoto(key);
      const embedded = await page.request.post("http://127.0.0.1:18080/embed", {
        data: { imageBase64: photo.buffer.toString("base64") },
      });
      expect(embedded.ok()).toBe(true);
      const { embedding: vector } = await embedded.json();
      const product = await db.product.create({
        data: {
          name: key,
          sku: key,
          indexStatus: "INDEXED",
          images: {
            create: {
              objectKey: "qa/" + key,
              contentType: "image/png",
              embedding: vector,
              embeddingModel: "openclip-ViT-B-32-openai",
            },
          },
        },
      });
      await page.goto("/repository");
      await page.locator("#upload-photo").setInputFiles(photo);
      const put = page.waitForResponse(
        (r) => r.request().method() === "PUT" && r.url().includes("/shelf/"),
      );
      await page.getByRole("button", { name: "Save photo" }).click();
      const id = new URL((await put).url()).pathname.split("/").pop()!;
      await expect(page.getByText("Photo saved.", { exact: true })).toBeVisible();
      await page.goto("/detection");
      await page.getByLabel("Saved shelf photo").selectOption(id);
      await page.getByRole("button", { name: "Find products", exact: true }).click();
      await expect(page.getByText("1 item found", { exact: true })).toBeVisible();
      const user = await db.user.findUniqueOrThrow({ where: { email: account.email } });
      const history = await db.searchHistory.findFirstOrThrow({
        where: { userId: user.id, imageId: id },
        include: { matches: true },
      });
      expect(history.matches.map((m) => m.productId)).toEqual([product.id]);
      const save = page.getByRole("button", { name: "Save product choice" });
      if (role === "STAFF") {
        const denied = await page.request.patch(
          `http://localhost:4000/repository/searches/${history.id}/matches/${history.matches[0].id}`,
          {
            headers: account.headers,
            data: { productId: null },
          },
        );
        expect.soft(denied.status()).toBe(403);
        expect
          .soft(await db.detectionMatch.findUniqueOrThrow({ where: { id: history.matches[0].id } }))
          .toMatchObject({ productId: product.id, manuallySet: false });
        await expect(save).toBeHidden();
        return;
      }
      await page.getByLabel("Product", { exact: true }).selectOption("");
      await save.click();
      await expect(page.getByText("Product choice saved.")).toBeVisible();
      expect(
        await db.detectionMatch.findUnique({ where: { id: history.matches[0].id } }),
      ).toMatchObject({ productId: null, manuallySet: true });
    });
  });
}
test("unavailable inference gives an actionable message", async ({ page }) => {
  await page.goto("/search?mode=image");
  await expect(page.getByLabel("Product photo")).toBeEnabled();
  await page.getByLabel("Product photo").setInputFiles(unavailablePhoto);
  await page.getByRole("button", { name: "Find matching products" }).click();
  await expect(
    page.getByText("Photo search is unavailable right now. Please try again later."),
  ).toBeVisible();
  await expect(page.getByRole("region", { name: "Image search results" })).toHaveCount(0);
  await expect(page.getByRole("img", { name: "Selected product photo" })).toBeVisible();
});

test("image search displays the product matching the mock embedding", async ({ page, key, db }) => {
  const photo = uniquePhoto(key);
  const embedded = await page.request.post("http://127.0.0.1:18080/embed", {
    data: { imageBase64: photo.buffer.toString("base64") },
  });
  expect(embedded.ok()).toBe(true);
  const { embedding: vector } = await embedded.json();
  const product = await db.product.create({
    data: {
      name: key,
      sku: key,
      indexStatus: "INDEXED",
      images: {
        create: {
          objectKey: "qa/" + key,
          contentType: "image/png",
          embedding: vector,
          embeddingModel: "openclip-ViT-B-32-openai",
        },
      },
    },
  });
  await page.goto("/search?mode=image");
  await page.route("**/qa/" + key + "?*", (route) =>
    route.fulfill({ contentType: "image/png", body: photo.buffer }),
  );
  await expect(page.getByLabel("Product photo")).toBeEnabled();
  await page.getByLabel("Product photo").setInputFiles(photo);
  const preview = page.getByRole("img", { name: "Selected product photo" });
  await expect(preview).toHaveJSProperty("naturalWidth", 8);
  const previewUrl = await preview.getAttribute("src");
  await page.getByRole("button", { name: "Find matching products" }).click();
  const match = page
    .getByRole("region", { name: "Image search results" })
    .getByRole("link", { name: new RegExp(key) });
  await expect(match).toHaveAttribute("href", "/search/" + product.id);
  await expect(preview).toHaveAttribute("src", previewUrl!);
  await expect(match.getByRole("img", { name: key })).toHaveJSProperty("naturalWidth", 8);

  // A separate, missing object avoids reusing the browser's decoded thumbnail.
  await db.referenceImage.update({
    where: { objectKey: "qa/" + key },
    data: { objectKey: "qa/missing-" + key },
  });
  await page.getByRole("button", { name: "Find matching products" }).click();
  await expect(match.getByText("Photo unavailable")).toBeAttached();
  await page.getByLabel("Product photo").setInputFiles([]);
  await expect(preview).toHaveCount(0);
  await expect(match).toHaveCount(0);
});
