"use server";

import { api } from "@/lib/api";
import { actionError, type ActionResult } from "@/lib/action-result";
import { validateImageFile } from "@/lib/image";
import { MAX_SEARCH_IMAGE_BYTES } from "./limits";

type ImageSearchState = ActionResult & {
  matches?: { productId: string; name: string; sku: string; brand: string | null }[];
};

export async function searchByImage(
  _previous: ImageSearchState,
  data: FormData,
): Promise<ImageSearchState> {
  const photo = data.get("photo");
  if (!(photo instanceof File) || !photo.size) return { error: "Choose a photo first." };
  const problem = validateImageFile(photo, MAX_SEARCH_IMAGE_BYTES);
  if (problem) return { error: problem };

  try {
    return await api<{ matches: NonNullable<ImageSearchState["matches"]> }>(
      "/products/image-search",
      {
        method: "POST",
        data: {
          contentType: photo.type,
          imageBase64: Buffer.from(await photo.arrayBuffer()).toString("base64"),
        },
        timeout: 125000,
      },
    );
  } catch (error) {
    if (error instanceof Error && "status" in error && Number(error.status) >= 500)
      return { error: "Photo search is unavailable right now. Please try again later." };
    return actionError(error);
  }
}
