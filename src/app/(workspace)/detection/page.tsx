import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import { allProducts } from "@/modules/catalog/server/products";
import { currentAccount } from "@/modules/auth/server/viewer";
import { PageHeading } from "@/components/layout/page-heading";
import { PageLoading } from "@/components/layout/page-loading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatShelfPhotoDate } from "@/modules/repository/features/photo-library/shelf-photos";
import { ShelfAnalysisForm } from "@/modules/repository/features/shelf-analysis/shelf-analysis-form";

export const metadata: Metadata = { title: "Find from a photo" };

export default function PhotoSearch() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Find from a photo"
        description="Find one product from a pack photo or look for several products in a saved shelf photo."
      />
      <Card className="max-w-2xl border-line">
        <CardHeader>
          <CardTitle>Product photo</CardTitle>
          <CardDescription>
            Choose a photo of a single pack to find similar products.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/search?mode=image">Search by image</Link>
          </Button>
        </CardContent>
      </Card>
      <Suspense fallback={<PageLoading />}>
        <ShelfAnalysis />
      </Suspense>
    </div>
  );
}

async function ShelfAnalysis() {
  const account = await currentAccount();
  if (!account || account.role === "PUBLIC") return null;

  const { images, serverInferenceEnabled } = await api<{
    images: { id: string; createdAt: string }[];
    serverInferenceEnabled: boolean;
  }>("/repository");
  const products = serverInferenceEnabled && images.length ? await allProducts() : [];
  return (
    <Card className="max-w-2xl border-line">
      <CardHeader>
        <CardTitle>Shelf photo</CardTitle>
        <CardDescription>
          {serverInferenceEnabled
            ? "Choose a saved shelf photo to find products."
            : "Photo search is unavailable right now. You can still save and view shelf photos."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {serverInferenceEnabled && images.length ? (
          <ShelfAnalysisForm
            images={images.map(({ id, createdAt }) => ({
              id,
              label: formatShelfPhotoDate(createdAt),
            }))}
            products={products.map(({ id, name, sku }) => ({ id, name, sku }))}
          />
        ) : (
          <Button asChild variant="outline">
            <Link href="/repository">
              {images.length ? "View shelf photos" : "Add a shelf photo"}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
