"use client";
import { createPreviewStore } from "@/lib/preview-store";
import { PLACEHOLDER_ROWS } from "./list-products.data";

export const catalogPreview = createPreviewStore(PLACEHOLDER_ROWS);
