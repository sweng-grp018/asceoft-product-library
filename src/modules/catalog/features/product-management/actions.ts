"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { api } from "@/lib/api";
import { auth } from "@/modules/auth/server/session";
import { can, type Permission } from "@/modules/auth/permissions";
import { actionError, type ActionResult } from "@/lib/action-result";

async function requireCatalogPermission(permission: Permission) {
  const session = await auth();
  if (!session || !can(session.user.role, permission)) {
    throw new Error("Admin access required");
  }
}

export async function indexProduct(productId: string): Promise<ActionResult> {
  try {
    await requireCatalogPermission("indexing:run");
    await api(`/products/${z.uuid().parse(productId)}/index`, { method: "POST", timeout: 120000 });
    revalidatePath(`/products/${productId}`);
    revalidatePath("/repository");
    revalidatePath("/dashboard");
    return { message: "Product photos are ready for search." };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteReferencePhoto(
  productId: string,
  imageId: string,
): Promise<ActionResult> {
  try {
    await requireCatalogPermission("reference-images:manage");
    await api(`/products/${z.uuid().parse(productId)}/images/${z.uuid().parse(imageId)}`, {
      method: "DELETE",
    });
    revalidatePath(`/products/${productId}`);
    revalidatePath("/products");
    revalidatePath("/repository");
    revalidatePath("/dashboard");
    return {};
  } catch (error) {
    return actionError(error);
  }
}
