import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeading } from "@/components/layout/page-heading";
import { PageLoading } from "@/components/layout/page-loading";
import { PhotoTabs } from "@/modules/repository/features/photo-library/photo-tabs";
import { ProductPhotos } from "@/modules/repository/features/photo-library/product-photos";
import { ShelfPhotos } from "@/modules/repository/features/photo-library/shelf-photos";

export const metadata: Metadata = { title: "Photos" };

type Props = { searchParams: Promise<{ tab?: string }> };

export default function Photos(props: Props) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Photos"
        description="Save shelf photos and prepare product photos for search."
      />
      <Suspense fallback={<PageLoading />}>
        <PhotoLibrary {...props} />
      </Suspense>
    </div>
  );
}

async function PhotoLibrary({ searchParams }: Props) {
  const { tab } = await searchParams;
  const active = tab === "products" ? "products" : "shelf";
  return (
    <PhotoTabs active={active}>
      <Suspense key={active} fallback={<PageLoading />}>
        {active === "products" ? <ProductPhotos /> : <ShelfPhotos />}
      </Suspense>
    </PhotoTabs>
  );
}
