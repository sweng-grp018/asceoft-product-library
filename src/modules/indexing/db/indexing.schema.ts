import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
} from "drizzle-orm/pg-core";
import { products, productImages } from "@/modules/catalog/db/product.schema";

export const indexingStatus = pgEnum("indexing_status", [
  "pending",
  "processing",
  "indexed",
  "failed",
]);

export const indexingJobs = pgTable(
  "indexing_jobs",
  {
    id: uuid().defaultRandom().primaryKey(),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    status: indexingStatus().notNull().default("pending"),
    attempt: integer().notNull().default(1),
    processedImages: integer().notNull().default(0),
    totalImages: integer().notNull().default(0),
    modelVersion: text().notNull(),
    errorMessage: text(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    startedAt: timestamp({ withTimezone: true }),
    completedAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    index("indexing_jobs_product_created_idx").on(t.productId, t.createdAt),
    index("indexing_jobs_queue_idx").on(t.status, t.createdAt),
    check(
      "indexing_jobs_nonnegative",
      sql`${t.attempt} > 0 and ${t.processedImages} >= 0 and ${t.totalImages} >= 0 and ${t.processedImages} <= ${t.totalImages}`,
    ),
  ],
);

// 512 dimensions is the selected OpenCLIP projection size. Changing the model
// requires an explicit migration and re-index, never a silent dimension change.
export const productEmbeddings = pgTable(
  "product_embeddings",
  {
    id: uuid().defaultRandom().primaryKey(),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    imageId: uuid()
      .notNull()
      .references(() => productImages.id, { onDelete: "cascade" }),
    jobId: uuid()
      .notNull()
      .references(() => indexingJobs.id, { onDelete: "cascade" }),
    modelVersion: text().notNull(),
    embedding: vector({ dimensions: 512 }).notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("product_embeddings_job_image_unique").on(t.jobId, t.imageId),
    index("product_embeddings_product_idx").on(t.productId),
    index("product_embeddings_image_idx").on(t.imageId),
    index("product_embeddings_vector_hnsw_idx").using("hnsw", t.embedding.op("vector_cosine_ops")),
  ],
);

export const indexingJobsRelations = relations(indexingJobs, ({ one, many }) => ({
  product: one(products, { fields: [indexingJobs.productId], references: [products.id] }),
  embeddings: many(productEmbeddings),
}));
export const productEmbeddingsRelations = relations(productEmbeddings, ({ one }) => ({
  product: one(products, { fields: [productEmbeddings.productId], references: [products.id] }),
  image: one(productImages, {
    fields: [productEmbeddings.imageId],
    references: [productImages.id],
  }),
  job: one(indexingJobs, { fields: [productEmbeddings.jobId], references: [indexingJobs.id] }),
}));
