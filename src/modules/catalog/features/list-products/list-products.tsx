"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StatusToast, type ToastMessage } from "@/components/ui/status-toast";
import { ListProductsCardList } from "./list-products-card-list";
import { ListProductsDeleteDialog } from "./list-products-delete-dialog";
import { ListProductsEditorSheet } from "./list-products-editor-sheet";
import { ListProductsPagination } from "./list-products-pagination";
import { ListProductsTable } from "./list-products-table";
import { ListProductsToolbar } from "./list-products-toolbar";
import type { CatalogDraft, CatalogEditor, CatalogRow } from "./list-products.types";
import { saveCatalogProduct, removeCatalogProduct } from "../product-management/save-product";
import { uploadPhoto } from "@/modules/repository/features/photo-upload/upload-photo";
import type { CatalogPhoto } from "./list-products.types";

export function ListProducts({
  canEdit,
  initialRows,
  total,
  page,
  pageSize,
  initialQuery,
}: {
  canEdit: boolean;
  initialRows: CatalogRow[];
  total: number;
  page: number;
  pageSize: number;
  initialQuery: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [pending, startTransition] = useTransition();
  const rows = initialRows;
  const visibleRows = initialRows;
  const [editor, setEditor] = useState<CatalogEditor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogRow | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
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
  const clearSearch = useCallback(() => {
    setQuery("");
    router.push("/products");
  }, [router]);

  /** Stable identity: the create wizard checks SKU uniqueness against this list. */
  const existingSkus = useMemo(() => rows.map((row) => row.sku), [rows]);

  function updateProduct(id: string, draft: CatalogDraft) {
    if (pending) return;
    startTransition(async () => {
      const result = await saveCatalogProduct(draft, id);
      if (result.error) {
        setToast({ message: result.error, tone: "danger" });
        return;
      }
      setToast({ message: `${draft.name} saved.`, tone: "success" });
      setEditor(null);
      router.refresh();
    });
  }
  function createProduct(draft: CatalogDraft, photos: CatalogPhoto[]) {
    if (pending) return;
    startTransition(async () => {
      const result = await saveCatalogProduct(draft);
      if (!result.product) {
        setToast({ message: result.error ?? "We could not save this product.", tone: "danger" });
        return;
      }
      setEditor(null);
      try {
        for (const photo of photos) await uploadPhoto(photo.file, result.product.id);
        setToast({ message: `${draft.name} saved.`, tone: "success" });
      } catch {
        setToast({
          message:
            "Product saved, but some photos could not be saved. Open the product to add them again.",
          tone: "danger",
        });
      }
      router.refresh();
    });
  }
  function confirmDelete() {
    if (!deleteTarget || pending) return;
    startTransition(async () => {
      const result = await removeCatalogProduct(deleteTarget.id);
      if (result.error) {
        setToast({ message: result.error, tone: "danger" });
        return;
      }
      setToast({ message: `${deleteTarget.name} removed.`, tone: "success" });
      setDeleteTarget(null);
      router.refresh();
    });
  }
  function search() {
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
  }
  function openProductPage() {
    if (editor?.mode !== "edit") return;
    router.push(`/products/${editor.row.id}`);
    setEditor(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-brand-ink">Products</h1>
        <p className="text-sm text-ink-muted">Keep your store’s grocery products easy to find.</p>
      </header>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          search();
        }}
      >
        <ListProductsToolbar
          query={query}
          canCreate={canEdit}
          onQueryChange={setQuery}
          onCreate={openCreate}
        />
      </form>

      <div className="overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-line">
        <div className="lg:hidden">
          <ListProductsCardList
            rows={visibleRows}
            canEdit={canEdit}
            query={initialQuery}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            onClearSearch={clearSearch}
          />
        </div>

        <div className="hidden lg:block">
          <ListProductsTable
            rows={visibleRows}
            canEdit={canEdit}
            query={initialQuery}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            onClearSearch={clearSearch}
          />
        </div>

        <ListProductsPagination
          shownCount={visibleRows.length}
          total={total}
          page={page}
          pageCount={Math.max(1, Math.ceil(total / pageSize))}
          pageSize={pageSize}
          onPage={(next) =>
            router.push(`/products?q=${encodeURIComponent(initialQuery)}&page=${next}`)
          }
        />
      </div>

      <ListProductsEditorSheet
        pending={pending}
        editor={editor}
        existingSkus={existingSkus}
        onClose={closeEditor}
        onUpdate={updateProduct}
        onCreate={createProduct}
        onOpenProductPage={openProductPage}
      />
      <ListProductsDeleteDialog
        pending={pending}
        target={deleteTarget}
        onClose={closeDelete}
        onConfirm={confirmDelete}
      />
      <StatusToast toast={toast} onDismiss={dismissToast} raised={editor !== null} />
    </div>
  );
}
