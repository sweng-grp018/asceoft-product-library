"use client";

import { useCallback, useRef, useState } from "react";
import {
  PLACEHOLDER_PAGE,
  PLACEHOLDER_PAGE_COUNT,
  PLACEHOLDER_ROWS,
  PLACEHOLDER_TOTAL,
} from "./list-products.data";
import { ListProductsCardList } from "./list-products-card-list";
import { ListProductsDeleteDialog } from "./list-products-delete-dialog";
import { ListProductsEditorDialog } from "./list-products-editor-dialog";
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
 * replacing the `useListProducts` mutators and the placeholder totals here; the
 * toolbar, table, card list, pagination and dialogs stay as they are.
 */
export function ListProducts({ canEdit }: { canEdit: boolean }) {
  const { visibleRows, query, setQuery, createRow, updateRow, removeRow } =
    useListProducts(PLACEHOLDER_ROWS);

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

  function saveDraft(draft: CatalogDraft) {
    if (editor?.mode === "edit") {
      updateRow(editor.row.id, draft);
      setToast({ message: `${draft.sku} updated.`, tone: "success" });
    } else {
      createRow(draft);
      setToast({ message: `${draft.sku} added to the catalog.`, tone: "success" });
    }

    setEditor(null);
  }

  function confirmDelete() {
    if (!deleteTarget) return;

    removeRow(deleteTarget.id);
    setToast({ message: `${deleteTarget.sku} removed from the catalog.`, tone: "danger" });
    setDeleteTarget(null);
  }

  function announcePaging() {
    setToast({ message: "Pagination is not wired to the API yet.", tone: "success" });
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
          shownCount={visibleRows.length}
          total={PLACEHOLDER_TOTAL}
          page={PLACEHOLDER_PAGE}
          pageCount={PLACEHOLDER_PAGE_COUNT}
          onNext={announcePaging}
        />
      </div>

      <ListProductsEditorDialog editor={editor} onClose={closeEditor} onSave={saveDraft} />
      <ListProductsDeleteDialog
        target={deleteTarget}
        onClose={closeDelete}
        onConfirm={confirmDelete}
      />
      <ListProductsToast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
