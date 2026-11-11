"use client";

import { useEffect } from "react";
import { CheckIcon, Trash2Icon } from "lucide-react";
import { cn } from "cn";
import type { CatalogToast } from "./list-products.types";

const TOAST_DURATION_MS = 3200;

type ListProductsToastProps = {
  toast: CatalogToast | null;
  onDismiss: () => void;
};

/**
 * Hand-rolled status toast: no toast primitive is installed in this project.
 * The timer lives here so callers only set and clear the message.
 */
export function ListProductsToast({ toast, onDismiss }: ListProductsToastProps) {
  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(onDismiss, TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  const isDanger = toast?.tone === "danger";

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed right-6 bottom-6 z-50"
    >
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-lg bg-toast-surface px-4 py-3 text-sm text-white shadow-xl transition-all duration-300",
          toast ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        )}
      >
        {isDanger ? (
          <Trash2Icon aria-hidden className="size-4 text-status-failed-dot" />
        ) : (
          <CheckIcon aria-hidden className="size-4 text-status-ready-dot" />
        )}
        <span>{toast?.message}</span>
      </div>
    </div>
  );
}
