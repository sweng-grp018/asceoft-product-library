import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const cli = createRequire(import.meta.url).resolve("@playwright/test/cli");
const testArgs = ["test", "--config=playwright.assigned.config.mts", ...args];
const env = {
  ...process.env,
  API_INTERNAL_URL: "http://localhost:4000",
  DATABASE_URL: "postgresql://lensistry:lensistry@127.0.0.1:5433/lensistry_qa",
  QA_PHASE: "discovery",
};

function run(command, argv, options = {}) {
  const result = spawnSync(command, argv, { stdio: "inherit", env, ...options });
  if (result.error) throw result.error;
  return result;
}

if (!existsSync("src/api/generated/prisma/client.ts")) {
  const generate = run("bun", ["run", "db:generate"]);
  if (generate.status !== 0) process.exit(generate.status ?? 1);
}

if (args.includes("--list") && !args.some((arg) => arg.startsWith("--reporter")))
  testArgs.push("--reporter=list");
if (args.includes("--list") || args.includes("--help")) {
  process.exit(run(process.execPath, [cli, ...testArgs]).status ?? 1);
}

// Discover with the user's file/grep filters before starting any services.
const discovery = run(process.execPath, [cli, ...testArgs, "--list", "--reporter=json"], {
  stdio: ["inherit", "pipe", "inherit"],
  encoding: "utf8",
});
if (discovery.status !== 0) {
  console.error(discovery.stdout);
  process.exit(discovery.status ?? 1);
}
function projectsIn(suite) {
  return [
    ...(suite.specs ?? []).flatMap((spec) => spec.tests.map((test) => test.projectName)),
    ...(suite.suites ?? []).flatMap(projectsIn),
  ];
}
const projects = new Set(projectsIn(JSON.parse(discovery.stdout)));
// Discovery already applied project filters. Each server now runs its own subset.
let projectValues = false;
const executionArgs = testArgs.filter((arg) => {
  if (arg.startsWith("-")) projectValues = arg === "--project";
  return !projectValues && !arg.startsWith("--project=");
});
const migration = run("bun", ["run", "--cwd", "src/api", "db:deploy"]);
if (migration.status !== 0) process.exit(migration.status ?? 1);

mkdirSync(".local", { recursive: true });
const blobs = mkdtempSync(resolve(".local/qa-blobs-"));
// Fresh API processes keep real login limits intact. The offline case needs AI disabled.
for (const [phase, candidates] of Object.entries({
  accounts: ["accounts"],
  browsing: ["browsing", "ai-disabled"],
  workflows: ["workflows"],
})) {
  const selected = candidates.filter((project) => projects.has(project));
  if (!selected.length) continue;
  const result = run(
    process.execPath,
    [
      cli,
      ...executionArgs,
      ...selected.map((project) => "--project=" + project),
      "--reporter=list,blob",
    ],
    {
      env: {
        ...env,
        QA_PHASE: phase,
        QA_SESSIONS: String(
          selected.some((project) => ["workflows", "ai-disabled"].includes(project)),
        ),
        PLAYWRIGHT_BLOB_OUTPUT_FILE: join(blobs, phase + ".zip"),
      },
    },
  );
  if (result.status !== 0) process.exitCode = 1;
}
const report = run(process.execPath, [cli, "merge-reports", "--reporter=html", blobs], {
  env: {
    ...env,
    PLAYWRIGHT_HTML_OPEN: "never",
    PLAYWRIGHT_HTML_OUTPUT_DIR: resolve(".local/qa-report"),
  },
});
if (report.status === 0) rmSync(blobs, { recursive: true });
else process.exitCode = 1;
