import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageLoading } from "@/components/layout/page-loading";
import { auth } from "@/modules/auth/server/session";
import { api, type Product } from "@/lib/api";
import { updateProduct } from "@/modules/catalog/features/product-management/actions";
import { ProductForm } from "@/modules/catalog/components/product-form";
import { frontendPreview } from "@/lib/frontend-preview";
import { PreviewProductForm } from "@/modules/catalog/features/frontend-preview/preview-product";

async function EditProductContent({ params }: { params: Promise<{ productId: string }> }) {
  if (frontendPreview) return <PreviewProductForm productId={(await params).productId} />;
  if ((await auth())?.user.role !== "ADMIN") redirect("/products");
  const { productId } = await params;
  const { product } = await api<{ product: Product }>(
    `/products/${encodeURIComponent(productId)}`,
    {},
    false,
  );
  return (
    <ProductForm
      title={`Edit ${product.name}`}
      product={product}
      action={updateProduct.bind(null, productId)}
    />
  );
}

export default function EditProduct(props: { params: Promise<{ productId: string }> }) {
  return (
    <Suspense fallback={<PageLoading />}>
      <EditProductContent {...props} />
    </Suspense>
  );
}
