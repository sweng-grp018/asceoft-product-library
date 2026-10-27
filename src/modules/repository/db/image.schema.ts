import { relations, sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "@/modules/auth/db/auth.schema";
import { products } from "@/modules/catalog/db/product.schema";

export const photoStatus = pgEnum("photo_status", ["pending", "processing", "processed", "failed"]);

export const stores = pgTable("stores", {
  id: uuid().defaultRandom().primaryKey(),
  code: text().notNull().unique(),
  name: text().notNull(),
  location: text(),
});

export const campaigns = pgTable("campaigns", {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull().unique(),
});

export const sourcePhotos = pgTable(
  "source_photos",
  {
    id: uuid().defaultRandom().primaryKey(),
    objectKey: text().notNull().unique(),
    originalFilename: text().notNull(),
    mimeType: text().notNull(),
    byteSize: integer().notNull(),
    storeId: uuid()
      .notNull()
      .references(() => stores.id, { onDelete: "restrict" }),
    campaignId: uuid().references(() => campaigns.id, { onDelete: "set null" }),
    capturedOn: date().notNull(),
    notes: text(),
    status: photoStatus().notNull().default("pending"),
    uploadedById: text().references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("source_photos_store_date_idx").on(t.storeId, t.capturedOn),
    index("source_photos_campaign_idx").on(t.campaignId),
    index("source_photos_created_idx").on(t.createdAt, t.id),
    index("source_photos_uploaded_by_idx").on(t.uploadedById),
    check("source_photos_size_positive", sql`${t.byteSize} > 0`),
    check(
      "source_photos_mime_valid",
      sql`${t.mimeType} in ('image/jpeg', 'image/png', 'image/webp')`,
    ),
  ],
);

export const photoDetections = pgTable(
  "photo_detections",
  {
    id: uuid().defaultRandom().primaryKey(),
    photoId: uuid()
      .notNull()
      .references(() => sourcePhotos.id, { onDelete: "cascade" }),
    // A deleted catalog product must not erase historical source-photo detections.
    productId: uuid().references(() => products.id, { onDelete: "set null" }),
    modelVersion: text().notNull(),
    confidence: real().notNull(),
    x: real().notNull(),
    y: real().notNull(),
    width: real().notNull(),
    height: real().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("photo_detections_photo_idx").on(t.photoId),
    index("photo_detections_product_confidence_idx").on(t.productId, t.confidence),
    check("photo_detections_confidence_range", sql`${t.confidence} between 0 and 1`),
    check(
      "photo_detections_bounds",
      sql`${t.x} >= 0 and ${t.y} >= 0 and ${t.width} > 0 and ${t.height} > 0 and ${t.x} + ${t.width} <= 1 and ${t.y} + ${t.height} <= 1`,
    ),
  ],
);

export const storesRelations = relations(stores, ({ many }) => ({ photos: many(sourcePhotos) }));
export const campaignsRelations = relations(campaigns, ({ many }) => ({
  photos: many(sourcePhotos),
}));
export const sourcePhotosRelations = relations(sourcePhotos, ({ one, many }) => ({
  store: one(stores, { fields: [sourcePhotos.storeId], references: [stores.id] }),
  campaign: one(campaigns, { fields: [sourcePhotos.campaignId], references: [campaigns.id] }),
  detections: many(photoDetections),
}));
export const photoDetectionsRelations = relations(photoDetections, ({ one }) => ({
  photo: one(sourcePhotos, { fields: [photoDetections.photoId], references: [sourcePhotos.id] }),
  product: one(products, { fields: [photoDetections.productId], references: [products.id] }),
}));
