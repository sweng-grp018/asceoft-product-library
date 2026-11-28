"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";
import { auth } from "@/modules/auth/server/session";
import { can } from "@/modules/auth/permissions";
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
  const session = await auth();
  const required = productId ? "reference-images:manage" : "repository:upload";
  if (!can(session?.user.role, required)) throw new Error("Insufficient permissions");
  const type = mediaType.parse(contentType);
  const path = productId ? `/products/${z.uuid().parse(productId)}/images` : "/repository";
  return api<UploadDestination>(path, { method: "POST", data: { contentType: type } });
}
export async function finishPhoto(
  destination: { objectKey: string; imageId?: string },
  contentType: string,
  productId?: string,
) {
  const session = await auth();
  const required = productId ? "reference-images:manage" : "repository:upload";
  if (!can(session?.user.role, required)) throw new Error("Insufficient permissions");
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
    if (!can((await auth())?.user.role, "repository:delete")) {
      return { error: "Only store managers can delete shelf photos." };
    }
    await api(`/repository/${z.uuid().parse(imageId)}`, { method: "DELETE" });
    revalidatePath("/repository");
    revalidatePath("/detection");
    return {};
  } catch (error) {
    return actionError(error);
  }
}
