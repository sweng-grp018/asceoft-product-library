import { test, expect, login } from "../../support/qa.mjs";
test("Admin provisions Staff and replaces the sign-in password", async ({
  page,
  browser,
  baseURL,
  key,
  db,
}) => {
  const email = key.toLowerCase() + "@example.test";
  await page.goto("/users");
  await page.getByLabel("Full name").fill(key);
  await page.getByLabel("Email address").fill(email);
  await page.locator("#staff-password").fill(key);
  await page.getByRole("button", { name: "Create staff account" }).click();
  const card = page.locator('[data-slot="card"]').filter({ hasText: email });
  await expect(card).toBeVisible();
  async function checkPassword(password: string, accepted: boolean) {
    const context = await browser.newContext({ baseURL });
    try {
      const member = await context.newPage();
      await login(member, email, password);
      if (accepted) {
        await expect(member).not.toHaveURL(/\/sign-in(?:\?|$)/);
        const session = await (await member.request.get("/api/auth/session")).json();
        expect(session.user.role).toBe("STAFF");
      } else {
        await expect(member.locator("form").getByRole("alert")).toContainText(
          "Check your email and password",
        );
      }
    } finally {
      await context.close();
    }
  }

  const before = await db.user.findUniqueOrThrow({ where: { email } });
  const original = await browser.newContext({ baseURL });
  try {
    const member = await original.newPage();
    await login(member, email, key);
    await expect(member).not.toHaveURL(/\/sign-in(?:\?|$)/);
    const session = await (await member.request.get("/api/auth/session")).json();
    expect(session.user.role).toBe("STAFF");
    const headers = { Authorization: "Bearer " + session.accessToken };
    const me = () => member.request.get("http://localhost:4000/auth/me", { headers });
    expect((await me()).status()).toBe(200);
    await card.getByText("Reset password", { exact: true }).click();
    await card.getByLabel("New password").fill(key + "-new");
    await card.getByRole("button", { name: "Save new password" }).click();
    await expect
      .poll(async () => (await db.user.findUniqueOrThrow({ where: { email } })).passwordHash)
      .not.toBe(before.passwordHash);
    expect((await me()).status()).toBe(401);
    await member.goto("/account");
    await expect(member).toHaveURL(/\/sign-in(?:\?|$)/);
  } finally {
    await original.close();
  }
  await checkPassword(key, false);
  await checkPassword(key + "-new", true);
});
