import { test, expect, png } from "../../support/qa.mjs";

test("search tabs keep an unsubmitted upload and name-search progress", async ({
  page,
  key,
  db,
}) => {
  await db.product.create({ data: { name: key, sku: key } });
  await page.goto("/search?q=" + encodeURIComponent(key));
  const nameTab = page.getByRole("tab", { name: "Search by name", exact: true });
  const imageTab = page.getByRole("tab", { name: "Search by image", exact: true });
  const nameInput = page.getByLabel("Find grocery products", { exact: true });
  await expect(nameInput).toHaveValue(key);
  await expect(page.getByRole("link", { name: key, exact: true })).toBeVisible();
  await nameInput.fill(key + " draft");

  await imageTab.click();
  const fileInput = page.getByLabel("Product photo", { exact: true });
  await expect(fileInput).toBeEnabled();
  await fileInput.setInputFiles(png);
  const preview = page.getByRole("img", { name: "Selected product photo" });
  await expect(preview).toHaveJSProperty("naturalWidth", 8);
  const previewUrl = await preview.getAttribute("src");
  await nameTab.click();
  await expect(nameInput).toHaveValue(key + " draft");
  await expect(page.getByRole("link", { name: key, exact: true })).toBeVisible();
  await expect(page.getByRole("tabpanel")).toHaveCount(1);

  // Radix's keyboard navigation must preserve the same mounted forms.
  await nameTab.press("ArrowRight");
  await expect(imageTab).toHaveAttribute("aria-selected", "true");
  await expect(preview).toHaveAttribute("src", previewUrl!);
  expect(await fileInput.evaluate((input: HTMLInputElement) => input.files?.[0]?.name)).toBe(
    png.name,
  );
  await expect(page.getByRole("region", { name: "Image search results" })).toHaveCount(0);
  await expect(page.getByRole("tabpanel")).toHaveCount(1);

  await page.getByRole("link", { name: "My store", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/search$/);
  await expect(nameInput).toHaveValue("");
  await imageTab.click();
  await expect(fileInput).toHaveValue("");
  await expect(preview).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Image search results" })).toHaveCount(0);
  await fileInput.setInputFiles(png);
  await expect(preview).toBeVisible();
  await page.getByRole("link", { name: "My store", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  const browseProducts = page.getByRole("link", { name: "Browse products", exact: true });
  const sidebarToggle = page.getByRole("button", { name: "Toggle Sidebar", exact: true });
  await expect(sidebarToggle).toBeVisible();
  if (!(await browseProducts.isVisible())) {
    await sidebarToggle.click();
  }
  await browseProducts.click();
  await expect(page).toHaveURL(/\/search$/);
  await expect(nameInput).toHaveValue("");
  await imageTab.click();
  await expect(fileInput).toHaveValue("");
  await expect(preview).toHaveCount(0);
});

test("returning through older browser history starts with an unfiltered catalog", async ({
  page,
  key,
  db,
}) => {
  await db.product.create({ data: { name: key, sku: key } });
  await page.goto("/search?q=" + encodeURIComponent(key));
  const nameInput = page.getByLabel("Find grocery products", { exact: true });
  await expect(nameInput).toHaveValue(key);
  await page.getByRole("link", { name: "My store", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  for (const [label, path] of [
    ["Products", "/products"],
    ["Photos", "/repository"],
    ["Staff", "/users"],
  ]) {
    await page.getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(path + "$"));
  }
  for (const path of ["/repository", "/products", "/dashboard", "/search"]) {
    await page.goBack();
    await expect(page).toHaveURL(new RegExp(path + "$"));
  }
  await expect(nameInput).toHaveValue("");
});
