"use client";

import { SearchXIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyCatalogStateProps = {
  query: string;
  onClearSearch: () => void;
};

/** Shared empty state for both the table and the narrow-screen card list. */
export function EmptyCatalogState({ query, onClearSearch }: EmptyCatalogStateProps) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-3 px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-brand-tint text-ink-muted">
        <SearchXIcon aria-hidden className="size-6" />
      </span>
      <p className="text-base font-semibold text-brand-ink">No products found</p>
      <p className="text-sm text-ink-muted">
        Nothing matches “{query.trim()}”. Check the SKU format or try another keyword.
      </p>
      <Button type="button" variant="brand-ghost" size="sm" onClick={onClearSearch}>
        Clear search
      </Button>
    </div>
  );
}
