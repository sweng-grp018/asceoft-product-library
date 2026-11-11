"use client";

import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CatalogRow } from "./list-products.types";

type ListProductsDeleteDialogProps = {
  target: CatalogRow | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function ListProductsDeleteDialog({
  target,
  onClose,
  onConfirm,
}: ListProductsDeleteDialogProps) {
  return (
    <Dialog
      open={target !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      {target ? (
        <DialogContent className="gap-0 overflow-hidden rounded-xl p-0 ring-line sm:max-w-md">
          <div className="px-6 py-6">
            <span className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Trash2Icon aria-hidden className="size-5" />
            </span>

            <DialogTitle className="mt-4 text-base font-semibold text-brand-ink">
              Delete product?
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-relaxed text-ink-muted">
              <span className="font-semibold text-brand-ink">{target.name}</span> (
              <span className="font-mono text-[13px] text-brand-ink">{target.sku}</span>) will be
              removed from the catalog. This cannot be undone.
            </DialogDescription>

            <div className="mt-6 flex items-center justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="secondary" size="xl">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" variant="danger" size="xl" onClick={onConfirm}>
                <Trash2Icon data-icon="inline-start" />
                Delete product
              </Button>
            </div>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
