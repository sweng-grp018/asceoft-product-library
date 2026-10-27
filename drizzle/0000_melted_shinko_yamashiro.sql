CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
CREATE TYPE "public"."photo_status" AS ENUM('pending', 'processing', 'processed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."indexing_status" AS ENUM('pending', 'processing', 'indexed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."search_type" AS ENUM('text', 'image', 'repository');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL,
	CONSTRAINT "rate_limit_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "brands_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"parent_id" uuid
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"object_key" text NOT NULL,
	"original_filename" text NOT NULL,
	"is_primary" boolean NOT NULL DEFAULT false,
	"mime_type" text NOT NULL,
	"byte_size" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_images_objectKey_unique" UNIQUE("object_key"),
	CONSTRAINT "product_images_size_positive" CHECK ("product_images"."byte_size" > 0),
	CONSTRAINT "product_images_mime_valid" CHECK ("product_images"."mime_type" in ('image/jpeg', 'image/png', 'image/webp'))
);
--> statement-breakpoint
CREATE TABLE "product_keywords" (
	"product_id" uuid NOT NULL,
	"keyword" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sku" text NOT NULL,
	"name" text NOT NULL,
	"brand_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"variant" text,
	"description" text,
	"created_by_id" text,
	"updated_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_sku_unique" UNIQUE("sku"),
	CONSTRAINT "products_sku_not_blank" CHECK (length(trim("products"."sku")) > 0),
	CONSTRAINT "products_name_not_blank" CHECK (length(trim("products"."name")) > 0)
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "campaigns_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "photo_detections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"photo_id" uuid NOT NULL,
	"product_id" uuid,
	"model_version" text NOT NULL,
	"confidence" real NOT NULL,
	"x" real NOT NULL,
	"y" real NOT NULL,
	"width" real NOT NULL,
	"height" real NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "photo_detections_confidence_range" CHECK ("photo_detections"."confidence" between 0 and 1),
	CONSTRAINT "photo_detections_bounds" CHECK ("photo_detections"."x" >= 0 and "photo_detections"."y" >= 0 and "photo_detections"."width" > 0 and "photo_detections"."height" > 0 and "photo_detections"."x" + "photo_detections"."width" <= 1 and "photo_detections"."y" + "photo_detections"."height" <= 1)
);
--> statement-breakpoint
CREATE TABLE "source_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"object_key" text NOT NULL,
	"original_filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"byte_size" integer NOT NULL,
	"store_id" uuid NOT NULL,
	"campaign_id" uuid,
	"captured_on" date NOT NULL,
	"notes" text,
	"status" "photo_status" DEFAULT 'pending' NOT NULL,
	"uploaded_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "source_photos_objectKey_unique" UNIQUE("object_key"),
	CONSTRAINT "source_photos_size_positive" CHECK ("source_photos"."byte_size" > 0),
	CONSTRAINT "source_photos_mime_valid" CHECK ("source_photos"."mime_type" in ('image/jpeg', 'image/png', 'image/webp'))
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"location" text,
	CONSTRAINT "stores_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "indexing_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"status" "indexing_status" DEFAULT 'pending' NOT NULL,
	"attempt" integer DEFAULT 1 NOT NULL,
	"processed_images" integer DEFAULT 0 NOT NULL,
	"total_images" integer DEFAULT 0 NOT NULL,
	"model_version" text NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	CONSTRAINT "indexing_jobs_nonnegative" CHECK ("indexing_jobs"."attempt" > 0 and "indexing_jobs"."processed_images" >= 0 and "indexing_jobs"."total_images" >= 0 and "indexing_jobs"."processed_images" <= "indexing_jobs"."total_images")
);
--> statement-breakpoint
CREATE TABLE "product_embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"image_id" uuid NOT NULL,
	"job_id" uuid NOT NULL,
	"model_version" text NOT NULL,
	"embedding" vector(512) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" "search_type" NOT NULL,
	"query" text,
	"filters" jsonb,
	"saved_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "search_history_query_required_for_text" CHECK ("search_history"."type" <> 'text' or length(trim(coalesce("search_history"."query", ''))) > 0)
);
--> statement-breakpoint
CREATE TABLE "search_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"search_id" uuid NOT NULL,
	"rank" integer NOT NULL,
	"product_id" uuid,
	"photo_id" uuid,
	"similarity" real,
	"product_name" text,
	"product_sku" text,
	CONSTRAINT "search_results_rank_positive" CHECK ("search_results"."rank" > 0),
	CONSTRAINT "search_results_similarity_range" CHECK ("search_results"."similarity" is null or "search_results"."similarity" between 0 and 1)
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_keywords" ADD CONSTRAINT "product_keywords_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_detections" ADD CONSTRAINT "photo_detections_photo_id_source_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."source_photos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_detections" ADD CONSTRAINT "photo_detections_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_photos" ADD CONSTRAINT "source_photos_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_photos" ADD CONSTRAINT "source_photos_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_photos" ADD CONSTRAINT "source_photos_uploaded_by_id_user_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "indexing_jobs" ADD CONSTRAINT "indexing_jobs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_embeddings" ADD CONSTRAINT "product_embeddings_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_embeddings" ADD CONSTRAINT "product_embeddings_image_id_product_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."product_images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_embeddings" ADD CONSTRAINT "product_embeddings_job_id_indexing_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."indexing_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_history" ADD CONSTRAINT "search_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_results" ADD CONSTRAINT "search_results_search_id_search_history_id_fk" FOREIGN KEY ("search_id") REFERENCES "public"."search_history"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_results" ADD CONSTRAINT "search_results_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_results" ADD CONSTRAINT "search_results_photo_id_source_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."source_photos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_name_parent_unique" ON "categories" USING btree ("name","parent_id");--> statement-breakpoint
CREATE INDEX "product_images_product_idx" ON "product_images" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_keywords_unique" ON "product_keywords" USING btree ("product_id","keyword");--> statement-breakpoint
CREATE INDEX "products_brand_idx" ON "products" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_updated_idx" ON "products" USING btree ("updated_at","id");--> statement-breakpoint
CREATE INDEX "photo_detections_photo_idx" ON "photo_detections" USING btree ("photo_id");--> statement-breakpoint
CREATE INDEX "photo_detections_product_confidence_idx" ON "photo_detections" USING btree ("product_id","confidence");--> statement-breakpoint
CREATE INDEX "source_photos_store_date_idx" ON "source_photos" USING btree ("store_id","captured_on");--> statement-breakpoint
CREATE INDEX "source_photos_campaign_idx" ON "source_photos" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "source_photos_created_idx" ON "source_photos" USING btree ("created_at","id");--> statement-breakpoint
CREATE INDEX "indexing_jobs_product_created_idx" ON "indexing_jobs" USING btree ("product_id","created_at");--> statement-breakpoint
CREATE INDEX "indexing_jobs_queue_idx" ON "indexing_jobs" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "product_embeddings_job_image_unique" ON "product_embeddings" USING btree ("job_id","image_id");--> statement-breakpoint
CREATE INDEX "product_embeddings_product_idx" ON "product_embeddings" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_embeddings_image_idx" ON "product_embeddings" USING btree ("image_id");--> statement-breakpoint
CREATE INDEX "search_history_user_created_idx" ON "search_history" USING btree ("user_id","created_at","id");--> statement-breakpoint
CREATE INDEX "search_results_search_rank_idx" ON "search_results" USING btree ("search_id","rank");--> statement-breakpoint
CREATE INDEX "search_results_product_idx" ON "search_results" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "search_results_photo_idx" ON "search_results" USING btree ("photo_id");
CREATE UNIQUE INDEX "product_images_one_primary_per_product_idx" ON "product_images" USING btree ("product_id") WHERE is_primary = true;