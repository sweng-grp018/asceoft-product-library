import { Router } from "express";
import { z } from "zod";
import { fileTypeFromBuffer } from "file-type";
import { rateLimit } from "express-rate-limit";
import { db } from "../../lib/db.js";
import { authenticate, requirePermission, type AuthenticatedRequest } from "../../lib/auth.js";
import {
  IMAGE_TYPES,
  newImageKey,
  uploadUrl,
  readImage,
  viewUrl,
  deleteImage,
} from "../../lib/storage.js";
import { createAiClient, embeddingResult, MATCH_THRESHOLD } from "../../lib/ai.js";
import { config } from "../../lib/config.js";
import { findImageMatches } from "./image-matches.js";

export const catalogRoutes = Router();
catalogRoutes.get(
  "/summary",
  authenticate,
  requirePermission("dashboard:view"),
  async (_req, res) => {
    const [total, statuses, recent] = await Promise.all([
      db.product.count(),
      db.product.groupBy({ by: ["indexStatus"], _count: { _all: true } }),
      db.product.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { images: { select: { id: true, isPrimary: true } } },
      }),
    ]);
    res.json({
      total,
      ready: statuses.find((row) => row.indexStatus === "INDEXED")?._count._all ?? 0,
      recent,
    });
  },
);
const id = z.uuid();
const productInput = z.object({
  sku: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .transform((value) => value.toUpperCase()),
  name: z.string().trim().min(1).max(200),
  brand: z.string().trim().max(100).optional().nullable(),
  category: z.string().trim().max(100).optional().nullable(),
  description: z.string().trim().max(5000).optional().nullable(),
});
const uploadInput = z.object({ contentType: z.enum(IMAGE_TYPES) });
const MAX_SEARCH_IMAGE_BYTES = 3 * 1024 * 1024;
const imageSearchInput = z.object({
  contentType: z.enum(IMAGE_TYPES),
  imageBase64: z
    .base64()
    .min(4)
    .max(Math.ceil(MAX_SEARCH_IMAGE_BYTES / 3) * 4),
});

catalogRoutes.get("/image-search/status", (_req, res) => {
  res.json({ enabled: Boolean(config.AI_SERVICE_URL) });
});

catalogRoutes.post(
  "/image-search",
  authenticate,
  requirePermission("ai:search"),
  rateLimit({
    windowMs: 60_000,
    limit: 6,
    keyGenerator: (req: AuthenticatedRequest) => req.viewer!.id,
    message: { error: "Too many photo searches. Try again in a minute." },
  }),
  async (req, res) => {
    const infer = createAiClient(config.AI_SERVICE_URL);
    const input = imageSearchInput.safeParse(req.body);
    if (!input.success) {
      res.status(400).json({ error: "Choose a JPG, PNG or WebP photo up to 3 MB." });
      return;
    }
    const bytes = Buffer.from(input.data.imageBase64, "base64");
    const detected = await fileTypeFromBuffer(bytes).catch(() => undefined);
    if (bytes.length > MAX_SEARCH_IMAGE_BYTES || detected?.mime !== input.data.contentType) {
      res.status(422).json({ error: "This file is not a valid photo up to 3 MB." });
      return;
    }
    const embedded = embeddingResult.safeParse(await infer<unknown>("/embed", bytes));
    if (!embedded.success) {
      res.status(502).json({ error: "The photo search service returned an invalid result." });
      return;
    }
    const candidates = await findImageMatches([embedded.data.embedding], 8);
    const matches = candidates.filter((match) => match.similarity >= MATCH_THRESHOLD);
    const products = matches.length
      ? await db.product.findMany({
          where: { id: { in: matches.map((match) => match.productId) } },
          select: {
            id: true,
            images: {
              orderBy: [{ isPrimary: "desc" }, { id: "asc" }],
              take: 1,
              select: { objectKey: true },
            },
          },
        })
      : [];
    const photos = new Map(products.map((product) => [product.id, product.images[0]?.objectKey]));
    res.json({
      matches: await Promise.all(
        matches.map(async (match) => {
          const key = photos.get(match.productId);
          return { ...match, imageUrl: key ? await viewUrl(key).catch(() => null) : null };
        }),
      ),
    });
  },
);

