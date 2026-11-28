import { Suspense } from "react";
import { notFound } from "next/navigation";
import { api, type Product } from "@/lib/api";
import { Brand } from "@/components/layout/brand";
import { ProductDetailsView } from "@/modules/catalog/components/product-details";
import { PageLoading } from "@/components/layout/page-loading";
async function Details({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { productId } = await params;
  const { from } = await searchParams;
  try {
    const { product, photos } = await api<{
      product: Product;
      photos: { id: string; url: string | null }[];
    }>(`/products/${encodeURIComponent(productId)}`, {}, false);
    return (
      <ProductDetailsView
        product={product}
        photos={photos}
        publicView
        fromImageSearch={from === "image-search"}
      />
    );
  } catch (error) {
    if (error instanceof Error && "status" in error && [400, 404].includes(Number(error.status)))
      notFound();
    throw error;
  }
}
export default function PublicProductDetails(props: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8">
      <Brand href="/search" />
      <Suspense fallback={<PageLoading />}>
        <Details {...props} />
      </Suspense>
    </main>
  );
}
