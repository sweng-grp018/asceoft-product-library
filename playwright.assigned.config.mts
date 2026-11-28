import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e/assigned",
  globalSetup: "./tests/support/setup-assigned.mts",
  outputDir: "./.local/assigned-results",
  workers: 1,
  retries: 0,
  timeout: 60000,
  expect: { timeout: 15000 },
  use: { baseURL: "http://localhost:3000", browserName: "chromium", screenshot: "only-on-failure" },
});
