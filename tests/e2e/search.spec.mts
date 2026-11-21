import { expect, test, type Page } from "@playwright/test";
import { withSearchProducts } from "../../src/api/test-support/search-products.js";
import { withSignInAccount } from "../../src/api/test-support/sign-in-account.js";

async function search(page: Page, query: string) {
  await page.getByLabel("Find grocery products").fill(query);
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: query })).toBeVisible();
}

async function checkPublicSearch(page: Page, accountLink: string) {
  await page.goto("/search");
  await expect(page.getByRole("link", { name: accountLink, exact: true })).toBeVisible();

  await withSearchProducts(async (products) => {
    const target = products[25];
    const productLink = page.getByRole("link", { name: target.name, exact: true });
    const details = page.getByRole("link", { name: "View details", exact: true });

    await test.step("Find one product by its name and its product code", async () => {
      for (const query of [target.name, target.sku]) {
        await search(page, query);
        await expect(details).toHaveCount(1);
        await expect(productLink).toBeVisible();
      }
      await productLink.click();
      await expect(page.getByRole("heading", { name: target.name, exact: true })).toBeVisible();
      await expect(page.getByRole("definition").filter({ hasText: target.sku })).toBeVisible();
      await expect(page.getByRole("definition").filter({ hasText: target.brand })).toBeVisible();
      await page.getByRole("link", { name: "Back to products" }).click();
    });

    await test.step("Page through a brand's results", async () => {
      await search(page, target.brand);
      const pages = page.getByRole("navigation", { name: "Product pages" });
      await expect(details).toHaveCount(25);
      await expect(pages.getByRole("button", { name: "Previous" })).toBeDisabled();
      await expect(productLink).toHaveCount(0);
      await pages.getByRole("link", { name: "Next" }).click();
      await expect(pages).toContainText("Page 2 of 2");
      await expect(details).toHaveCount(1);
      await expect(productLink).toBeVisible();
      await expect(pages.getByRole("button", { name: "Next" })).toBeDisabled();
      await pages.getByRole("link", { name: "Previous" }).click();
      await expect(pages).toContainText("Page 1 of 2");
      await expect(page.getByLabel("Find grocery products")).toHaveValue(target.brand);
    });

    await test.step("Recover from a search with no results", async () => {
      await search(page, `Missing-${target.sku}`);
      await expect(page.getByRole("heading", { name: "No products found" })).toBeVisible();
      await expect(details).toHaveCount(0);
      await page.getByRole("link", { name: "Clear search" }).click();
      await expect(page.getByLabel("Find grocery products")).toHaveValue("");
      await expect(details.first()).toBeVisible();
    });
  });
}

test("a signed-out visitor can search and view public products", async ({ page }) => {
  await checkPublicSearch(page, "Sign in");
});

for (const role of ["PUBLIC", "STAFF", "ADMIN"] as const) {
  test(`${role} can search and view public products`, async ({ page }) => {
    await withSignInAccount(role, async ({ email, password }) => {
      await page.goto("/sign-in");
      await page.getByLabel("Email address").fill(email);
      await page.getByLabel("Password", { exact: true }).fill(password);
      await page.getByRole("button", { name: "Sign in", exact: true }).click();
      await expect(page).not.toHaveURL(/\/sign-in(?:\?|$)/);
      await checkPublicSearch(page, role === "PUBLIC" ? "Profile" : "My store");
    });
  });
}
