ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "products_created_by_idx" ON "products" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "products_updated_by_idx" ON "products" USING btree ("updated_by_id");--> statement-breakpoint
CREATE INDEX "source_photos_uploaded_by_idx" ON "source_photos" USING btree ("uploaded_by_id");