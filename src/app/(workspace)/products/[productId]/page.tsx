import { Suspense } from "react";
import { notFound } from "next/navigation";
import { api, type Product } from "@/lib/api";
import { currentAccount } from "@/modules/auth/server/viewer";
import { ProductDetailsView } from "@/modules/catalog/components/product-details";
import { PageLoading } from "@/components/layout/page-loading";
async function Details({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  try {
    const [result, account, photoResult] = await Promise.all([
      api<{ product: Product; serverInferenceEnabled: boolean }>(
        `/products/${encodeURIComponent(productId)}`,
        {},
        false,
      ),
      currentAccount(),
      api<{ images: { id: string; url: string }[] }>(
        `/products/${encodeURIComponent(productId)}/images`,
      ),
    ]);
    return (
      <ProductDetailsView
        product={result.product}
        photos={photoResult.images}
        canEdit={account?.role === "ADMIN"}
        canPrepare={result.serverInferenceEnabled}
      />
    );
  } catch (error) {
    if (error instanceof Error && "status" in error && [400, 404].includes(Number(error.status)))
      notFound();
    throw error;
  }
}
export default function ProductDetails(props: { params: Promise<{ productId: string }> }) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Details {...props} />
    </Suspense>
  );
}
