"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { api, type Product } from "@/lib/api";
import { actionError } from "@/lib/action-result";

const input = z.object({
  sku: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(200),
  brand: z.string().trim().max(100),
  category: z.string().trim().max(100),
  description: z.string().trim().max(5000),
});
export async function saveCatalogProduct(
  raw: unknown,
  productId?: string,
): Promise<{ product?: Product; error?: string }> {
  const parsed = input.safeParse(raw);
  if (!parsed.success)
    return { error: "Enter a product code and name, and check the field lengths." };
  try {
    const path = productId ? `/products/${z.uuid().parse(productId)}` : "/products";
    const result = await api<{ product: Product }>(path, {
      method: productId ? "PATCH" : "POST",
      data: parsed.data,
    });
    for (const route of [
      "/products",
      "/dashboard",
      "/search",
      "/training",
      ...(productId ? [`/products/${productId}`] : []),
    ])
      revalidatePath(route);
    return result;
  } catch (error) {
    return actionError(error);
  }
}
export async function removeCatalogProduct(productId: string): Promise<{ error?: string }> {
  try {
    await api(`/products/${z.uuid().parse(productId)}`, { method: "DELETE" });
    for (const route of ["/products", "/dashboard", "/search", "/training"]) revalidatePath(route);
    return {};
  } catch (error) {
    return actionError(error);
  }
}
