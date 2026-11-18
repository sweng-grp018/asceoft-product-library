import { app } from "./app.js";
import { config } from "./lib/config.js";
import { db } from "./lib/db.js";

const server = app.listen(config.API_PORT, () => {
  console.log(`Lensistry API listening on port ${config.API_PORT}`);
});

async function shutdown() {
  server.close();
  await db.$disconnect();
}
process.on("SIGTERM", () => {
  void shutdown();
});
process.on("SIGINT", () => {
  void shutdown();
});
