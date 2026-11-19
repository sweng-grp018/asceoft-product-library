import Link from "next/link";
import { Suspense } from "react";
import { api, type Product } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { frontendPreview } from "@/lib/frontend-preview";
import { PublicCatalog } from "@/modules/catalog/features/frontend-preview/public-catalog";

type SearchParams = Promise<{ q?: string | string[] }>;

async function ProductResults({ q }: { q: string }) {
  let products: Product[] | null = null;
  try {
    ({ products } = await api<{ products: Product[] }>(
      `/products?q=${encodeURIComponent(q)}`,
      {},
      false,
    ));
  } catch {
    // Keep the search form available when the catalog service cannot be reached.
  }

  return (
    <>
      {products === null ? (
        <p role="alert">The product catalog is unavailable. Please try again later.</p>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            {products.map((p) => (
              <Link href={`/search/${p.id}`} key={p.id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{p.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <p className="text-muted-foreground">
                      {p.sku} · {p.brand || "Unbranded"}
                    </p>
                    <Badge variant="secondary">{p.indexStatus}</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          {!products.length && <p>No products found.</p>}
        </>
      )}
    </>
  );
}

async function SearchResults({ searchParams }: { searchParams: SearchParams }) {
  const query = (await searchParams).q;
  const q = (Array.isArray(query) ? query[0] : query)?.slice(0, 150) ?? "";

  if (frontendPreview) return <PublicCatalog initialQuery={q} />;

  return (
    <>
      <form>
        <FieldGroup className="flex-row items-end gap-2">
          <Field>
            <FieldLabel htmlFor="product-search" className="sr-only">
              Search products
            </FieldLabel>
            <Input
              id="product-search"
              name="q"
              defaultValue={q}
              maxLength={150}
              placeholder="What product are you looking for?"
            />
          </Field>
          <Button type="submit">Search</Button>
        </FieldGroup>
      </form>
      <Suspense fallback={<p>Loading products…</p>}>
        <ProductResults q={q} />
      </Suspense>
    </>
  );
}

export default function Search({ searchParams }: { searchParams: SearchParams }) {
  if (frontendPreview)
    return (
      <Suspense fallback={<p className="p-8">Loading catalog…</p>}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    );
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-7 px-5 py-14">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/" className="text-2xl font-semibold">
          Lensistry
        </Link>
        <Button asChild variant="outline">
          <Link href="/dashboard">Staff workspace</Link>
        </Button>
      </header>
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Find the right product</h1>
        <p className="mt-2 text-muted-foreground">
          Search the public product catalog by name, brand, or SKU.
        </p>
      </div>
      <Suspense fallback={<p>Loading catalog…</p>}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
