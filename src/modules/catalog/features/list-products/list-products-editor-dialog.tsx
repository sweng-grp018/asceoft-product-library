"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { CheckIcon, PackageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EMPTY_DRAFT, STATUS_META, STATUS_OPTIONS } from "./list-products.data";
import type { CatalogDraft, CatalogEditor, IndexStatus } from "./list-products.types";

const fieldClass =
  "h-11 rounded-lg border-line bg-card px-3.5 text-sm text-brand-ink caret-brand shadow-none placeholder:text-ink-placeholder focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15";

type ListProductsEditorDialogProps = {
  editor: CatalogEditor | null;
  onClose: () => void;
  onSave: (draft: CatalogDraft) => void;
};

/**
 * Create/edit dialog. One dialog serves both modes; the form is keyed by the
 * editor session so opening a different record never inherits stale field state.
 */
export function ListProductsEditorDialog({
  editor,
  onClose,
  onSave,
}: ListProductsEditorDialogProps) {
  return (
    <Dialog
      open={editor !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      {editor ? (
        <DialogContent className="gap-0 overflow-hidden rounded-xl p-0 ring-line sm:max-w-lg">
          <div className="flex items-center gap-2 border-b border-line-subtle bg-page py-4 pr-14 pl-6">
            <PackageIcon aria-hidden className="size-5 text-brand" />
            <DialogTitle className="text-base font-semibold text-brand-ink">
              {editor.mode === "edit" ? "Edit catalog item" : "Add product"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Catalog fields for one SKU record. Saving updates this preview only.
            </DialogDescription>
          </div>

          <CatalogEditorForm key={editor.session} editor={editor} onSave={onSave} />
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

function CatalogEditorForm({
  editor,
  onSave,
}: {
  editor: CatalogEditor;
  onSave: (draft: CatalogDraft) => void;
}) {
  const [draft, setDraft] = useState<CatalogDraft>(() =>
    editor.mode === "edit"
      ? {
          sku: editor.row.sku,
          name: editor.row.name,
          brand: editor.row.brand,
          category: editor.row.category,
          status: editor.row.status,
        }
      : {
          ...EMPTY_DRAFT,
          sku: `SKU-${Math.floor(10000 + Math.random() * 90000)}`,
        },
  );

  function update<K extends keyof CatalogDraft>(key: K, value: CatalogDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(draft);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 px-6 py-5">
      <Field label="SKU code" htmlFor="catalog-product-sku">
        <Input
          id="catalog-product-sku"
          required
          maxLength={64}
          autoComplete="off"
          value={draft.sku}
          onChange={(event) => update("sku", event.target.value)}
          placeholder="SKU-10492"
          className={`${fieldClass} font-mono`}
        />
      </Field>

      <Field label="Product name" htmlFor="catalog-product-name">
        <Input
          id="catalog-product-name"
          required
          maxLength={200}
          value={draft.name}
          onChange={(event) => update("name", event.target.value)}
          placeholder="Heavy-duty angle grinder"
          className={fieldClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Brand" htmlFor="catalog-product-brand">
          <Input
            id="catalog-product-brand"
            required
            maxLength={120}
            value={draft.brand}
            onChange={(event) => update("brand", event.target.value)}
            placeholder="DeWalt"
            className={fieldClass}
          />
        </Field>

        <Field label="Category" htmlFor="catalog-product-category">
          <Input
            id="catalog-product-category"
            maxLength={120}
            value={draft.category}
            onChange={(event) => update("category", event.target.value)}
            placeholder="Power tools"
            className={fieldClass}
          />
        </Field>
      </div>

      <Field label="Indexing status" htmlFor="catalog-product-status">
        <Select
          value={draft.status}
          onValueChange={(value) => update("status", value as IndexStatus)}
        >
          <SelectTrigger
            id="catalog-product-status"
            className="h-11 w-full rounded-lg border-line bg-card px-3.5 text-sm text-brand-ink"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_META[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div className="flex items-center justify-end gap-2 pt-1">
        <DialogClose asChild>
          <Button type="button" variant="secondary" size="xl">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" variant="brand" size="xl">
          <CheckIcon data-icon="inline-start" />
          {editor.mode === "edit" ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-semibold tracking-[0.06em] text-ink-muted uppercase"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
