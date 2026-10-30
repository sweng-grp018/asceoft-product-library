import { Router } from "express";
import { z } from "zod";
import { fileTypeFromBuffer } from "file-type";
import { db } from "../../lib/db.js";
import { authenticate, requireRole, type AuthenticatedRequest } from "../../lib/auth.js";
import { IMAGE_TYPES, newImageKey, uploadUrl, readImage } from "../../lib/storage.js";
import { aiRequest, bestMatch, type DetectionResult } from "../../lib/ai.js";

export const repositoryRoutes = Router();
repositoryRoutes.use(authenticate, requireRole("STAFF", "ADMIN"));
const id = z.uuid();
const inputSchema = z.object({
  contentType: z.enum(IMAGE_TYPES),
  store: z.string().trim().max(100).optional(),
  campaign: z.string().trim().max(100).optional(),
  capturedAt: z.iso.datetime().optional(),
});

repositoryRoutes.get("/", async (_req, res) => {
  res.json({
    images: await db.repositoryImage.findMany({ take: 50, orderBy: { createdAt: "desc" } }),
  });
});

repositoryRoutes.post("/", async (req, res) => {
  const parsed = inputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid image metadata" });
    return;
  }
  const { contentType, capturedAt, ...metadata } = parsed.data;
  const objectKey = newImageKey("shelf");
  const image = await db.repositoryImage.create({
    data: {
      ...metadata,
      objectKey,
      contentType,
      ...(capturedAt ? { capturedAt: new Date(capturedAt) } : {}),
    },
  });
  res.status(201).json({
    imageId: image.id,
    uploadUrl: await uploadUrl(objectKey, contentType),
    method: "PUT",
    expiresIn: 300,
    maxBytes: 10 * 1024 * 1024,
  });
});

repositoryRoutes.post("/:id/analyze", async (req: AuthenticatedRequest, res) => {
  const parsed = id.safeParse(req.params.id);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
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
  const detection = await aiRequest<DetectionResult>("/detect", bytes);
  if (!Array.isArray(detection.detections) || detection.detections.length > 100) {
    res.status(502).json({ error: "Invalid detection response" });
    return;
  }
  const references = await db.referenceImage.findMany({
    where: { product: { indexStatus: "INDEXED" } },
    select: { productId: true, embedding: true, embeddingModel: true },
  });
  const candidates = references.filter((r) => r.embeddingModel === "openclip-ViT-B-32-openai");
  const matches = detection.detections.map((d) => {
    if (
      !Array.isArray(d.embedding) ||
      d.embedding.length < 32 ||
      d.embedding.some((n) => !Number.isFinite(n)) ||
      !Array.isArray(d.boundingBox) ||
      d.boundingBox.length !== 4 ||
      d.boundingBox.some((n) => !Number.isFinite(n))
    ) {
      throw Object.assign(new Error("Invalid AI detection"), { status: 502 });
    }
    const match = bestMatch(d.embedding, candidates);
    return {
      productId: match.productId,
      boundingBox: d.boundingBox,
      detectorScore: d.detectorScore,
      similarityScore: match.similarity,
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
