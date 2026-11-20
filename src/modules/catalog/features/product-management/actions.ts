"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { api } from "@/lib/api";
import { auth } from "@/modules/auth/server/session";
import { actionError, type ActionResult } from "@/lib/action-result";

async function adminOnly() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Admin access required");
}

export async function indexProduct(productId: string): Promise<ActionResult> {
  try {
    await adminOnly();
    await api(`/products/${z.uuid().parse(productId)}/index`, { method: "POST", timeout: 120000 });
    revalidatePath(`/products/${productId}`);
    revalidatePath("/repository");
    revalidatePath("/dashboard");
    return { message: "Product photos are ready for search." };
  } catch (error) {
    return actionError(error);
  }
}
