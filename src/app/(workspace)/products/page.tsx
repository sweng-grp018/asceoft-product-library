import { ListProducts } from "@/modules/catalog/features/list-products/list-products";
import { currentAccount } from "@/modules/auth/server/viewer";
import { productPage, catalogRow } from "@/modules/catalog/server/products";

export const metadata: Metadata = { title: "Products" };
type Props = { searchParams: Promise<{ q?: string; page?: string }> };

export default function Products(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6">
          <PageHeading
            title="Products"
            description="Keep your store’s grocery products easy to find."
          />
          <PageLoading />
        </div>
      }
    >
      <ProductList {...props} />
    </Suspense>
  );
}

async function ProductList({ searchParams }: Props) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.slice(0, 150) : "";
  const page = Math.min(10000, Math.max(1, Number.parseInt(params.page ?? "1") || 1));
  const [result, account] = await Promise.all([productPage(q, page), currentAccount()]);
  return (
    <ListProducts
      key={`${q}:${page}`}
      initialRows={result.products.map(catalogRow)}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      initialQuery={q}
      canEdit={account?.role === "ADMIN"}
    />
  );
}
import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeading } from "@/components/layout/page-heading";
import { PageLoading } from "@/components/layout/page-loading";
