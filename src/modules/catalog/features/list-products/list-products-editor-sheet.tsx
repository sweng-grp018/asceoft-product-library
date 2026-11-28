"use client";

import { useState, type FormEvent } from "react";
import { CheckIcon, ImageIcon, SlidersHorizontalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet";
import { ListProductsCreateWizard } from "./list-products-create-wizard";
import {
  BrandField,
  CategoryField,
  DescriptionField,
  NameField,
  SkuField,
} from "./list-products-form-fields";
import {
  SheetEyebrow,
  SheetPanel,
  SheetPanelBody,
  SheetPanelFooter,
  SheetPanelHeader,
  sheetSectionHeadingClass,
} from "./list-products-sheet-parts";
import type { CatalogDraft, CatalogEditor, CatalogRow } from "./list-products.types";

type ListProductsEditorSheetProps = {
  editor: CatalogEditor | null;
  /** SKUs already in the catalog, so the create step can reject a duplicate. */
  existingSkus: readonly string[];
  canManageReferenceImages: boolean;
  onClose: () => void;
  onUpdate: (id: string, draft: CatalogDraft) => void;
  onCreate: (draft: CatalogDraft, photos: import("./list-products.types").CatalogPhoto[]) => void;
  pending?: boolean;
  onOpenProductPage: () => void;
};

/**
 * Right-hand drawer for both flows. Editing is one scrolling form; creating is a
 * wizard (with reference photos for managers), so the shell only owns the Sheet and the mode dispatch.
 * Each body is keyed by the editor session so opening another record never
 * inherits stale fields.
 */
export function ListProductsEditorSheet({
  editor,
  existingSkus,
  canManageReferenceImages,
  onClose,
  onUpdate,
  onCreate,
  onOpenProductPage,
  pending,
}: ListProductsEditorSheetProps) {
  return (
    <Sheet
      open={editor !== null}
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      {editor ? (
        <SheetContent
          side="right"
          className="w-full gap-0 border-l border-line bg-card p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-2xl"
        >
          {editor.mode === "create" ? (
            <ListProductsCreateWizard
              key={editor.session}
              existingSkus={existingSkus}
              canManageReferenceImages={canManageReferenceImages}
              pending={pending}
              onCreate={onCreate}
            />
          ) : (
            <CatalogEditForm
              key={editor.session}
              pending={pending}
              row={editor.row}
              onSave={(draft) => onUpdate(editor.row.id, draft)}
              onOpenProductPage={onOpenProductPage}
            />
          )}
        </SheetContent>
      ) : null}
    </Sheet>
  );
}

function CatalogEditForm({
  row,
  onSave,
  onOpenProductPage,
  pending,
}: {
  row: CatalogRow;
  onSave: (draft: CatalogDraft) => void;
  onOpenProductPage: () => void;
  pending?: boolean;
}) {
  const [draft, setDraft] = useState<CatalogDraft>(() => ({
    sku: row.sku,
    name: row.name,
    brand: row.brand,
    category: row.category,
    description: row.description,
    status: row.status,
  }));

  function update<K extends keyof CatalogDraft>(key: K, value: CatalogDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pending) onSave(draft);
  }

  return (
    <SheetPanel onSubmit={submit}>
      <SheetPanelHeader
        eyebrow={<SheetEyebrow>Edit product</SheetEyebrow>}
        title="Edit product"
        description={
          <>
            <span className="font-mono text-[13px] font-semibold text-brand">
              {draft.sku.trim() || "Product code needed"}
            </span>
            <span aria-hidden className="mx-1.5">
              •
            </span>
            <span className="font-medium text-brand-ink">
              {draft.name.trim() || "Untitled product"}
            </span>
          </>
        }
      />

      <SheetPanelBody>
        <section className="flex flex-col gap-5">
          <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <h2 className={sheetSectionHeadingClass}>
              <SlidersHorizontalIcon aria-hidden className="size-4 text-brand" />
              Product details
            </h2>
            <span className="text-[11px] text-ink-muted">* Name and brand are required</span>
          </header>

          <div className="grid gap-4 sm:grid-cols-2">
            <SkuField idPrefix="edit-product" value={draft.sku} />
            <BrandField
              idPrefix="edit-product"
              value={draft.brand}
              onChange={(value) => update("brand", value)}
              required
            />
          </div>

          <NameField
            idPrefix="edit-product"
            value={draft.name}
            onChange={(value) => update("name", value)}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <CategoryField
              idPrefix="edit-product"
              value={draft.category}
              onChange={(value) => update("category", value)}
            />
          </div>

          <DescriptionField
            idPrefix="edit-product"
            value={draft.description}
            onChange={(value) => update("description", value)}
          />
        </section>

        <section className="flex flex-col gap-3 border-t border-line-subtle pt-6">
          <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 className={sheetSectionHeadingClass}>
              <ImageIcon aria-hidden className="size-4 text-brand" />
              Product photos
            </h2>
            <span className="text-[11px] text-ink-muted">Product photos</span>
          </header>

          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line bg-card px-6 py-8 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-brand-tint text-brand">
              <ImageIcon aria-hidden className="size-5" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-brand-ink">Explore the product details</p>
              <p className="mx-auto max-w-xs text-xs leading-relaxed text-ink-muted">
                View this product’s details, saved photos, and photo search status.
              </p>
            </div>
            <Button
              type="button"
              variant="brand-ghost"
              size="sm"
              disabled={pending}
              onClick={onOpenProductPage}
            >
              Open product page
            </Button>
          </div>
        </section>
      </SheetPanelBody>

      <SheetPanelFooter note="Changes are saved to your store">
        <SheetClose asChild>
          <Button type="button" variant="secondary" size="xl" disabled={pending}>
            Cancel
          </Button>
        </SheetClose>
        <Button type="submit" variant="brand" size="xl" disabled={pending}>
          <CheckIcon data-icon="inline-start" />
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </SheetPanelFooter>
    </SheetPanel>
  );
}