catalogRoutes.get("/", async (req, res) => {
  const parsed = z
    .object({
      q: z.string().max(150).optional(),
      page: z.coerce.number().int().min(1).max(10000).default(1),
      pageSize: z.coerce.number().int().min(1).max(100).default(25),
    })
    .safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }
  const { q, page, pageSize } = parsed.data;
  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { sku: { contains: q, mode: "insensitive" as const } },
          { brand: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};
  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { images: { select: { id: true, isPrimary: true } } },
    }),
    db.product.count({ where }),
  ]);
  res.json({ products, total, page, pageSize });
});

catalogRoutes.get("/:id", async (req, res) => {
  const parsed = id.safeParse(req.params.id);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const product = await db.product.findUnique({
    where: { id: parsed.data },
    include: {
      images: {
        orderBy: [{ isPrimary: "desc" }, { id: "asc" }],
        select: {
          id: true,
          isPrimary: true,
          contentType: true,
          embeddingModel: true,
          objectKey: true,
        },
      },
    },
  });
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  const photos = await Promise.all(
    product.images.map(async (image) => ({
      id: image.id,
      url: await viewUrl(image.objectKey).catch(() => null),
    })),
  );
  res.json({
    product: {
      ...product,
      images: product.images.map(({ objectKey: _objectKey, ...image }) => image),
    },
    photos,
    serverInferenceEnabled: Boolean(config.AI_SERVICE_URL),
  });
});

catalogRoutes.post("/", authenticate, requirePermission("products:create"), async (req, res) => {
  const input = productInput.safeParse(req.body);
  if (!input.success) {
    res.status(400).json({ error: "Invalid product", details: input.error.flatten() });
    return;
  }
  const product = await db.product.create({ data: input.data });
  res.status(201).json({ product });
});

catalogRoutes.patch("/:id", authenticate, requirePermission("products:edit"), async (req, res) => {
  const input = productInput
    .partial()
    .refine((x) => Object.keys(x).length > 0)
    .safeParse(req.body);
  const productId = id.safeParse(req.params.id);
  if (!input.success || !productId.success) {
    res.status(400).json({ error: "Invalid product update" });
    return;
  }
  const exists = await db.product.findUnique({ where: { id: productId.data } });
  if (!exists) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  const { sku, ...details } = input.data;
  if (sku !== undefined && sku !== exists.sku) {
    res.status(400).json({ error: "The product code cannot be changed." });
    return;
  }
  res.json({
    product: await db.product.update({ where: { id: productId.data }, data: details }),
  });
});

catalogRoutes.delete(
  "/:id",
  authenticate,
  requirePermission("products:delete"),
  async (req, res) => {
    const productId = id.safeParse(req.params.id);
    if (!productId.success) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const existing = await db.product.findUnique({ where: { id: productId.data } });
    if (!existing) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    await db.product.delete({ where: { id: productId.data } });
    res.status(204).end();
  },
);

catalogRoutes.post(
  "/:id/images",
  authenticate,
  requirePermission("reference-images:manage"),
  async (req, res) => {
    const input = uploadInput.safeParse(req.body);
    const productId = id.safeParse(req.params.id);
    if (!input.success || !productId.success) {
      res.status(400).json({ error: "Invalid image registration" });
      return;
    }
    const existing = await db.product.findUnique({ where: { id: productId.data } });
    if (!existing) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const objectKey = newImageKey("reference", productId.data);
    res.status(201).json({
      objectKey,
      uploadUrl: await uploadUrl(objectKey, input.data.contentType),
      method: "PUT",
      expiresIn: 300,
      maxBytes: 10 * 1024 * 1024,
    });
  },
);

catalogRoutes.post(
  "/:id/images/complete",
  authenticate,
  requirePermission("reference-images:manage"),
  async (req, res) => {
    const productId = id.safeParse(req.params.id);
    const input = z
      .object({ objectKey: z.string(), contentType: z.enum(IMAGE_TYPES) })
      .safeParse(req.body);
    if (
      !productId.success ||
      !input.success ||
      !input.data.objectKey.startsWith(`reference/${productId.data}/`) ||
      !id.safeParse(input.data.objectKey.split("/")[2]).success ||
      input.data.objectKey.split("/").length !== 3
    ) {
      res.status(400).json({ error: "Invalid photo." });
      return;
    }
    if (!(await db.product.findUnique({ where: { id: productId.data }, select: { id: true } }))) {
      res.status(404).json({ error: "Product not found." });
      return;
    }
    const { bytes } = await readImage(input.data.objectKey);
    const detected = await fileTypeFromBuffer(bytes);
    if (detected?.mime !== input.data.contentType) {
      res.status(422).json({ error: "This file is not a valid photo." });
      return;
    }
    const [image] = await db.$transaction([
      db.referenceImage.upsert({
        where: { objectKey: input.data.objectKey },
        create: {
          productId: productId.data,
          objectKey: input.data.objectKey,
          contentType: input.data.contentType,
        },
        update: {},
      }),
      db.product.update({
        where: { id: productId.data },
        data: { indexStatus: "PENDING", indexError: null },
      }),
    ]);
    res.status(201).json({ image: { id: image.id } });
  },
);

