import assert from "node:assert/strict";
import { test } from "node:test";
import { passwordInput, registrationInput } from "./input.js";

test("public registration rejects injected roles and weak passwords", () => {
  const account = {
    name: "Test Shopper",
    email: "shopper@example.test",
    password: "Long-test-password-123",
  };
  assert.equal(registrationInput.safeParse({ ...account, role: "ADMIN" }).success, false);
  assert.equal(registrationInput.safeParse({ ...account, password: "short" }).success, false);
  assert.equal(registrationInput.safeParse({ ...account, name: "  " }).success, false);
  assert.equal(registrationInput.safeParse(account).success, true);
});

test("new passwords cannot be silently truncated by bcrypt", () => {
  assert.equal(passwordInput.safeParse({ password: "a".repeat(72) }).success, true);
  assert.equal(passwordInput.safeParse({ password: "a".repeat(72) + "different" }).success, false);
  assert.equal(passwordInput.safeParse({ password: "🙂".repeat(19) }).success, false);
});
