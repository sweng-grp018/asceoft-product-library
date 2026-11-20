import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { fileTypeFromBuffer } from "file-type";
import { db } from "../../lib/db.js";
import { authenticate, requireRole, type AuthenticatedRequest } from "../../lib/auth.js";
import { IMAGE_TYPES, uploadUrl, readImage, viewUrl, deleteImage } from "../../lib/storage.js";
import { createAiClient, detectionResult, MATCH_THRESHOLD } from "../../lib/ai.js";
import { config } from "../../lib/config.js";
import { findImageMatches } from "../catalog/image-matches.js";

export const repositoryRoutes = Router();
repositoryRoutes.use(authenticate, requireRole("STAFF", "ADMIN"));
const id = z.uuid();
const inputSchema = z.object({
  contentType: z.enum(IMAGE_TYPES),
  capturedAt: z.iso.datetime().optional(),
});

repositoryRoutes.get("/", async (_req, res) => {
  const images = await db.repositoryImage.findMany({
    select: { id: true, objectKey: true, contentType: true, capturedAt: true, createdAt: true },
    take: 50,
    orderBy: { createdAt: "desc" },
  });
  res.json({
    serverInferenceEnabled: Boolean(config.AI_SERVICE_URL),
    images: await Promise.all(
      images.map(async ({ objectKey, ...image }) => ({ ...image, url: await viewUrl(objectKey) })),
    ),
  });
});

repositoryRoutes.post("/", async (req, res) => {
  const parsed = inputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid image metadata" });
    return;
  }
  const { contentType } = parsed.data;
  const imageId = randomUUID();
  const objectKey = `shelf/${imageId}`;
  res.status(201).json({
    imageId,
    objectKey,
    uploadUrl: await uploadUrl(objectKey, contentType),
    method: "PUT",
    expiresIn: 300,
    maxBytes: 10 * 1024 * 1024,
  });
});

repositoryRoutes.post("/:id/complete", async (req, res) => {
  const imageId = id.safeParse(req.params.id);
  const input = inputSchema.safeParse(req.body);
  if (!imageId.success || !input.success) {
    res.status(400).json({ error: "Invalid photo details." });
    return;
  }
  const objectKey = `shelf/${imageId.data}`;
  const { bytes } = await readImage(objectKey);
  const type = await fileTypeFromBuffer(bytes);
  if (type?.mime !== input.data.contentType) {
    res.status(422).json({ error: "This file is not a valid photo." });
    return;
  }
  const { capturedAt, ...metadata } = input.data;
  await db.repositoryImage.upsert({
    where: { id: imageId.data },
    create: {
      id: imageId.data,
      objectKey,
      ...metadata,
      ...(capturedAt ? { capturedAt: new Date(capturedAt) } : {}),
    },
    update: {},
  });
  res.status(201).json({ imageId: imageId.data });
});

repositoryRoutes.delete("/:id", requireRole("ADMIN"), async (req, res) => {
  const imageId = id.safeParse(req.params.id);
  if (!imageId.success) {
    res.status(400).json({ error: "Invalid photo." });
    return;
  }
  const image = await db.repositoryImage.findUnique({ where: { id: imageId.data } });
  if (!image) {
    res.status(404).json({ error: "Photo not found." });
    return;
  }
  await deleteImage(image.objectKey);
  await db.repositoryImage.deleteMany({ where: { id: image.id } });
  res.status(204).end();
});

repositoryRoutes.post("/:id/analyze", async (req: AuthenticatedRequest, res) => {
  const parsed = id.safeParse(req.params.id);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const aiRequest = createAiClient(config.AI_SERVICE_URL);
  const image = await db.repositoryImage.findUnique({ where: { id: parsed.data } });
  if (!image) {
    res.status(404).json({ error: "Image not found" });
    return;
  }
  const { bytes } = await readImage(image.objectKey);
  const type = await fileTypeFromBuffer(bytes);
  if (
    !type ||
    type.mime !== image.contentType ||
    !IMAGE_TYPES.includes(type.mime as (typeof IMAGE_TYPES)[number])
  ) {
    res.status(422).json({ error: "Invalid image file" });
    return;
  }
  const result = detectionResult.safeParse(await aiRequest<unknown>("/detect", bytes));
  if (!result.success) {
    res.status(502).json({ error: "Invalid detection response" });
    return;
  }
  const detection = result.data;
  const nearest = await findImageMatches(
    detection.detections.map((d) => d.embedding),
    1,
  );
  const nearestByDetection = new Map(nearest.map((match) => [match.queryIndex, match]));
  const matches = detection.detections.map((d, index) => {
    const match = nearestByDetection.get(index);
    return {
      productId: match && match.similarity >= MATCH_THRESHOLD ? match.productId : null,
      boundingBox: d.boundingBox,
      detectorScore: d.detectorScore,
      similarityScore: match?.similarity ?? null,
    };
  });
  const history = await db.searchHistory.create({
    data: {
      imageId: image.id,
      userId: req.viewer!.id,
      matches: { create: matches },
    },
    include: { matches: true },
  });
  res.json({
    searchId: history.id,
    width: detection.width,
    height: detection.height,
    detectorModel: detection.detectorModel,
    matches: history.matches,
  });
});

repositoryRoutes.get("/searches/recent", async (req: AuthenticatedRequest, res) => {
  res.json({
    searches: await db.searchHistory.findMany({
      where: { userId: req.viewer!.id },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { matches: true },
    }),
  });
});

repositoryRoutes.patch(
  "/searches/:searchId/matches/:matchId",
  async (req: AuthenticatedRequest, res) => {
    const searchId = id.safeParse(req.params.searchId);
    const matchId = id.safeParse(req.params.matchId);
    const payload = z.object({ productId: id.nullable() }).safeParse(req.body);
    if (!searchId.success || !matchId.success || !payload.success) {
      res.status(400).json({ error: "Invalid correction" });
      return;
    }
    const match = await db.detectionMatch.findFirst({
      where: { id: matchId.data, searchHistoryId: searchId.data },
      include: { history: { select: { userId: true } } },
    });
    if (!match) {
      res.status(404).json({ error: "Match not found" });
      return;
    }
    if (match.history.userId !== req.viewer!.id && req.viewer!.role !== "ADMIN") {
      res.status(403).json({ error: "You cannot modify another user's search" });
      return;
    }
    if (
      payload.data.productId &&
      !(await db.product.findUnique({ where: { id: payload.data.productId } }))
    ) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json({
      match: await db.detectionMatch.update({
        where: { id: matchId.data },
        data: { productId: payload.data.productId, manuallySet: true },
      }),
    });
  },
);
