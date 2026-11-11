"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoryIcon } from "./list-products.icons";
import type { CatalogRow } from "./list-products.types";
import { EmptyCatalogState } from "./list-products-empty-state";
import { StatusPill } from "./status-pill";

type ListProductsCardListProps = {
  rows: CatalogRow[];
  canEdit: boolean;
  query: string;
  onEdit: (row: CatalogRow) => void;
  onDelete: (row: CatalogRow) => void;
  onClearSearch: () => void;
};

/**
 * Narrow-screen equivalent of the table. A five-column table cannot survive a
 * 256px sidebar plus a phone viewport, so below `lg` each record becomes a card
 * instead of scrolling sideways behind the card edge.
 */
export function ListProductsCardList({
  rows,
  canEdit,
  query,
  onEdit,
  onDelete,
  onClearSearch,
}: ListProductsCardListProps) {
  if (rows.length === 0) {
    return (
      <div className="py-16">
        <EmptyCatalogState query={query} onClearSearch={onClearSearch} />
      </div>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-line-subtle">
      {rows.map((row) => {
        const Icon = categoryIcon(row.category);

        return (
          <li key={row.id} className="flex flex-col gap-3 px-4 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
                <Icon aria-hidden className="size-[18px]" strokeWidth={1.9} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] leading-snug font-medium text-brand-ink">{row.name}</p>
                <p className="truncate text-xs text-ink-muted">
                  {row.category} · {row.brand}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pl-12">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[13px] font-semibold tracking-[0.02em] text-brand tabular-nums">
                  {row.sku}
                </span>
                <StatusPill status={row.status} />
              </div>

              {canEdit ? (
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="brand-ghost"
                    size="sm"
                    onClick={() => onEdit(row)}
                    aria-label={`Edit ${row.sku}`}
                  >
                    <PencilIcon data-icon="inline-start" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="danger-ghost"
                    size="sm"
                    onClick={() => onDelete(row)}
                    aria-label={`Delete ${row.sku}`}
                  >
                    <Trash2Icon data-icon="inline-start" />
                    Delete
                  </Button>
                </div>
              ) : null}
            </div>

            {row.status === "FAILED" && row.indexError ? (
              <p className="pl-12 text-[11px] font-medium text-status-failed-fg">
                {row.indexError}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
