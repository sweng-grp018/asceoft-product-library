"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";

const mediaType = z.enum(["image/jpeg", "image/png", "image/webp"]);
export type UploadDestination = {
  uploadUrl: string;
  objectKey: string;
  imageId?: string;
  maxBytes: number;
};
export async function preparePhoto(
  contentType: string,
  productId?: string,
): Promise<UploadDestination> {
  const type = mediaType.parse(contentType);
  const path = productId ? `/products/${z.uuid().parse(productId)}/images` : "/repository";
  return api<UploadDestination>(path, { method: "POST", data: { contentType: type } });
}
export async function finishPhoto(
  destination: { objectKey: string; imageId?: string },
  contentType: string,
  productId?: string,
  store = "",
  campaign = "",
) {
  const type = mediaType.parse(contentType);
  if (productId) {
    await api(`/products/${z.uuid().parse(productId)}/images/complete`, {
      method: "POST",
      data: { objectKey: destination.objectKey, contentType: type },
    });
  } else {
    await api(`/repository/${z.uuid().parse(destination.imageId)}/complete`, {
      method: "POST",
      data: { contentType: type, store: store.slice(0, 100), campaign: campaign.slice(0, 100) },
    });
  }
  for (const path of [
    "/products",
    "/dashboard",
    "/repository",
    "/training",
    ...(productId ? [`/products/${productId}`] : []),
  ])
    revalidatePath(path);
}
