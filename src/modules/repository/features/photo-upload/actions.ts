"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";
import { actionError, type ActionResult } from "@/lib/action-result";

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
      data: { contentType: type },
    });
  }
  for (const path of [
    "/products",
    "/dashboard",
    "/repository",
    "/detection",
    ...(productId ? [`/products/${productId}`] : []),
  ])
    revalidatePath(path);
}

export async function deleteShelfPhoto(imageId: string): Promise<ActionResult> {
  try {
    await api(`/repository/${z.uuid().parse(imageId)}`, { method: "DELETE" });
    revalidatePath("/repository");
    revalidatePath("/detection");
    return {};
  } catch (error) {
    return actionError(error);
  }
}
