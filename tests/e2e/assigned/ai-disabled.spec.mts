import { expect, test } from "../../support/qa.mjs";

test("without an AI service the catalog displays the unavailable state", async ({
  page,
  account,
}) => {
  const api = "http://localhost:4000/products/image-search";
  const status = await page.request.get(api + "/status");
  expect(await status.json()).toEqual({ enabled: false });
  await page.goto("/search?mode=image");
  await expect(
    page.getByText(
      "Photo search is unavailable right now. You can still search by name or product code.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Find matching products" })).toHaveCount(0);
  expect((await page.request.post(api, { headers: account.headers })).status()).toBe(503);
});
