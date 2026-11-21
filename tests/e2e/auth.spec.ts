import { randomUUID } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";

const password = "QA browsing password 123!";

async function submitRegistration(page: Page, email: string, confirmation = password) {
  await page.goto("/sign-up");
  await page.getByLabel("Full name").fill("QA Browser");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password", { exact: true }).fill(confirmation);
  await page.getByRole("button", { name: "Create account" }).click();
}

test("a new account can sign in and browse with Public access", async ({ page }) => {
  const email = `qa-${randomUUID()}@example.test`;
  await submitRegistration(page, email);
  await expect(page.getByRole("heading", { name: "Your account is ready." })).toBeVisible();

  await page.getByRole("link", { name: "Sign in", exact: true }).click();
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/search$/);
  await expect(page.getByRole("link", { name: "Profile", exact: true })).toHaveAttribute(
    "href",
    "/account",
  );

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/search$/);
});

test("registering an existing email shows a duplicate account error", async ({ page }) => {
  const email = `qa-${randomUUID()}@example.test`;
  await submitRegistration(page, email);
  await expect(page.getByRole("heading", { name: "Your account is ready." })).toBeVisible();
  await submitRegistration(page, email);
  await expect(page.locator("form").getByRole("alert")).toHaveText(
    /^(This record already exists\.|An account already uses this email address\.)$/,
  );
});

test("mismatched passwords keep the user on the registration form", async ({ page }) => {
  await submitRegistration(page, `qa-${randomUUID()}@example.test`, "Different password 456!");
  await expect(page.locator("form").getByRole("alert")).toHaveText("Your passwords do not match.");
  await expect(page.getByRole("button", { name: "Create account" })).toBeEnabled();
});
