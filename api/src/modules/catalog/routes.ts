import { Router } from "express";
import { z } from "zod";
import { fileTypeFromBuffer } from "file-type";
import { db } from "../../lib/db.js";
import { authenticate, requireRole } from "../../lib/auth.js";
import { IMAGE_TYPES, newImageKey, uploadUrl, readImage } from "../../lib/storage.js";
import { aiRequest, type EmbeddingResult } from "../../lib/ai.js";

export const catalogRoutes = Router();
const id = z.uuid();
const productInput = z.object({
  sku: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(200),
  brand: z.string().trim().max(100).optional().nullable(),
  category: z.string().trim().max(100).optional().nullable(),
  description: z.string().trim().max(5000).optional().nullable(),
});
const uploadInput = z.object({ contentType: z.enum(IMAGE_TYPES) });

catalogRoutes.get("/", async (req, res) => {
  const parsed = z
    .object({
      q: z.string().max(150).optional(),
      page: z.coerce.number().int().min(1).max(10000).default(1),
    })
    .safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }
  const { q, page } = parsed.data;
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
      skip: (page - 1) * 25,
      take: 25,
      include: { images: { select: { id: true, isPrimary: true } } },
    }),
    db.product.count({ where }),
  ]);
  res.json({ products, total, page, pageSize: 25 });
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
      images: { select: { id: true, isPrimary: true, contentType: true, embeddingModel: true } },
    },
  });
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json({ product });
});

catalogRoutes.post("/", authenticate, requireRole("ADMIN"), async (req, res) => {
  const input = productInput.safeParse(req.body);
  if (!input.success) {
    res.status(400).json({ error: "Invalid product", details: input.error.flatten() });
    return;
  }
  const product = await db.product.create({ data: input.data });
  res.status(201).json({ product });
});

catalogRoutes.patch("/:id", authenticate, requireRole("ADMIN"), async (req, res) => {
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
  res.json({
    product: await db.product.update({ where: { id: productId.data }, data: input.data }),
  });
});

catalogRoutes.delete("/:id", authenticate, requireRole("ADMIN"), async (req, res) => {
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
});

catalogRoutes.post("/:id/images", authenticate, requireRole("ADMIN"), async (req, res) => {
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
  const objectKey = newImageKey("reference");
  const image = await db.referenceImage.create({
    data: { productId: productId.data, objectKey, contentType: input.data.contentType },
  });
  await db.product.update({
    where: { id: productId.data },
    data: { indexStatus: "PENDING", indexError: null },
  });
  res.status(201).json({
    imageId: image.id,
    uploadUrl: await uploadUrl(objectKey, input.data.contentType),
    method: "PUT",
    expiresIn: 300,
    maxBytes: 10 * 1024 * 1024,
  });
});

catalogRoutes.post("/:id/index", authenticate, requireRole("ADMIN"), async (req, res) => {
  const productId = id.safeParse(req.params.id);
  if (!productId.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
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
        detectedType?.mime !== image.contentType ||
        !IMAGE_TYPES.includes(detectedType.mime as (typeof IMAGE_TYPES)[number])
      ) {
        throw Object.assign(new Error("Invalid reference image type"), { status: 422 });
      }
      const result = await aiRequest<EmbeddingResult>("/embed", bytes);
      if (
        !Array.isArray(result.embedding) ||
        result.embedding.length < 32 ||
        result.embedding.some((n) => !Number.isFinite(n))
      )
        throw new Error("Invalid AI embedding");
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
});
