import { randomUUID } from "node:crypto";
import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const install = spawnSync("bun", ["install", "--frozen-lockfile"], { cwd: root, stdio: "inherit" });
if (install.error) throw install.error;
if (install.status !== 0) process.exit(install.status ?? 1);

// Both Node services share one Bun workspace. Install it once before Vercel
// starts services concurrently, so their installers do not race on node_modules.
const config = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"));
config.services.app.installCommand = "true";
config.services.api.installCommand = "true";
const configPath = join(root, `.vercel-local-${randomUUID()}.json`);
writeFileSync(configPath, JSON.stringify(config, null, 2), { flag: "wx" });

const child = spawn(
  "bun",
  ["x", "--no-install", "vercel", "dev", "-A", configPath, ...process.argv.slice(2)],
  {
    cwd: root,
    stdio: "inherit",
  },
);
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
child.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});
child.on("close", (code) => {
  unlinkSync(configPath);
  process.exitCode = code ?? 1;
});
