import { test, expect, uniquePhoto, unavailablePhoto } from "../../support/qa.mjs";
import type { Request } from "@playwright/test";
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
  await expect(page.getByLabel("Product photo", { exact: true })).toBeEnabled();
  await page.getByLabel("Product photo", { exact: true }).setInputFiles(unavailablePhoto);
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
  await expect(page.getByLabel("Product photo", { exact: true })).toBeEnabled();
  await page.getByLabel("Product photo", { exact: true }).setInputFiles(photo);
  const preview = page.getByRole("img", { name: "Selected product photo" });
  await expect(preview).toHaveJSProperty("naturalWidth", 8);
  const previewUrl = await preview.getAttribute("src");
  await page.getByRole("button", { name: "Find matching products" }).click();
  const match = page
    .getByRole("region", { name: "Image search results" })
    .getByRole("link", { name: new RegExp(key) });
  await expect(match).toHaveAttribute("href", "/search/" + product.id + "?from=image-search");
  await expect(preview).toHaveAttribute("src", previewUrl!);
  await expect(match.getByRole("img", { name: key })).toHaveJSProperty("naturalWidth", 8);
  const tabRequests: string[] = [];
  const recordTabRequest = (request: Request) => {
    if (request.headers()["next-action"] || new URL(request.url()).pathname === "/search") {
      tabRequests.push(request.url());
    }
  };
  page.on("request", recordTabRequest);
  await page.getByRole("tab", { name: "Search by name", exact: true }).click();
  await expect(page.getByRole("region", { name: "Image search results" })).toHaveCount(0);
  await page.getByLabel("Find grocery products", { exact: true }).fill(key + " draft");
  await page.getByRole("tab", { name: "Search by image", exact: true }).click();
  await expect(match).toBeVisible();
  await expect(preview).toHaveAttribute("src", previewUrl!);
  page.off("request", recordTabRequest);
  expect(tabRequests).toEqual([]);
  const enlargeUpload = page.getByRole("button", { name: "Enlarge uploaded image", exact: true });
  await enlargeUpload.focus();
  await page.keyboard.press("Enter");
  const uploadPopup = page.getByRole("dialog", { name: "Uploaded image", exact: true });
  await expect(uploadPopup.getByRole("img")).toHaveJSProperty("naturalWidth", 8);
  await expect(uploadPopup.getByRole("img")).toHaveAttribute("src", previewUrl!);
  await expect(uploadPopup.getByRole("img")).toHaveCSS("object-fit", "contain");
  await uploadPopup.getByRole("button", { name: "Close", exact: true }).click();
  await expect(uploadPopup).toHaveCount(0);
  await expect(enlargeUpload).toBeFocused();
  await expect(match).toBeVisible();
  await expect(preview).toHaveAttribute("src", previewUrl!);
  await expect(page).toHaveURL(/\/search\?mode=image$/);
  await match.click();
  await expect(page.getByRole("heading", { name: key, exact: true })).toBeVisible();
  await page.getByRole("button", { name: "View 1 product photo for " + key }).click();
  const gallery = page.getByRole("dialog", { name: "Product photos", exact: true });
  await gallery.getByRole("button", { name: "Enlarge photo 1 of " + key }).click();
  await page
    .getByRole("dialog", { name: key, exact: true })
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await gallery.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("link", { name: "Back to search results", exact: true }).click();
  await expect(page).toHaveURL(/\/search\?mode=image$/);
  await expect(page.getByRole("tab", { name: "Search by image", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(match).toBeVisible();
  await expect(preview).toHaveJSProperty("naturalWidth", 8);
  // The preview must load again after the search page's effects resume.
  await enlargeUpload.click();
  await expect(uploadPopup.getByRole("img")).toHaveJSProperty("naturalWidth", 8);
  await page.keyboard.press("Escape");
  await expect(uploadPopup).toHaveCount(0);
  expect(
    await page
      .getByLabel("Product photo", { exact: true })
      .evaluate((input: HTMLInputElement) => input.files?.[0]?.name),
  ).toBe(photo.name);

  // A separate, missing object avoids reusing the browser's decoded thumbnail.
  await db.referenceImage.update({
    where: { objectKey: "qa/" + key },
    data: { objectKey: "qa/missing-" + key },
  });
  await page.getByRole("button", { name: "Find matching products" }).click();
  await expect(match.getByText("Photo unavailable")).toBeAttached();
  await page.getByRole("button", { name: "Remove uploaded image", exact: true }).click();
  await expect(preview).toHaveCount(0);
  await expect(match).toHaveCount(0);
  await expect(uploadPopup).toHaveCount(0);
  const input = page.getByLabel("Product photo", { exact: true });
  await expect(input).toHaveValue("");
  await expect(input).toBeFocused();
  await page.getByRole("tab", { name: "Search by name", exact: true }).click();
  await expect(page.getByLabel("Find grocery products", { exact: true })).toHaveValue(
    key + " draft",
  );
  await page.getByRole("tab", { name: "Search by image", exact: true }).click();
  await expect(preview).toHaveCount(0);
  await expect(match).toHaveCount(0);
  await input.setInputFiles(photo);
  await expect(preview).toHaveJSProperty("naturalWidth", 8);
  await expect(match).toHaveCount(0);
  await page.getByRole("button", { name: "Find matching products" }).click();
  await expect(match).toBeVisible();
  await page.getByRole("link", { name: "My store", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/search\?mode=image$/);
  await expect(input).toHaveValue("");
  await expect(preview).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Image search results" })).toHaveCount(0);
  await page.getByRole("tab", { name: "Search by name", exact: true }).click();
  await expect(page.getByLabel("Find grocery products", { exact: true })).toHaveValue("");
  await page.goto("/products/" + product.id);
  await expect(page.getByRole("link", { name: "Back to products", exact: true })).toHaveAttribute(
    "href",
    "/products",
  );
  await expect(page.getByRole("link", { name: "Back to search results", exact: true })).toHaveCount(
    0,
  );
});
