"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { api } from "@/lib/api";
import { auth } from "@/modules/auth/server/session";

async function adminOnly() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Admin access required");
}

const productSchema = z.object({
  name: z.string().trim().min(1).max(200),
  sku: z.string().trim().min(1).max(100),
  brand: z.string().trim().max(100),
  category: z.string().trim().max(100),
  description: z.string().trim().max(5000),
});
const formProduct = (data: FormData) =>
  productSchema.parse({
    name: data.get("name"),
    sku: data.get("sku"),
    brand: data.get("brand"),
    category: data.get("category"),
    description: data.get("description"),
  });

export async function createProduct(data: FormData) {
  await adminOnly();
  const { product } = await api<{ product: { id: string } }>("/products", {
    method: "POST",
    body: JSON.stringify(formProduct(data)),
  });
  revalidatePath("/products");
  redirect(`/products/${product.id}`);
}

export async function updateProduct(productId: string, data: FormData) {
  await adminOnly();
  await api(`/products/${z.uuid().parse(productId)}`, {
    method: "PATCH",
    body: JSON.stringify(formProduct(data)),
  });
  revalidatePath("/products");
  redirect(`/products/${productId}`);
}

export async function deleteProduct(productId: string) {
  await adminOnly();
  await api(`/products/${z.uuid().parse(productId)}`, { method: "DELETE" });
  revalidatePath("/products");
  redirect("/products");
}

async function putFile(file: File, destination: { uploadUrl: string; maxBytes: number }) {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size === 0 ||
    file.size > destination.maxBytes
  ) {
    throw new Error("Please upload a JPEG, PNG, or WebP image up to 10 MiB");
  }
  const upload = await fetch(destination.uploadUrl, {
    method: "PUT",
    headers: { "content-type": file.type },
    body: Buffer.from(await file.arrayBuffer()),
    cache: "no-store",
    signal: AbortSignal.timeout(60_000),
  });
  if (!upload.ok) throw new Error("Object storage upload failed");
}

export async function uploadReference(productId: string, data: FormData) {
  await adminOnly();
  const file = data.get("image");
  if (!(file instanceof File)) throw new Error("Choose an image");
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    !file.size ||
    file.size > 10 * 1024 * 1024
  )
    throw new Error("Invalid image");
  const destination = await api<{ uploadUrl: string; maxBytes: number }>(
    `/products/${z.uuid().parse(productId)}/images`,
    { method: "POST", body: JSON.stringify({ contentType: file.type }) },
  );
  await putFile(file, destination);
  revalidatePath(`/products/${productId}`);
}

export async function indexProduct(productId: string) {
  await adminOnly();
  await api(`/products/${z.uuid().parse(productId)}/index`, { method: "POST" });
  revalidatePath(`/products/${productId}`);
  revalidatePath("/training");
}
