"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { categoryIcon } from "./list-products.icons";
import type { CatalogRow } from "./list-products.types";
import { EmptyCatalogState } from "./list-products-empty-state";
import { StatusPill } from "./status-pill";

const COLUMN_COUNT_WITH_ACTIONS = 5;
const COLUMN_COUNT_READ_ONLY = 4;

const HEAD_CELL =
  "h-auto px-4 py-3.5 text-[10px] font-semibold tracking-[0.08em] text-brand-ink uppercase xl:px-6";

type ListProductsTableProps = {
  rows: CatalogRow[];
  canEdit: boolean;
  query: string;
  onEdit: (row: CatalogRow) => void;
  onDelete: (row: CatalogRow) => void;
  onClearSearch: () => void;
};

export function ListProductsTable({
  rows,
  canEdit,
  query,
  onEdit,
  onDelete,
  onClearSearch,
}: ListProductsTableProps) {
  const columnCount = canEdit ? COLUMN_COUNT_WITH_ACTIONS : COLUMN_COUNT_READ_ONLY;

  return (
    <Table className="table-fixed">
      <TableCaption className="sr-only">
        Product catalog records with SKU, brand and indexing status.
      </TableCaption>

      <TableHeader>
        <TableRow className="border-0 bg-brand-tint hover:bg-brand-tint">
          <TableHead scope="col" className={`${HEAD_CELL} w-[124px] xl:w-[136px]`}>
            SKU
          </TableHead>
          <TableHead scope="col" className={`${HEAD_CELL} w-full`}>
            Product name
          </TableHead>
          <TableHead scope="col" className={`${HEAD_CELL} w-[136px] xl:w-[148px]`}>
            Brand
          </TableHead>
          <TableHead scope="col" className={`${HEAD_CELL} w-[140px] xl:w-[150px]`}>
            Status
          </TableHead>
          {canEdit ? (
            <TableHead scope="col" className={`${HEAD_CELL} w-[150px] text-right xl:w-[164px]`}>
              Actions
            </TableHead>
          ) : null}
        </TableRow>
      </TableHeader>

      <TableBody>
        {rows.map((row) => (
          <CatalogRowItem
            key={row.id}
            row={row}
            canEdit={canEdit}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

        {rows.length === 0 ? (
          <TableRow className="border-0 hover:bg-transparent">
            <TableCell colSpan={columnCount} className="py-16">
              <EmptyCatalogState query={query} onClearSearch={onClearSearch} />
            </TableCell>
          </TableRow>
        ) : null}
      </TableBody>
    </Table>
  );
}

function CatalogRowItem({
  row,
  canEdit,
  onEdit,
  onDelete,
}: {
  row: CatalogRow;
  canEdit: boolean;
  onEdit: (row: CatalogRow) => void;
  onDelete: (row: CatalogRow) => void;
}) {
  const Icon = categoryIcon(row.category);

  return (
    <TableRow className="h-16 border-line-subtle hover:bg-page">
      <TableCell className="px-4 font-mono text-[13px] font-semibold tracking-[0.02em] text-brand tabular-nums xl:px-6">
        {row.sku}
      </TableCell>

      <TableCell className="px-4 whitespace-normal xl:px-6">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
            <Icon aria-hidden className="size-[18px]" strokeWidth={1.9} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-medium text-brand-ink">{row.name}</p>
            <p className="truncate text-xs text-ink-muted">{row.category}</p>
          </div>
        </div>
      </TableCell>

      <TableCell className="truncate px-4 text-sm font-medium text-brand-ink xl:px-6">
        {row.brand}
      </TableCell>

      <TableCell className="px-4 xl:px-6">
        <div className="flex flex-col items-start gap-1">
          <StatusPill status={row.status} />
          {row.status === "FAILED" && row.indexError ? (
            <span className="text-[11px] font-medium text-status-failed-fg">{row.indexError}</span>
          ) : null}
        </div>
      </TableCell>

      {canEdit ? (
        <TableCell className="px-4 text-right xl:px-6">
          <div className="inline-flex items-center gap-1">
            <Button
              type="button"
              variant="brand-ghost"
              size="sm"
              onClick={() => onEdit(row)}
              aria-label={`Edit ${row.sku}`}
            >
              <PencilIcon data-icon="inline-start" />
              <span className="hidden xl:inline">Edit</span>
            </Button>
            <Button
              type="button"
              variant="danger-ghost"
              size="sm"
              onClick={() => onDelete(row)}
              aria-label={`Delete ${row.sku}`}
            >
              <Trash2Icon data-icon="inline-start" />
              <span className="hidden xl:inline">Delete</span>
            </Button>
          </div>
        </TableCell>
      ) : null}
    </TableRow>
  );
}
