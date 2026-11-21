import { expect, test, type Page } from "@playwright/test";
import { withSignInAccount } from "../../src/api/test-support/sign-in-account.js";

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/sign-in");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}

const roleLabels = {
  PUBLIC: "Grocery browsing account",
  STAFF: "Staff account",
  ADMIN: "Store manager",
} as const;

for (const role of ["PUBLIC", "STAFF", "ADMIN"] as const) {
  test(`${role} can sign in and loses profile access after signing out`, async ({ page }) => {
    await withSignInAccount(role, async ({ email, password }) => {
      await signIn(page, email, password);
      await expect(page).not.toHaveURL(/\/sign-in(?:\?|$)/);
      await page.goto("/account");
      await expect(page.getByLabel("Email address")).toHaveValue(email);
      await expect(page.getByText(roleLabels[role], { exact: true })).toBeVisible();

      await page.getByRole("button", { name: "Sign out", exact: true }).click();
      await page.getByRole("dialog").getByRole("button", { name: "Sign out", exact: true }).click();
      await expect(page).toHaveURL(/\/sign-in$/);
      await page.goto("/account");
      await expect(page).toHaveURL(/\/sign-in$/);
      await expect(page.getByRole("heading", { name: "Welcome back." })).toBeVisible();
    });
  });
}

test("an incorrect password leaves the account signed out", async ({ page }) => {
  await withSignInAccount("PUBLIC", async ({ email, password }) => {
    await signIn(page, email, password + "-wrong");
    await expect(page.locator("form").getByRole("alert")).toHaveText(
      "Check your email and password and try again.",
    );
    await page.goto("/account");
    await expect(page).toHaveURL(/\/sign-in$/);
  });
});
