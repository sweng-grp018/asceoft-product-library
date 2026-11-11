"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import {
  DatabaseIcon,
  ImageUpIcon,
  ImagesIcon,
  PencilIcon,
  RefreshCwIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { PHOTO_LIMIT, PHOTO_MAX_BYTES, PHOTO_TYPES, SUGGESTED_ANGLES } from "./list-products.data";
import {
  BrandField,
  CategoryField,
  DescriptionField,
  NameField,
  SkuField,
} from "./list-products-form-fields";
import { sheetSectionHeadingClass } from "./list-products-sheet-parts";
import { StatusPill } from "./status-pill";
import type { CatalogDraft, CatalogDraftErrors, CatalogPhoto } from "./list-products.types";

/* -------------------------------------------------------------------------- */
/* Step 1 - metadata                                                          */
/* -------------------------------------------------------------------------- */

export function CreateMetadataStep({
  draft,
  errors,
  onChange,
  onGenerateSku,
}: {
  draft: CatalogDraft;
  errors: CatalogDraftErrors;
  onChange: <K extends keyof CatalogDraft>(key: K, value: CatalogDraft[K]) => void;
  onGenerateSku: () => void;
}) {
  return (
    <section className="flex flex-col gap-5">
      <StepHeading
        index={1}
        icon={SlidersHorizontalIcon}
        title="Product metadata"
        hint="* Required to continue"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SkuField
          idPrefix="create-product"
          value={draft.sku}
          onChange={(value) => onChange("sku", value)}
          error={errors.sku}
          required
          action={
            <button
              type="button"
              onClick={onGenerateSku}
              className="flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline"
            >
              <RefreshCwIcon aria-hidden className="size-3" />
              Auto-generate
            </button>
          }
        />

        <BrandField
          idPrefix="create-product"
          value={draft.brand}
          onChange={(value) => onChange("brand", value)}
          error={errors.brand}
          required
        />
      </div>

      <NameField
        idPrefix="create-product"
        value={draft.name}
        onChange={(value) => onChange("name", value)}
        error={errors.name}
        required
      />

      <CategoryField
        idPrefix="create-product"
        value={draft.category}
        onChange={(value) => onChange("category", value)}
      />

      <DescriptionField
        idPrefix="create-product"
        value={draft.description}
        onChange={(value) => onChange("description", value)}
      />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 2 - photos                                                            */
/* -------------------------------------------------------------------------- */

export function CreatePhotosStep({
  photos,
  rejections,
  isFull,
  onAddFiles,
  onRemovePhoto,
}: {
  photos: CatalogPhoto[];
  rejections: string[];
  isFull: boolean;
  onAddFiles: (files: FileList | File[] | null) => void;
  onRemovePhoto: (id: string) => void;
}) {
  return (
    <section className="flex flex-col gap-5">
      <StepHeading
        index={2}
        icon={ImagesIcon}
        title="Visual reference photos"
        badge={
          <span className="rounded-full bg-brand-tint px-2.5 py-0.5 text-[11px] font-semibold text-brand">
            {photos.length} selected · 0 uploaded
          </span>
        }
      />

      <p className="text-xs leading-relaxed text-ink-muted">
        Staged on this device so you can see the set before submitting. Nothing uploads yet: uploads
        need a stored SKU and a short-lived upload URL from the API.
      </p>

      <PhotoDropzone isFull={isFull} onAddFiles={onAddFiles} />

      {rejections.length ? (
        <ul
          role="alert"
          className="flex flex-col gap-1 rounded-lg bg-destructive/5 px-3 py-2 ring-1 ring-destructive/15"
        >
          {rejections.map((rejection) => (
            <li key={rejection} className="text-[11px] font-medium text-destructive">
              {rejection}
            </li>
          ))}
        </ul>
      ) : null}

      {photos.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {photos.map((photo) => (
            <li
              key={photo.id}
              className="group relative overflow-hidden rounded-lg border border-line bg-card"
            >
              <Image
                src={photo.previewUrl}
                alt={photo.name}
                width={160}
                height={160}
                unoptimized
                className="aspect-square w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onRemovePhoto(photo.id)}
                aria-label={`Remove ${photo.name}`}
                className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-toast-surface/80 text-white transition-opacity focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
              >
                <XIcon aria-hidden className="size-3.5" />
              </button>
              <p className="truncate px-2 py-1.5 text-[11px] text-ink-muted" title={photo.name}>
                {photo.name}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-wrap gap-1.5">
        {[
          "JPG · PNG · WEBP",
          `${PHOTO_MAX_BYTES / (1024 * 1024)} MB per photo`,
          `Up to ${PHOTO_LIMIT} photos here`,
        ].map((rule) => (
          <span
            key={rule}
            className="rounded-md bg-card px-2 py-0.5 text-[11px] text-ink-muted ring-1 ring-line"
          >
            {rule}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-line-subtle bg-card px-4 py-3.5">
        <p className="text-[11px] font-semibold tracking-[0.06em] text-ink-muted uppercase">
          Suggested angles
        </p>
        <p className="text-xs leading-relaxed text-ink-muted">
          Guidance only — any clear photo of the item works. Indexing needs at least one photo.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_ANGLES.map((angle) => (
            <span
              key={angle}
              className="rounded-md bg-brand-tint px-2 py-0.5 text-[11px] font-medium text-brand"
            >
              {angle}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function PhotoDropzone({
  isFull,
  onAddFiles,
}: {
  isFull: boolean;
  onAddFiles: (files: FileList | File[] | null) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <label
      onDragOver={(event) => {
        event.preventDefault();
        if (!isFull) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        if (!isFull) onAddFiles(event.dataTransfer.files);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-8 text-center transition-colors focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15",
        isDragging ? "border-brand bg-brand-tint" : "border-line hover:border-brand/40",
        isFull && "cursor-not-allowed opacity-60",
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-brand-tint text-brand">
        <ImageUpIcon aria-hidden className="size-5" />
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-brand-ink">
          {isFull ? "Photo limit reached" : "Drag photos here, or browse this device"}
        </span>
        <span className="text-xs text-ink-muted">
          {isFull ? "Remove one to make room." : "Pick up to 5 photos of the item."}
        </span>
      </span>
      <input
        type="file"
        multiple
        accept={PHOTO_TYPES.join(",")}
        disabled={isFull}
        className="sr-only"
        onChange={(event) => {
          onAddFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 3 - review                                                            */
/* -------------------------------------------------------------------------- */

export function CreateReviewStep({
  draft,
  photoCount,
  onEdit,
}: {
  draft: CatalogDraft;
  photoCount: number;
  onEdit: () => void;
}) {
  return (
    <section className="flex flex-col gap-5">
      <StepHeading
        index={3}
        icon={SparklesIcon}
        title="Review"
        hint="Nothing is saved in this preview"
      />

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <dl className="divide-y divide-line-subtle">
          <ReviewRow label="SKU">
            <span className="font-mono text-[13px] font-semibold text-brand">{draft.sku}</span>
          </ReviewRow>
          <ReviewRow label="Product name">{draft.name || "—"}</ReviewRow>
          <ReviewRow label="Brand">{draft.brand || "—"}</ReviewRow>
          <ReviewRow label="Category">{draft.category || "Uncategorized"}</ReviewRow>
          <ReviewRow label="Description">
            <span className="line-clamp-2">{draft.description || "—"}</span>
          </ReviewRow>
          <ReviewRow label="Status">
            <StatusPill status="PENDING" />
          </ReviewRow>
          <ReviewRow label="Photos">
            {photoCount ? `${photoCount} selected · 0 uploaded` : "None selected"}
          </ReviewRow>
        </dl>

        <div className="border-t border-line-subtle px-3 py-2">
          <Button type="button" variant="brand-ghost" size="sm" onClick={onEdit}>
            <PencilIcon data-icon="inline-start" />
            Edit details
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-brand-tint/70 px-4 py-4 ring-1 ring-brand/10">
        <p className="text-[11px] font-semibold tracking-[0.06em] text-brand uppercase">
          What indexing does
        </p>
        <ol className="flex flex-col gap-3">
          <NextStep
            icon={DatabaseIcon}
            title="The SKU is stored as unindexed"
            body="Text search matches its name, brand and SKU straight away; visual search has nothing to compare against yet."
          />
          <NextStep
            icon={ImageUpIcon}
            title="Photos upload from the product page"
            body="Each reference image goes to object storage through a short-lived upload URL, then is marked as the primary photo."
          />
          <NextStep
            icon={SparklesIcon}
            title="Indexing computes embeddings"
            body="YOLO11 finds the item in a scan and CLIP embeddings measure similarity per reference photo. This is inference, not model training."
          />
        </ol>
      </div>
    </section>
  );
}

function ReviewRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-2.5">
      <dt className="shrink-0 text-[11px] font-semibold tracking-[0.06em] text-ink-muted uppercase">
        {label}
      </dt>
      <dd className="min-w-0 text-right text-sm text-brand-ink">{children}</dd>
    </div>
  );
}

function NextStep({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof DatabaseIcon;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-card text-brand ring-1 ring-brand/15">
        <Icon aria-hidden className="size-3.5" />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold text-brand-ink">{title}</span>
        <span className="text-[11px] leading-relaxed text-ink-muted">{body}</span>
      </span>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared                                                                      */
/* -------------------------------------------------------------------------- */

function StepHeading({
  index,
  icon: Icon,
  title,
  hint,
  badge,
}: {
  index: number;
  icon: typeof DatabaseIcon;
  title: string;
  hint?: string;
  badge?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <h2 className={sheetSectionHeadingClass}>
        <span
          aria-hidden
          className="flex size-5 items-center justify-center rounded bg-brand-tint font-mono text-[10px] font-bold text-brand"
        >
          {index}
        </span>
        <Icon aria-hidden className="size-4 text-brand" />
        {title}
      </h2>
      {badge ?? (hint ? <span className="text-[11px] text-ink-muted">{hint}</span> : null)}
    </header>
  );
}
