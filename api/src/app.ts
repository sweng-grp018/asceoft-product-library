import express, { type ErrorRequestHandler } from "express";
import helmet from "helmet";
import cors from "cors";
import { Prisma } from "./generated/prisma/client.js";
import { config } from "./lib/config.js";
import { authRoutes } from "./modules/auth/routes.js";
import { catalogRoutes } from "./modules/catalog/routes.js";
import { repositoryRoutes } from "./modules/repository/routes.js";

export const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: config.WEB_ORIGIN }));
app.use(express.json({ limit: "15mb" }));
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/auth", authRoutes);
app.use("/products", catalogRoutes);
app.use("/repository", repositoryRoutes);
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

const onError: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    res.status(409).json({ error: "A record with this unique value already exists" });
    return;
  }
  if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }
  const status =
    error instanceof Error &&
    "status" in error &&
    typeof error.status === "number" &&
    error.status >= 400 &&
    error.status < 500
      ? error.status
      : 500;
  if (status >= 500) console.error("API request error:", error);
  res
    .status(status)
    .json({ error: status === 500 ? "Internal server error" : (error as Error).message });
};
app.use(onError);
