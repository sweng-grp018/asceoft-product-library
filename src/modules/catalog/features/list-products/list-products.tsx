"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { PLACEHOLDER_ROWS } from "./list-products.data";
import { ListProductsCardList } from "./list-products-card-list";
import { ListProductsDeleteDialog } from "./list-products-delete-dialog";
import { ListProductsEditorSheet } from "./list-products-editor-sheet";
import { ListProductsPagination } from "./list-products-pagination";
import { ListProductsTable } from "./list-products-table";
import { ListProductsToast } from "./list-products-toast";
import { ListProductsToolbar } from "./list-products-toolbar";
import type { CatalogDraft, CatalogEditor, CatalogRow, CatalogToast } from "./list-products.types";
import { useListProducts } from "./use-list-products";

/**
 * Product catalog screen.
 *
 * Static preview: rows come from `PLACEHOLDER_ROWS` and every mutation is local
 * state, so a reload restores the fixtures. Wiring the screen to the API means
 * replacing the `useListProducts` data source and mutators; the
 * toolbar, table, card list, pagination and dialogs stay as they are.
 */
export function ListProducts({ canEdit }: { canEdit: boolean }) {
  const {
    rows,
    visibleRows,
    query,
    setQuery,
    createRow,
    updateRow,
    removeRow,
    total,
    page,
    pageCount,
    start,
    end,
    previousPage,
    nextPage,
  } = useListProducts(PLACEHOLDER_ROWS);

  const [editor, setEditor] = useState<CatalogEditor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogRow | null>(null);
  const [toast, setToast] = useState<CatalogToast | null>(null);
  const sessionRef = useRef(0);

  function openCreate() {
    sessionRef.current += 1;
    setEditor({ mode: "create", row: null, session: sessionRef.current });
  }

  function openEdit(row: CatalogRow) {
    sessionRef.current += 1;
    setEditor({ mode: "edit", row, session: sessionRef.current });
  }

  const closeEditor = useCallback(() => setEditor(null), []);
  const closeDelete = useCallback(() => setDeleteTarget(null), []);
  const dismissToast = useCallback(() => setToast(null), []);
  const clearSearch = useCallback(() => setQuery(""), [setQuery]);

  /** Stable identity: the create wizard checks SKU uniqueness against this list. */
  const existingSkus = useMemo(() => rows.map((row) => row.sku), [rows]);

  function updateProduct(id: string, draft: CatalogDraft) {
    updateRow(id, draft);
    setToast({ message: `${draft.sku} updated.`, tone: "success" });
    setEditor(null);
  }

  function createProduct(draft: CatalogDraft, photoCount: number) {
    createRow(draft);

    const photos = `${photoCount} photo${photoCount === 1 ? "" : "s"}`;
    setToast({
      message: photoCount
        ? `${draft.sku} added as unindexed. ${photos} stayed on this device — upload them from the product page.`
        : `${draft.sku} added as unindexed — add reference photos to enable visual matching.`,
      tone: "success",
    });
    setEditor(null);
  }

  function confirmDelete() {
    if (!deleteTarget) return;

    removeRow(deleteTarget.id);
    setToast({ message: `${deleteTarget.sku} removed from the catalog.`, tone: "danger" });
    setDeleteTarget(null);
  }

  function announceProductPage() {
    setToast({
      message: "Reference photos live on the product page — not wired in this preview.",
      tone: "success",
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-brand-ink">Product catalog</h1>
        <p className="text-sm text-ink-muted">
          Manage the SKUs that visual search matches against.
        </p>
      </header>

      <ListProductsToolbar
        query={query}
        canCreate={canEdit}
        onQueryChange={setQuery}
        onCreate={openCreate}
      />

      <div className="overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-line">
        <div className="lg:hidden">
          <ListProductsCardList
            rows={visibleRows}
            canEdit={canEdit}
            query={query}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            onClearSearch={clearSearch}
          />
        </div>

        <div className="hidden lg:block">
          <ListProductsTable
            rows={visibleRows}
            canEdit={canEdit}
            query={query}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            onClearSearch={clearSearch}
          />
        </div>

        <ListProductsPagination
          start={start}
          end={end}
          total={total}
          page={page}
          pageCount={pageCount}
          onPrevious={previousPage}
          onNext={nextPage}
        />
      </div>

      <ListProductsEditorSheet
        editor={editor}
        existingSkus={existingSkus}
        onClose={closeEditor}
        onUpdate={updateProduct}
        onCreate={createProduct}
        onOpenProductPage={announceProductPage}
      />
      <ListProductsDeleteDialog
        target={deleteTarget}
        onClose={closeDelete}
        onConfirm={confirmDelete}
      />
      <ListProductsToast toast={toast} onDismiss={dismissToast} raised={editor !== null} />
    </div>
  );
}
