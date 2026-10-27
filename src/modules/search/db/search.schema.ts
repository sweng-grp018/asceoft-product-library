import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  integer,
} from "drizzle-orm/pg-core";
import { user } from "@/modules/auth/db/auth.schema";
import { products } from "@/modules/catalog/db/product.schema";
import { sourcePhotos } from "@/modules/repository/db/image.schema";

export const searchType = pgEnum("search_type", ["text", "image", "repository"]);
export const searchHistory = pgTable(
  "search_history",
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: searchType().notNull(),
    query: text(),
    // Stores just the normalized UI filters at search time, not model outputs.
    filters: jsonb().$type<Record<string, string | number | boolean | null>>(),
    savedName: text(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("search_history_user_created_idx").on(t.userId, t.createdAt, t.id),
    check(
      "search_history_query_required_for_text",
      sql`${t.type} <> 'text' or length(trim(coalesce(${t.query}, ''))) > 0`,
    ),
  ],
);

export const searchResults = pgTable(
  "search_results",
  {
    id: uuid().defaultRandom().primaryKey(),
    searchId: uuid()
      .notNull()
      .references(() => searchHistory.id, { onDelete: "cascade" }),
    rank: integer().notNull(),
    productId: uuid().references(() => products.id, { onDelete: "set null" }),
    photoId: uuid().references(() => sourcePhotos.id, { onDelete: "set null" }),
    similarity: real(),
    // Snapshot labels survive renames and catalog deletion.
    productName: text(),
    productSku: text(),
  },
  (t) => [
    index("search_results_search_rank_idx").on(t.searchId, t.rank),
    index("search_results_product_idx").on(t.productId),
    index("search_results_photo_idx").on(t.photoId),
    check("search_results_rank_positive", sql`${t.rank} > 0`),
    check(
      "search_results_similarity_range",
      sql`${t.similarity} is null or ${t.similarity} between 0 and 1`,
    ),
  ],
);

export const searchHistoryRelations = relations(searchHistory, ({ many, one }) => ({
  user: one(user, { fields: [searchHistory.userId], references: [user.id] }),
  results: many(searchResults),
}));
export const searchResultsRelations = relations(searchResults, ({ one }) => ({
  search: one(searchHistory, { fields: [searchResults.searchId], references: [searchHistory.id] }),
  product: one(products, { fields: [searchResults.productId], references: [products.id] }),
  photo: one(sourcePhotos, { fields: [searchResults.photoId], references: [sourcePhotos.id] }),
}));
