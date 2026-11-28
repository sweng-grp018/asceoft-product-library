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
import type { CatalogDraft, CatalogDraftErrors, CatalogPhoto } from "./list-products.types";
import { useReferencePhotos } from "./use-reference-photos";

type ListProductsCreateWizardProps = {
  /** SKUs already in the catalog; the API enforces `@unique` on the column. */
  existingSkus: readonly string[];
  canManageReferenceImages: boolean;
  onCreate: (draft: CatalogDraft, photos: CatalogPhoto[]) => void;
  pending?: boolean;
};

/**
 * Onboarding wizard for a new SKU: metadata, optional reference photos (for managers),
 * and a review step. Metadata checks match the API (`sku` required and unique).
 */
export function ListProductsCreateWizard({
  existingSkus,
  canManageReferenceImages,
  onCreate,
  pending,
}: ListProductsCreateWizardProps) {
  const steps = canManageReferenceImages
    ? CREATE_STEPS
    : CREATE_STEPS.filter((item) => item.key !== "photos");
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<CatalogDraft>(() => ({ ...EMPTY_DRAFT, sku: generateSku() }));
  const [errors, setErrors] = useState<CatalogDraftErrors>({});
  const { photos, rejections, addFiles, removePhoto, isFull } = useReferencePhotos();

  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

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
      next.sku = "A product code is required.";
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
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
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

    onCreate(draft, canManageReferenceImages ? photos : []);
  }

  return (
    <SheetPanel onSubmit={handleSubmit} noValidate>
      <SheetPanelHeader
        eyebrow={<SheetEyebrow>New product</SheetEyebrow>}

        title="Add product"
        description={
          canManageReferenceImages
            ? "Add product details, choose photos, and check before saving."
            : "Add product details and check before saving."
        }
      >
        <ListProductsStepper steps={steps} current={stepIndex} onSelect={setStepIndex} />
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

        {step.key === "photos" && canManageReferenceImages ? (
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
            stepNumber={steps.length}
            canManageReferenceImages={canManageReferenceImages}
            photoCount={photos.length}
            onEdit={() => setStepIndex(0)}
          />
        ) : null}
      </SheetPanelBody>

      <SheetPanelFooter note="Your product will be saved to the store">
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

        <Button type="submit" variant="brand" size="xl" disabled={pending}>
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
