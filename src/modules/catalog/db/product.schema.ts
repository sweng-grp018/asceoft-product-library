import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "@/modules/auth/db/auth.schema";

export const brands = pgTable("brands", {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull().unique(),
});

export const categories = pgTable(
  "categories",
  {
    id: uuid().defaultRandom().primaryKey(),
    name: text().notNull(),
    parentId: uuid().references((): import("drizzle-orm/pg-core").AnyPgColumn => categories.id, {
      onDelete: "restrict",
    }),
  },
  (t) => [
    index("categories_parent_idx").on(t.parentId),
    uniqueIndex("categories_name_parent_unique").on(t.name, t.parentId),
  ],
);

export const products = pgTable(
  "products",
  {
    id: uuid().defaultRandom().primaryKey(),
    sku: text().notNull().unique(),
    name: text().notNull(),
    brandId: uuid()
      .notNull()
      .references(() => brands.id, { onDelete: "restrict" }),
    categoryId: uuid()
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    variant: text(),
    description: text(),
    createdById: text().references(() => user.id, { onDelete: "set null" }),
    updatedById: text().references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("products_brand_idx").on(t.brandId),
    index("products_created_by_idx").on(t.createdById),
    index("products_updated_by_idx").on(t.updatedById),
    index("products_category_idx").on(t.categoryId),
    index("products_updated_idx").on(t.updatedAt, t.id),
    check("products_sku_not_blank", sql`length(trim(${t.sku})) > 0`),
    check("products_name_not_blank", sql`length(trim(${t.name})) > 0`),
  ],
);

export const productKeywords = pgTable(
  "product_keywords",
  {
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    keyword: text().notNull(),
  },
  (t) => [uniqueIndex("product_keywords_unique").on(t.productId, t.keyword)],
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid().defaultRandom().primaryKey(),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    objectKey: text().notNull().unique(),
    originalFilename: text().notNull(),
    mimeType: text().notNull(),
    byteSize: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("product_images_product_idx").on(t.productId),
    check("product_images_size_positive", sql`${t.byteSize} > 0`),
    check(
      "product_images_mime_valid",
      sql`${t.mimeType} in ('image/jpeg', 'image/png', 'image/webp')`,
    ),
  ],
);

export const productsRelations = relations(products, ({ one, many }) => ({
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  images: many(productImages),
  keywords: many(productKeywords),
}));
export const brandsRelations = relations(brands, ({ many }) => ({ products: many(products) }));
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "hierarchy",
  }),
  children: many(categories, { relationName: "hierarchy" }),
  products: many(products),
}));
export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));
export const productKeywordsRelations = relations(productKeywords, ({ one }) => ({
  product: one(products, { fields: [productKeywords.productId], references: [products.id] }),
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
