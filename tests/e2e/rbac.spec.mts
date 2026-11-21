import { expect, test, type Page } from "@playwright/test";
import { withSignInAccount } from "../../src/api/test-support/sign-in-account.js";

const apiURL = process.env.API_INTERNAL_URL ?? process.env.API_URL ?? "http://localhost:4000";
const workspacePages = [
  ["/products", "Products"],
  ["/repository", "Photos"],
  ["/detection", "Find from a photo"],
] as const;

async function apiStatus(page: Page, path: string, token?: string) {
  const response = await page.request.get(new URL(path, apiURL).href, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.status();
}

test("signed-out visitors must sign in to open the dashboard", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("heading", { name: "Welcome back." })).toBeVisible();
  await expect(page.getByText("Products in your library", { exact: true })).toBeHidden();
  expect(await apiStatus(page, "/products/summary")).toBe(401);
});

for (const role of ["PUBLIC", "STAFF", "ADMIN"] as const) {
  test(`${role} sees only its permitted navigation, pages and dashboard data`, async ({ page }) => {
    await withSignInAccount(role, async ({ email, password }) => {
      await page.goto("/sign-in");
      await page.getByLabel("Email address").fill(email);
      await page.getByLabel("Password", { exact: true }).fill(password);
      await page.getByRole("button", { name: "Sign in", exact: true }).click();
      await expect(page).not.toHaveURL(/\/sign-in(?:\?|$)/);

      const session = await (await page.request.get("/api/auth/session")).json();
      expect(session.user.role).toBe(role);
      expect(Boolean(session.accessToken)).toBe(true);
      const internal = role !== "PUBLIC";
      const admin = role === "ADMIN";

      await test.step("Express enforces access to dashboard, shelf photos and search history", async () => {
        for (const [path, allowed] of [
          ["/products/summary", admin],
          ["/repository", internal],
          ["/repository/searches/recent", internal],
        ] as const) {
          expect
            .soft(await apiStatus(page, path, session.accessToken), path)
            .toBe(allowed ? 200 : 403);
        }
      });

      await test.step("Public browsing and internal workspace pages", async () => {
        await page.goto("/search");
        await expect(page.getByRole("heading", { name: "Browse products" })).toBeVisible();
        for (const [path, title] of workspacePages) {
          await page.goto(path);
          if (internal) {
            await expect(
              page.getByRole("heading", { name: title, exact: true }).first(),
            ).toBeVisible();
            await expect(
              page.getByRole("link", { name: title, exact: true }).first(),
            ).toBeVisible();
          } else {
            await expect(page).toHaveURL(/\/search$/);
            await expect(page.getByRole("link", { name: title, exact: true })).toBeHidden();
          }
        }
        const overview = page.getByRole("link", { name: "Overview", exact: true });
        if (admin) await expect(overview).toBeVisible();
        else await expect.soft(overview).toBeHidden({ timeout: 2000 });
      });

      await test.step("Only Admin can open the dashboard and see its totals", async () => {
        await page.goto("/dashboard");
        const totalLabel = page.getByText("Products in your library", { exact: true });
        if (admin) {
          await expect(page.getByRole("heading", { name: "Overview", exact: true })).toBeVisible();
          const summary = await page.request.get(new URL("/products/summary", apiURL).href, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          });
          expect(summary.status()).toBe(200);
          const { total } = await summary.json();
          const card = page.locator('[data-slot="card"]').filter({ has: totalLabel });
          await expect(card.getByText(total.toLocaleString(), { exact: true })).toBeVisible();
        } else {
          await expect
            .soft(page.getByRole("heading", { name: "Overview", exact: true }))
            .toBeHidden({ timeout: 3000 });
          await expect.soft(totalLabel).toBeHidden({ timeout: 3000 });
          if (role === "PUBLIC") await expect(page).toHaveURL(/\/search$/);
        }
      });

      await test.step("Only Staff and Admin can open product creation", async () => {
        await page.goto("/products/new");
        if (internal) {
          await expect(page).toHaveURL(/\/products\/new$/, { timeout: 3000 });
          await expect(page.getByRole("heading", { name: /Add (a )?product/i })).toBeVisible();
        } else {
          await expect(page).toHaveURL(/\/search$/);
        }
      });
    });
  });
}
