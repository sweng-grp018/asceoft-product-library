"use client";
import Link from "next/link";
import { useState } from "react";
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
import { filterCatalogRows } from "../list-products/list-products.search";
import { catalogPreview } from "../list-products/catalog-preview-store";

export function PublicCatalog({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const rows = catalogPreview.useValue();
  const products = filterCatalogRows(rows, query);
  return (
    <main className="min-h-dvh bg-page">
      <header className="border-b border-line bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5">
          <Brand href="/search" />
          <Button asChild variant="outline" size="xl">
            <Link href="/sign-in">
              Staff sign in
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </header>
      <section className="mx-auto flex max-w-6xl flex-col gap-7 px-5 py-10 sm:py-14">
        <div className="flex max-w-2xl flex-col gap-4">
          <Badge variant="secondary" className="w-fit">
            The public library
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-brand-ink sm:text-5xl">
            Good products.
            <br />
            Easy to find.
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-ink-muted sm:text-base">
            Explore the library by product name, brand, or SKU. The details you need, all in one
            place.
          </p>
        </div>
        <Field className="max-w-2xl">
          <FieldLabel htmlFor="public-search" className="sr-only">
            Search the public catalog
          </FieldLabel>
          <InputGroup className="h-12 bg-background">
            <InputGroupAddon>
              <Search aria-hidden />
            </InputGroupAddon>
            <InputGroupInput
              id="public-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products, brands, or SKUs…"
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
        <div className="flex items-center justify-between">
          <p role="status" className="text-sm text-ink-muted">
            {products.length} {products.length === 1 ? "product" : "products"}
            {query ? ` matching “${query}”` : " to explore"}
          </p>
          <span className="text-xs text-ink-muted">Sample catalog</span>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="gap-4 border-line transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-4 flex h-28 items-center justify-center rounded-xl bg-brand-tint">
                  <Package className="size-12 text-brand/35" strokeWidth={1.2} aria-hidden />
                </div>
                <CardDescription>
                  {product.brand} · {product.category}
                </CardDescription>
                <CardTitle>
                  <Link href={`/search/${product.id}`} className="text-brand-ink hover:text-brand">
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
            <p className="text-sm text-ink-muted">Try a different product name, brand, or SKU.</p>
            <Button variant="outline" onClick={() => setQuery("")}>
              Clear search
            </Button>
          </div>
        )}
        <footer className="py-6 text-center text-xs text-ink-muted">
          You’re exploring sample products. No account needed.
        </footer>
      </section>
    </main>
  );
}
