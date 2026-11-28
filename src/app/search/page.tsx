import { Suspense } from "react";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import { currentAccount } from "@/modules/auth/server/viewer";
import { productPage, catalogRow } from "@/modules/catalog/server/products";
import { PublicCatalog } from "@/modules/catalog/features/public-search/public-catalog";
import { PageLoading } from "@/components/layout/page-loading";

export const metadata: Metadata = { title: "Browse products" };

async function Results({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; mode?: string }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.slice(0, 150) : "";
  const page = Math.min(10000, Math.max(1, Number.parseInt(params.page ?? "1") || 1));
  try {
    const [result, account, imageSearch] = await Promise.all([
      productPage(q, page),
      currentAccount(),
      api<{ enabled: boolean }>("/products/image-search/status", {}, false).catch(() => ({
        enabled: false,
      })),
    ]);
    return (
      <PublicCatalog
        key={`${q}:${page}:${params.mode ?? ""}`}
        initialMode={params.mode === "image" ? "image" : "name"}
        imageSearchEnabled={imageSearch.enabled}
        rows={result.products.map((product) => ({
          ...catalogRow(product),
          imageUrl: product.imageUrl ?? null,
        }))}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        initialQuery={q}
        account={account ? { name: account.name, role: account.role } : null}
      />
    );
  } catch {
    return (
      <main className="mx-auto flex max-w-xl flex-col gap-4 px-6 py-16">
        <h1 className="text-2xl font-semibold text-brand-ink">
          Products are unavailable right now.
        </h1>
        <p className="text-sm text-ink-muted">
          We could not load the store’s products. Please try again shortly.
        </p>
        <a href="/search" className="text-brand underline">
          Try again
        </a>
      </main>
    );
  }
}
export default function Search(props: {
  searchParams: Promise<{ q?: string; page?: string; mode?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <PageLoading />
        </div>
      }
    >
      <Results {...props} />
    </Suspense>
  );
}
