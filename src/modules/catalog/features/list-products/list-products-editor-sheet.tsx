"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { CheckIcon, FactoryIcon, ImageIcon, QrCodeIcon, SlidersHorizontalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { EMPTY_DRAFT, STATUS_META, STATUS_OPTIONS } from "./list-products.data";
import type { CatalogDraft, CatalogEditor, IndexStatus } from "./list-products.types";

const DESCRIPTION_LIMIT = 500;

const fieldClass =
  "h-11 rounded-lg border-line bg-card px-3.5 text-sm text-brand-ink caret-brand shadow-none placeholder:text-ink-placeholder focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15";

const leadingIconClass =
  "pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-muted";

type ListProductsEditorSheetProps = {
  editor: CatalogEditor | null;
  onClose: () => void;
  onSave: (draft: CatalogDraft) => void;
  onOpenProductPage: () => void;
};

/**
 * Edit/create drawer, built as a right-hand slide-over because the form is tall
 * enough to need its own scroll region above a sticky footer. The form is keyed
 * by the editor session so opening another record never inherits stale fields.
 */
export function ListProductsEditorSheet({
  editor,
  onClose,
  onSave,
  onOpenProductPage,
}: ListProductsEditorSheetProps) {
  return (
    <Sheet
      open={editor !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      {editor ? (
        <SheetContent
          side="right"
          className="w-full gap-0 border-l border-line bg-card p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-2xl"
        >
          <CatalogEditorForm
            key={editor.session}
            editor={editor}
            onSave={onSave}
            onOpenProductPage={onOpenProductPage}
          />
        </SheetContent>
      ) : null}
    </Sheet>
  );
}

function CatalogEditorForm({
  editor,
  onSave,
  onOpenProductPage,
}: {
  editor: CatalogEditor;
  onSave: (draft: CatalogDraft) => void;
  onOpenProductPage: () => void;
}) {
  const isEdit = editor.mode === "edit";

  const [draft, setDraft] = useState<CatalogDraft>(() =>
    editor.mode === "edit"
      ? {
          sku: editor.row.sku,
          name: editor.row.name,
          brand: editor.row.brand,
          category: editor.row.category,
          description: editor.row.description,
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
    <form onSubmit={submit} className="flex h-full flex-col">
      <div className="flex flex-col gap-2.5 border-b border-line-subtle bg-card px-6 py-5 pr-16 sm:px-8">
        <span className="w-fit rounded bg-brand-tint px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.08em] text-brand uppercase">
          {isEdit ? "Editing record" : "New record"}
        </span>

        <div className="flex flex-col gap-1">
          <SheetTitle className="text-xl leading-tight font-semibold tracking-tight text-brand-ink">
            {isEdit ? "Edit product" : "Add product"}
          </SheetTitle>
          <SheetDescription className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="font-mono text-[13px] font-semibold text-brand">
                {draft.sku.trim() || "SKU pending"}
              </span>
              <span aria-hidden>•</span>
            </span>
            <span className="font-medium text-brand-ink">
              {draft.name.trim() || "Untitled product"}
            </span>
          </SheetDescription>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-page px-6 py-6 sm:px-8">
        <div className="mx-auto flex max-w-xl flex-col gap-8">
          <section className="flex flex-col gap-4">
            <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h2 className="flex items-center gap-2 text-[13px] font-semibold tracking-[0.06em] text-brand-ink uppercase">
                <SlidersHorizontalIcon aria-hidden className="size-4 text-brand" />
                Product metadata
              </h2>
              <span className="text-[11px] text-ink-muted">* SKU, name and brand are required</span>
            </header>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="SKU code" htmlFor="catalog-product-sku">
                <div className="relative">
                  <QrCodeIcon aria-hidden className={leadingIconClass} />
                  <Input
                    id="catalog-product-sku"
                    required
                    maxLength={64}
                    autoComplete="off"
                    value={draft.sku}
                    onChange={(event) => update("sku", event.target.value)}
                    placeholder="SKU-10492"
                    className={`${fieldClass} pl-10 font-mono`}
                  />
                </div>
              </Field>

              <Field label="Manufacturer / brand" htmlFor="catalog-product-brand">
                <div className="relative">
                  <FactoryIcon aria-hidden className={leadingIconClass} />
                  <Input
                    id="catalog-product-brand"
                    required
                    maxLength={120}
                    value={draft.brand}
                    onChange={(event) => update("brand", event.target.value)}
                    placeholder="DeWalt"
                    className={`${fieldClass} pl-10`}
                  />
                </div>
              </Field>
            </div>

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
            </div>

            <Field
              label="Description"
              htmlFor="catalog-product-description"
              hint={`${draft.description.length} / ${DESCRIPTION_LIMIT} chars`}
            >
              <Textarea
                id="catalog-product-description"
                rows={3}
                maxLength={DESCRIPTION_LIMIT}
                value={draft.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="What distinguishes this item on a shelf photo?"
                className="min-h-[92px] resize-none rounded-lg border-line bg-card px-3.5 py-3 text-sm text-brand-ink caret-brand shadow-none placeholder:text-ink-placeholder focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15"
              />
            </Field>
          </section>

          {isEdit ? (
            <section className="flex flex-col gap-3 border-t border-line-subtle pt-6">
              <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h2 className="flex items-center gap-2 text-[13px] font-semibold tracking-[0.06em] text-brand-ink uppercase">
                  <ImageIcon aria-hidden className="size-4 text-brand" />
                  Reference photos
                </h2>
                <span className="text-[11px] text-ink-muted">Not loaded in this preview</span>
              </header>

              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line bg-card px-6 py-8 text-center">
                <span className="flex size-11 items-center justify-center rounded-full bg-brand-tint text-brand">
                  <ImageIcon aria-hidden className="size-5" />
                </span>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-brand-ink">
                    Reference photos live on the product page
                  </p>
                  <p className="mx-auto max-w-xs text-xs leading-relaxed text-ink-muted">
                    Uploading, choosing the primary photo and re-indexing all happen there, against
                    stored images.
                  </p>
                </div>
                <Button type="button" variant="brand-ghost" size="sm" onClick={onOpenProductPage}>
                  Open product page
                </Button>
              </div>
            </section>
          ) : null}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line-subtle bg-card px-6 py-4 sm:px-8">
        <p className="hidden items-center gap-2 text-xs text-ink-muted sm:flex">
          <span aria-hidden className="size-1.5 rounded-full bg-brand" />
          Changes stay in this preview
        </p>

        <div className="flex items-center gap-2">
          <SheetClose asChild>
            <Button type="button" variant="secondary" size="xl">
              Cancel
            </Button>
          </SheetClose>
          <Button type="submit" variant="brand" size="xl">
            <CheckIcon data-icon="inline-start" />
            {isEdit ? "Save changes" : "Create product"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={htmlFor}
          className="text-[11px] font-semibold tracking-[0.06em] text-ink-muted uppercase"
        >
          {label}
        </label>
        {hint ? <span className="text-[11px] text-ink-muted tabular-nums">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}
