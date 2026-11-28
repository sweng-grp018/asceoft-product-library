import { Suspense } from "react";
import { notFound } from "next/navigation";
import { api, type Product } from "@/lib/api";
import { requirePermission } from "@/modules/auth/server/permissions";
import { ProductForm } from "@/modules/catalog/components/product-form";
import { PageLoading } from "@/components/layout/page-loading";
async function Edit({ params }: { params: Promise<{ productId: string }> }) {
  await requirePermission("products:edit", "/products");
  const { productId } = await params;
  try {
    const { product } = await api<{ product: Product }>(
      `/products/${encodeURIComponent(productId)}`,
      {},
      false,
    );
    return <ProductForm title="Edit product" product={product} />;
  } catch (error) {
    if (error instanceof Error && "status" in error && [400, 404].includes(Number(error.status)))
      notFound();
    throw error;
  }
}
export default function EditProduct(props: { params: Promise<{ productId: string }> }) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Edit {...props} />
    </Suspense>
  );
}
