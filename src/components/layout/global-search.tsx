"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ArrowUpRight, Package, Search } from "lucide-react";
import { z } from "zod";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { visibleStorePages } from "./navigation";

const productRows = z
  .array(
    z.object({
      id: z.uuid(),
      name: z.string(),
      sku: z.string(),
      brand: z.string().nullable(),
    }),
  )
  .max(7);
type ProductRow = z.infer<typeof productRows>[number];

function readRecent(key: string) {
  try {
    const result = productRows.safeParse(JSON.parse(sessionStorage.getItem(key) ?? "[]"));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export function GlobalSearchContent({
  role,
  accountId,
  onNavigate,
}: {
  role: string;
  accountId: string;
  onNavigate: () => void;
}) {
  const router = useRouter();
  const storageKey = `lensistry.search.products.${accountId}`;
  const [recent] = useState(() => readRecent(storageKey));
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<{ query: string; products?: ProductRow[] }>();
  const term = query.trim();
  const pages = visibleStorePages(role).filter(({ label }) =>
    label.toLowerCase().includes(term.toLowerCase()),
  );
  const products = term ? (response?.query === term ? response.products : undefined) : recent;
  const waiting = Boolean(term && response?.query !== term);

  useEffect(() => {
    if (!term) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const { data } = await axios.get<{ products: ProductRow[] }>("/api/product-suggestions", {
          params: { q: term },
          signal: controller.signal,
          timeout: 7000,
        });
        if (!controller.signal.aborted) setResponse({ query: term, products: data.products });
      } catch {
        if (!controller.signal.aborted) setResponse({ query: term });
      }
    }, 200);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [term]);

  function visit(href: string) {
    onNavigate();
    router.push(href);
  }

  function visitProduct(product: ProductRow) {
    try {
      const next = [product, ...recent.filter(({ id }) => id !== product.id)].slice(0, 5);
      sessionStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Search remains usable if storage is blocked.
    }
    visit(`/products/${encodeURIComponent(product.id)}`);
  }

  return (
    <Command shouldFilter={false} label="Search products and pages">
      <CommandInput
        value={query}
        onValueChange={setQuery}
        maxLength={150}
        placeholder="Search products and pages…"
      />
      <CommandList>
        {term && (
          <CommandGroup heading="Products">
            <CommandItem
              value="all-products"
              onSelect={() => visit(`/products?q=${encodeURIComponent(term)}`)}
            >
              <Search aria-hidden />
              Search products for “{term}”
            </CommandItem>
          </CommandGroup>
        )}
        {products && products.length > 0 && (
          <CommandGroup heading={term ? "Suggestions" : "Recently opened"}>
            {products.map((product) => (
              <CommandItem
                key={product.id}
                value={product.id}
                onSelect={() => visitProduct(product)}
              >
                <Package aria-hidden />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{product.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {[product.sku, product.brand].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {term && (
          <p role="status" className="px-3 py-1.5 text-xs text-muted-foreground">
            {waiting
              ? "Looking for products…"
              : products
                ? products.length
                  ? ""
                  : "No matching products."
                : "Product suggestions are unavailable."}
          </p>
        )}
        {pages.length > 0 && (
          <CommandGroup heading="Pages">
            {pages.map(({ label, href, icon: Icon }) => (
              <CommandItem key={href} value={href} onSelect={() => visit(href)}>
                <Icon aria-hidden />
                {label}
                <ArrowUpRight aria-hidden className="ml-auto" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}

export function GlobalSearchDialog({
  role,
  accountId,
  onNavigate,
}: {
  role: string;
  accountId: string;
  onNavigate: () => void;
}) {
  return (
    <DialogContent showCloseButton={false} className="top-1/4 translate-y-0 p-0 sm:max-w-lg">
      <DialogHeader className="sr-only">
        <DialogTitle>Search Lensistry</DialogTitle>
        <DialogDescription>
          Find products by name, brand, or product code, or open a workspace page.
        </DialogDescription>
      </DialogHeader>
      <GlobalSearchContent role={role} accountId={accountId} onNavigate={onNavigate} />
    </DialogContent>
  );
}