catalogRoutes.get(
  "/:id/images",
  authenticate,
  requirePermission("catalog:internal"),
  async (req, res) => {
    const productId = id.safeParse(req.params.id);
    if (!productId.success) {
      res.status(400).json({ error: "Invalid product." });
      return;
    }
    const images = await db.referenceImage.findMany({
      where: { productId: productId.data },
      select: { id: true, objectKey: true },
      take: 100,
    });
    res.json({
      images: await Promise.all(
        images.map(async (image) => ({ id: image.id, url: await viewUrl(image.objectKey) })),
      ),
    });
  },
);

catalogRoutes.delete(
  "/:id/images/:imageId",
  authenticate,
  requirePermission("reference-images:manage"),
  async (req, res) => {
    const productId = id.safeParse(req.params.id);
    const imageId = id.safeParse(req.params.imageId);
    if (!productId.success || !imageId.success) {
      res.status(400).json({ error: "Invalid reference photo." });
      return;
    }
    const image = await db.referenceImage.findFirst({
      where: { id: imageId.data, productId: productId.data },
      select: { id: true, objectKey: true },
    });
    if (!image) {
      res.status(404).json({ error: "Reference photo not found." });
      return;
    }
    await deleteImage(image.objectKey);
    await db.$transaction(async (tx) => {
      await tx.referenceImage.deleteMany({ where: { id: image.id } });
      const remaining = await tx.referenceImage.count({ where: { productId: productId.data } });
      if (remaining === 0) {
        await tx.product.update({
          where: { id: productId.data },
          data: { indexStatus: "PENDING", indexError: null },
        });
      }
    });
    res.status(204).end();
  },
);

catalogRoutes.post(
  "/:id/index",
  authenticate,
  requirePermission("indexing:run"),
  async (req, res) => {
    const productId = id.safeParse(req.params.id);
    if (!productId.success) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const aiRequest = createAiClient(config.AI_SERVICE_URL);
    const product = await db.product.findUnique({
      where: { id: productId.data },
      include: { images: true },
    });
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    if (!product.images.length) {
      res.status(422).json({ error: "Add reference images first" });
      return;
    }
    if (product.indexStatus === "PROCESSING") {
      res.status(409).json({ error: "Already indexing" });
      return;
    }
    await db.product.update({
      where: { id: product.id },
      data: { indexStatus: "PROCESSING", indexError: null },
    });
    try {
      const updates: Array<{ id: string; embedding: number[]; model: string }> = [];
      for (const image of product.images) {
        const { bytes } = await readImage(image.objectKey);
        const detectedType = await fileTypeFromBuffer(bytes);
        if (
          !detectedType ||
          detectedType.mime !== image.contentType ||
          !IMAGE_TYPES.includes(detectedType.mime as (typeof IMAGE_TYPES)[number])
        ) {
          throw Object.assign(new Error("Invalid reference image type"), { status: 422 });
        }
        const result = embeddingResult.parse(await aiRequest<unknown>("/embed", bytes));
        updates.push({ id: image.id, embedding: result.embedding, model: result.model });
      }
      await db.$transaction(async (tx) => {
        for (const update of updates) {
          await tx.referenceImage.update({
            where: { id: update.id },
            data: { embedding: update.embedding, embeddingModel: update.model },
          });
        }
        await tx.product.update({ where: { id: product.id }, data: { indexStatus: "INDEXED" } });
      });
      res.json({ productId: product.id, indexedImages: updates.length, status: "INDEXED" });
    } catch (error) {
      await db.product.update({
        where: { id: product.id },
        data: {
          indexStatus: "FAILED",
          indexError: error instanceof Error ? error.message.slice(0, 300) : "Unknown error",
        },
      });
      res
        .status(502)
        .json({ error: "Indexing failed; retry after checking uploaded images and AI service" });
    }
  },
);
