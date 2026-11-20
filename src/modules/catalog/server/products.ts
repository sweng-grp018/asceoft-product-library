import "server-only";
import { api, type Product } from "@/lib/api";
import type { CatalogRow } from "../features/list-products/list-products.types";

export type ProductPage = { products: Product[]; total: number; page: number; pageSize: number };
export function catalogRow(product: Product): CatalogRow {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    brand: product.brand ?? "",
    category: product.category ?? "Other groceries",
    description: product.description ?? "",
    status: product.indexStatus,
    indexError: product.indexError ?? undefined,
  };
}
export async function productPage(query = "", page = 1) {
  return api<ProductPage>(`/products?q=${encodeURIComponent(query)}&page=${page}`, {}, false);
}
export async function allProducts() {
  const first = await api<ProductPage>("/products?pageSize=100", {}, false);
  const products = [...first.products];
  for (let page = 2; page <= Math.ceil(first.total / 100); page++)
    products.push(
      ...(await api<ProductPage>(`/products?pageSize=100&page=${page}`, {}, false)).products,
    );
  return products;
}
