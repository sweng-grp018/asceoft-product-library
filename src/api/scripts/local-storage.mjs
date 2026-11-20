import { mkdir } from "node:fs/promises";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import S3rver from "s3rver";

config({ path: new URL("../../../.env", import.meta.url), quiet: true });
const endpoint = new URL(process.env.S3_ENDPOINT ?? "http://127.0.0.1:9000");
if (!["localhost", "127.0.0.1"].includes(endpoint.hostname) || endpoint.protocol !== "http:") {
  throw new Error(
    "Local storage needs an HTTP endpoint on localhost. Use your hosted bucket directly for other endpoints.",
  );
}
if (process.env.S3_ACCESS_KEY_ID !== "S3RVER" || process.env.S3_SECRET_ACCESS_KEY !== "S3RVER") {
  throw new Error(
    "Set the local S3 access key and secret to S3RVER in .env before starting local storage.",
  );
}
const directory = fileURLToPath(new URL("../../../.local/storage/", import.meta.url));
await mkdir(directory, { recursive: true });
const origin = new URL(process.env.WEB_ORIGIN ?? "http://localhost:3000");
const origins = new Set([
  origin.origin,
  `http://localhost:${origin.port || "3000"}`,
  `http://127.0.0.1:${origin.port || "3000"}`,
]);
const cors = `<CORSConfiguration><CORSRule>${[...origins].map((value) => `<AllowedOrigin>${value}</AllowedOrigin>`).join("")}<AllowedMethod>GET</AllowedMethod><AllowedMethod>HEAD</AllowedMethod><AllowedMethod>PUT</AllowedMethod><AllowedHeader>*</AllowedHeader><ExposeHeader>ETag</ExposeHeader><MaxAgeSeconds>300</MaxAgeSeconds></CORSRule></CORSConfiguration>`;
const storage = new S3rver({
  directory,
  silent: true,
  resetOnClose: false,
  configureBuckets: [{ name: process.env.S3_BUCKET ?? "lensistry", configs: [cors] }],
});
await storage.configureBuckets();
const handle = storage.callback();
const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", endpoint);
  // Keep local objects private: the storage library validates each supplied signature.
  if (
    req.method !== "OPTIONS" &&
    !req.headers.authorization &&
    !url.searchParams.has("X-Amz-Signature")
  ) {
    res.writeHead(403, { "Content-Type": "application/xml" });
    res.end(
      "<Error><Code>AccessDenied</Code><Message>A signed request is required.</Message></Error>",
    );
    return;
  }
  handle(req, res);
});
server.listen(Number(endpoint.port || "9000"), "127.0.0.1", () => {
  console.log(
    `Local photo storage is running at ${endpoint.origin}. Files are kept in .local/storage.`,
  );
});
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => server.close(() => process.exit(0)));
