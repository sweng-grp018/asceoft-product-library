import { randomUUID } from "node:crypto";
import { defineConfig } from "@playwright/test";

const web = "http://localhost:3000";
const api = "http://localhost:4000";
const mock = "http://127.0.0.1:18080";

const accountSpecs = ["**/auth.spec.ts", "**/sign-in.spec.mts"];
const offlineSpec = "**/ai-disabled.spec.mts";
const assignedDir = "./tests/e2e/assigned";
const phase = process.env.QA_PHASE;
const offline = phase ? phase !== "workflows" : process.env.QA_AI_MODE === "disabled";
const workflows = { name: "workflows", testDir: assignedDir, testIgnore: offlineSpec };
const unavailable = { name: "ai-disabled", testDir: assignedDir, testMatch: offlineSpec };

export default defineConfig({
  testDir: "./tests/e2e",
  projects: phase
    ? [
        { name: "accounts", testMatch: accountSpecs },
        { name: "browsing", testIgnore: [...accountSpecs, "**/assigned/**"] },
        workflows,
        unavailable,
      ]
    : [offline ? unavailable : workflows],
  globalSetup:
    !phase || process.env.QA_SESSIONS === "true" ? "./tests/support/setup-assigned.mts" : undefined,
  outputDir: phase
    ? ".local/qa-results/" + phase
    : offline
      ? ".local/ai-disabled-results"
      : ".local/assigned-results",
  workers: 1,
  retries: 0,
  timeout: 60000,
  expect: { timeout: 15000 },
  reporter: [
    ["list"],
    [
      "html",
      {
        open: "never",
        outputFolder: offline ? ".local/ai-disabled-report" : ".local/assigned-report",
      },
    ],
  ],
  use: { baseURL: web, browserName: "chromium", screenshot: "only-on-failure" },
  webServer: [
    ...(offline
      ? []
      : [
          {
            command: "node tests/support/mock-ai.mjs",
            url: mock + "/health",
            reuseExistingServer: false,
          },
        ]),
    {
      command: "node scripts/dev-local.mjs",
      url: web + "/sign-in",
      reuseExistingServer: false,
      timeout: 120000,
      env: {
        DATABASE_URL: "postgresql://lensistry:lensistry@127.0.0.1:5433/lensistry_qa",
        AI_SERVICE_URL: offline ? "" : mock,
        PORT: "3000",
        API_PORT: "4000",
        API_URL: api,
        API_INTERNAL_URL: api,
        WEB_ORIGIN: web,
        AUTH_URL: web,
        AUTH_SECRET: randomUUID(),
        JWT_SECRET: randomUUID(),
        S3_ENDPOINT: "http://127.0.0.1:9000",
        S3_BUCKET: "lensistry-qa",
        S3_ACCESS_KEY_ID: "S3RVER",
        S3_SECRET_ACCESS_KEY: "S3RVER",
      },
    },
  ],
});
