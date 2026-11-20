import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, join } from "node:path";
import { loadEnvFile } from "node:process";
import { setTimeout } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const lockPath = join(root, ".local/dev.lock");
const lockValue = String(process.pid);
let ownsLock = false;

function releaseLock() {
  if (ownsLock && existsSync(lockPath) && readFileSync(lockPath, "utf8") === lockValue) {
    unlinkSync(lockPath);
  }
}

async function acquireLock() {
  mkdirSync(dirname(lockPath), { recursive: true });
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      writeFileSync(lockPath, lockValue, { flag: "wx" });
      ownsLock = true;
      process.on("exit", releaseLock);
      return true;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      // Another launcher may still be writing its process ID.
      await setTimeout(100);
      if (!existsSync(lockPath)) continue;
      const owner = Number(readFileSync(lockPath, "utf8"));
      if (!Number.isSafeInteger(owner) || owner <= 0) {
        throw new Error(
          "Could not read .local/dev.lock. Stop the previous dev command and remove that file.",
        );
      }
      try {
        process.kill(owner, 0);
        return false;
      } catch (error) {
        if (error.code !== "ESRCH") throw error;
        unlinkSync(lockPath);
      }
    }
  }
  throw new Error("Another dev command is starting. Try again in a moment.");
}

function checkPort(port, host, label, setting) {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", (error) => {
      reject(
        new Error(
          error.code === "EADDRINUSE"
            ? `${label} port ${port} is already in use. Stop the previous service or change ${setting}. No existing process was stopped.`
            : `Cannot open ${label} port ${port}: ${error.message}`,
        ),
      );
    });
    server.listen(port, host, () => server.close(resolve));
  });
}

async function main() {
  const envPath = join(root, ".env");
  if (existsSync(envPath)) loadEnvFile(envPath);
  const origin = new URL(process.env.WEB_ORIGIN ?? "http://localhost:3000");
  if (!(await acquireLock())) {
    console.log(`Lensistry is already starting or running at ${origin.origin}.`);
    console.log("Use Ctrl+C in the original terminal to stop it.");
    return;
  }

  const required = [
    "DATABASE_URL",
    "AUTH_SECRET",
    "JWT_SECRET",
    "S3_ENDPOINT",
    "S3_BUCKET",
    "S3_ACCESS_KEY_ID",
    "S3_SECRET_ACCESS_KEY",
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(
      `Configure ${missing.join(", ")} in .env first. See .env.example and README.md; existing credentials will not be changed.`,
    );
  }
  const storage = new URL(process.env.S3_ENDPOINT);
  const localStorage =
    ["localhost", "127.0.0.1"].includes(storage.hostname) &&
    process.env.S3_ACCESS_KEY_ID === "S3RVER" &&
    process.env.S3_SECRET_ACCESS_KEY === "S3RVER";
  const webPort = Number(process.env.PORT ?? (origin.port || "3000"));
  const apiPort = Number(process.env.API_PORT ?? "4000");
  const storagePort = Number(storage.port || "9000");
  if (webPort !== Number(origin.port || (origin.protocol === "https:" ? "443" : "80"))) {
    throw new Error(
      "PORT must match the port in WEB_ORIGIN so browser requests use the correct origin.",
    );
  }
  const ports = [webPort, apiPort, ...(localStorage ? [storagePort] : [])];
  if (
    ports.some((port) => !Number.isInteger(port) || port < 1 || port > 65535) ||
    new Set(ports).size !== ports.length
  ) {
    throw new Error("Web, API and local storage need distinct port numbers between 1 and 65535.");
  }
  if (localStorage && storage.protocol !== "http:") {
    throw new Error("Local photo storage needs an http:// S3_ENDPOINT.");
  }
  await checkPort(webPort, "::", "Web", "WEB_ORIGIN and PORT");
  await checkPort(apiPort, "::", "API", "API_PORT and API_URL");
  if (localStorage) await checkPort(storagePort, "127.0.0.1", "Storage", "S3_ENDPOINT");

  if (!existsSync(join(root, "src/api/generated/prisma/client.ts"))) {
    const generated = spawnSync("bun", ["run", "db:generate"], { cwd: root, stdio: "inherit" });
    if (generated.error || generated.status !== 0) {
      throw new Error(
        "Prisma client generation failed. Run bun install --frozen-lockfile and try again.",
      );
    }
  }
  const names = [...(localStorage ? ["storage"] : []), "api", "web"];
  const commands = [
    ...(localStorage ? ["bun run dev:storage"] : []),
    "bun run dev:api",
    "bun run dev",
  ];
  if (!localStorage)
    console.log("Using the configured S3 service; local photo storage will not be started.");
  console.log(`Starting Lensistry at ${origin.origin}. Press Ctrl+C to stop all services.`);
  const child = spawn(
    process.execPath,
    [
      join(root, "node_modules/concurrently/dist/bin/index.js"),
      "--kill-others",
      "--names",
      names.join(","),
      ...commands,
    ],
    {
      cwd: root,
      stdio: "inherit",
      detached: process.platform !== "win32",
      env: {
        ...process.env,
        PORT: String(webPort),
        API_PORT: String(apiPort),
        API_URL: process.env.API_URL ?? `http://localhost:${apiPort}`,
      },
    },
  );
  let stopping = false;
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      if (!stopping) {
        stopping = true;
        child.kill(signal);
      }
    });
  }
  await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code) => {
      process.exitCode = stopping ? 0 : (code ?? 1);
      resolve();
    });
  });
}

try {
  await main();
} catch (error) {
  console.error(`Could not start Lensistry: ${error.message}`);
  process.exitCode = 1;
}
