"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { api, type Product } from "@/lib/api";
import { actionError } from "@/lib/action-result";
import { generateSku } from "../list-products/list-products.sku";

const input = z.object({
  sku: z.string().trim().min(1).max(100).optional(),
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
  if (!parsed.success) return { error: "Enter a product name and check the field lengths." };
  try {
    const path = productId ? `/products/${z.uuid().parse(productId)}` : "/products";
    const { sku, ...details } = parsed.data;
    const result = await api<{ product: Product }>(path, {
      method: productId ? "PATCH" : "POST",
      data: productId ? details : { ...details, sku: sku ?? generateSku() },
    });
    for (const route of [
      "/products",
      "/dashboard",
      "/search",
      "/repository",
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
    for (const route of ["/products", "/dashboard", "/search", "/repository"])
      revalidatePath(route);
    return {};
  } catch (error) {
    return actionError(error);
  }
}
