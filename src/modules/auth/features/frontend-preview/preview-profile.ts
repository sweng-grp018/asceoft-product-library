"use client";
import { createPreviewStore } from "@/lib/preview-store";

export const DEFAULT_PROFILE = {
  name: "Alex Rivera",
  email: "alex@lensistry.demo",
  company: "Lensistry Studio",
};
export const previewProfile = createPreviewStore(DEFAULT_PROFILE);
