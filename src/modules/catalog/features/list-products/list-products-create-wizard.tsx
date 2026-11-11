"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";
import {
  CreateMetadataStep,
  CreatePhotosStep,
  CreateReviewStep,
} from "./list-products-create-steps";
import { CREATE_STEPS, EMPTY_DRAFT } from "./list-products.data";
import {
  SheetEyebrow,
  SheetPanel,
  SheetPanelBody,
  SheetPanelFooter,
  SheetPanelHeader,
} from "./list-products-sheet-parts";
import { generateSku, isSkuTaken } from "./list-products.sku";
import { ListProductsStepper } from "./list-products-stepper";
import type { CatalogDraft, CatalogDraftErrors } from "./list-products.types";
import { useReferencePhotos } from "./use-reference-photos";

type ListProductsCreateWizardProps = {
  /** SKUs already in the catalog; the API enforces `@unique` on the column. */
  existingSkus: readonly string[];
  onCreate: (draft: CatalogDraft, photoCount: number) => void;
};

/**
 * Three-step onboarding for a new SKU: metadata, staged reference photos, and a
 * review that spells out what indexing will do. Steps one and two must pass the
 * same checks the API applies (`sku` required and unique), so a reviewer cannot
 * reach the create action with a draft that would be rejected.
 */
export function ListProductsCreateWizard({
  existingSkus,
  onCreate,
}: ListProductsCreateWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<CatalogDraft>(() => ({ ...EMPTY_DRAFT, sku: generateSku() }));
  const [errors, setErrors] = useState<CatalogDraftErrors>({});
  const { photos, rejections, addFiles, removePhoto, isFull } = useReferencePhotos();

  const step = CREATE_STEPS[stepIndex];
  const isLastStep = stepIndex === CREATE_STEPS.length - 1;

  function update<K extends keyof CatalogDraft>(key: K, value: CatalogDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function validate() {
    const next: CatalogDraftErrors = {};

    if (!draft.sku.trim()) {
      next.sku = "A SKU is required.";
    } else if (isSkuTaken(draft.sku, existingSkus)) {
      next.sku = `${draft.sku.trim()} is already in the catalog.`;
    }
    if (!draft.name.trim()) next.name = "A product name is required.";
    if (!draft.brand.trim()) next.brand = "A brand is required.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function advance() {
    if (stepIndex === 0 && !validate()) return;
    setStepIndex((current) => Math.min(current + 1, CREATE_STEPS.length - 1));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isLastStep) {
      advance();
      return;
    }

    if (!validate()) {
      setStepIndex(0);
      return;
    }

    onCreate(draft, photos.length);
  }

  return (
    <SheetPanel onSubmit={handleSubmit} noValidate>
      <SheetPanelHeader
        eyebrow={<SheetEyebrow>New SKU onboarding</SheetEyebrow>}
        badge={<SheetEyebrow tone="muted">Preview only</SheetEyebrow>}
        title="Add product"
        description="Register a new SKU, stage its reference photos, and review what indexing will do."
      >
        <ListProductsStepper current={stepIndex} onSelect={setStepIndex} />
      </SheetPanelHeader>

      <SheetPanelBody resetKey={step.key}>
        {step.key === "metadata" ? (
          <CreateMetadataStep
            draft={draft}
            errors={errors}
            onChange={update}
            onGenerateSku={() => update("sku", generateSku())}
          />
        ) : null}

        {step.key === "photos" ? (
          <CreatePhotosStep
            photos={photos}
            rejections={rejections}
            isFull={isFull}
            onAddFiles={addFiles}
            onRemovePhoto={removePhoto}
          />
        ) : null}

        {step.key === "review" ? (
          <CreateReviewStep
            draft={draft}
            photoCount={photos.length}
            onEdit={() => setStepIndex(0)}
          />
        ) : null}
      </SheetPanelBody>

      <SheetPanelFooter note="Draft stays in this preview">
        <SheetClose asChild>
          <Button type="button" variant="secondary" size="xl">
            Cancel
          </Button>
        </SheetClose>

        {stepIndex > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="xl"
            onClick={() => setStepIndex((current) => Math.max(current - 1, 0))}
          >
            <ArrowLeftIcon data-icon="inline-start" />
            Back
          </Button>
        ) : null}

        <Button type="submit" variant="brand" size="xl">
          {isLastStep ? (
            <>
              <CheckIcon data-icon="inline-start" />
              Create product
            </>
          ) : (
            <>
              Continue
              <ArrowRightIcon data-icon="inline-end" />
            </>
          )}
        </Button>
      </SheetPanelFooter>
    </SheetPanel>
  );
}
