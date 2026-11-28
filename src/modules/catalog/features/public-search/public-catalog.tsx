"use client";
import Link from "next/link";
import Image from "next/image";
import { useContext, useState } from "react";
import { ArrowRight, Package, Search, X } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Field, FieldLabel } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImageSearchForm } from "@/modules/search/features/image-search/image-search-form";
import { defaultHomePath } from "@/modules/auth/permissions";
import type { CatalogRow } from "../list-products/list-products.types";
import { BrowseSearchSessionContext } from "./browse-search-session";
import { PageLoading } from "@/components/layout/page-loading";

function CatalogThumbnail({ url, name }: { url: string | null; name: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  return (
    <div className="relative mb-4 flex h-28 items-center justify-center overflow-hidden rounded-xl bg-brand-tint">
      {url && failedUrl !== url ? (
        <Image
          src={url}
          alt={name}
          fill
          unoptimized
          className="object-contain p-3"
          onError={() => setFailedUrl(url)}
        />
      ) : (
        <Package className="size-12 text-brand/35" strokeWidth={1.2} aria-hidden />
      )}
    </div>
  );
}

type PublicCatalogProps = {
  initialQuery: string;
  initialMode: "name" | "image";
  imageSearchEnabled: boolean;
  rows: (CatalogRow & { imageUrl: string | null })[];
  total: number;
  page: number;
  pageSize: number;
  account?: { name: string; role: string } | null;
};

export function PublicCatalog(props: PublicCatalogProps) {
  const { visit, resetFilters } = useContext(BrowseSearchSessionContext);
  const staleFilter = resetFilters && (Boolean(props.initialQuery) || props.page > 1);

  if (staleFilter) return <PageLoading />;
  return <CatalogContent key={visit} {...props} />;
}

function CatalogContent({
  initialQuery,
  initialMode,
  imageSearchEnabled,
  rows,
  total,
  page,
  pageSize,
  account,
}: PublicCatalogProps) {
  const [query, setQuery] = useState(initialQuery);
  const products = rows;
  return (
    <main className="min-h-dvh bg-page">
      <header className="border-b border-line bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5">
          <Brand href="/search" />
          <Button asChild variant="outline" size="xl">
            <Link
              href={
                account
                  ? account.role === "PUBLIC"
                    ? "/account"
                    : defaultHomePath(account.role)
                  : "/sign-in"
              }
            >
              {account ? (account.role === "PUBLIC" ? "Profile" : "My store") : "Sign in"}
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </header>
      <section className="mx-auto flex max-w-6xl flex-col gap-7 px-5 py-10 sm:py-14">
        <div className="flex max-w-2xl flex-col gap-4">
          <Badge variant="secondary" className="w-fit">
            Grocery products
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-brand-ink sm:text-5xl">
            Browse products
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-ink-muted sm:text-base">
            Find rice, canned goods, drinks, and everyday essentials by name, brand, product code,
            or photo.
          </p>
        </div>
        <Tabs defaultValue={initialMode} className="gap-5">
          <TabsList aria-label="Search method" className="h-10">
            <TabsTrigger value="name" className="px-3">
              Search by name
            </TabsTrigger>
            <TabsTrigger value="image" className="px-3">
              Search by image
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="name"
            forceMount
            className="flex flex-col gap-6 data-[state=inactive]:hidden"
          >
            <form action="/search" className="flex max-w-2xl items-end gap-3">
              <Field className="max-w-2xl">
                <FieldLabel htmlFor="public-search" className="sr-only">
                  Find grocery products
                </FieldLabel>
                <InputGroup className="h-12 bg-background">
                  <InputGroupAddon>
                    <Search aria-hidden />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="public-search"
                    name="q"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search a name, brand, or product code…"
                    maxLength={150}
                  />
                  {query && (
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        size="icon-sm"
                        onClick={() => setQuery("")}
                        aria-label="Clear search"
                      >
                        <X />
                      </InputGroupButton>
                    </InputGroupAddon>
                  )}
                </InputGroup>
              </Field>
              <Button type="submit" variant="brand" size="xl">
                Search
              </Button>
            </form>
            <div className="flex items-center justify-between">
              <p role="status" className="text-sm text-ink-muted">
                {total} {total === 1 ? "product" : "products"}
                {initialQuery ? ` matching “${initialQuery}”` : " available"}
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="gap-4 border-line transition-shadow hover:shadow-md"
                >
                  <CardHeader>
                    <CatalogThumbnail url={product.imageUrl} name={product.name} />
                    <CardDescription>
                      {product.brand} · {product.category}
                    </CardDescription>
                    <CardTitle>
                      <Link
                        href={`/search/${product.id}`}
                        className="text-brand-ink hover:text-brand"
                      >
                        {product.name}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">
                      {product.description}
                    </p>
                  </CardContent>
                  <CardFooter className="mt-auto justify-between">
                    <span className="font-mono text-[11px] text-ink-muted">{product.sku}</span>
                    <Button variant="brand-ghost" asChild>
                      <Link href={`/search/${product.id}`}>
                        View details
                        <ArrowRight data-icon="inline-end" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            {!products.length && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-background px-6 py-16 text-center">
                <Search className="size-8 text-ink-muted" aria-hidden />
                <h2 className="text-lg font-semibold text-brand-ink">No products found</h2>
                <p className="text-sm text-ink-muted">
                  Try a different name, brand, or product code.
                </p>
                <Button asChild variant="outline">
                  <Link href="/search">Clear search</Link>
                </Button>
              </div>
            )}
            <nav aria-label="Product pages" className="flex items-center justify-between gap-3">
              {page <= 1 ? (
                <Button variant="outline" disabled>
                  Previous
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link href={`/search?q=${encodeURIComponent(initialQuery)}&page=${page - 1}`}>
                    Previous
                  </Link>
                </Button>
              )}
              <p className="text-xs text-ink-muted">
                Page {page} of {Math.max(1, Math.ceil(total / pageSize))}
              </p>
              {page * pageSize >= total ? (
                <Button variant="outline" disabled>
                  Next
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link href={`/search?q=${encodeURIComponent(initialQuery)}&page=${page + 1}`}>
                    Next
                  </Link>
                </Button>
              )}
            </nav>
          </TabsContent>
          <TabsContent value="image" forceMount className="data-[state=inactive]:hidden">
            <ImageSearchForm enabled={imageSearchEnabled} signedIn={Boolean(account)} />
          </TabsContent>
        </Tabs>
        <footer className="py-6 text-center text-xs text-ink-muted">
          Browse the store’s products. No sign-in needed.
        </footer>
      </section>
    </main>
  );
}
