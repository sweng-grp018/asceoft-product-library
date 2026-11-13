"use client";

import { CheckIcon } from "lucide-react";
import { cn } from "cn";
import { CREATE_STEPS } from "./list-products.data";

type ListProductsStepperProps = {
  /** Zero-based index of the active step. */
  current: number;
  /** Only completed steps are navigable; forward jumps wait for validation. */
  onSelect: (index: number) => void;
};

/**
 * Onboarding progress for the create drawer. Rendered as an ordered list so a
 * screen reader announces `1 of 3` style progress instead of three loose spans.
 */
export function ListProductsStepper({ current, onSelect }: ListProductsStepperProps) {
  return (
    <ol className="grid grid-cols-3 gap-2 pt-1">
      {CREATE_STEPS.map((step, index) => {
        const isDone = index < current;
        const isCurrent = index === current;
        const isNavigable = isDone;

        return (
          <li key={step.key} className="flex flex-col gap-1.5">
            <span
              aria-hidden
              className={cn("h-1 rounded-full", isDone || isCurrent ? "bg-brand" : "bg-line")}
            />
            <button
              type="button"
              disabled={!isNavigable}
              onClick={() => onSelect(index)}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex items-center gap-1 text-left text-[11px] font-semibold transition-colors",
                isCurrent && "text-brand",
                isDone && "text-brand hover:text-brand-strong",
                !isDone && !isCurrent && "text-ink-muted",
                !isNavigable && "cursor-default",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                  isDone || isCurrent ? "bg-brand text-white" : "bg-line text-ink-muted",
                )}
              >
                {isDone ? <CheckIcon className="size-2.5" strokeWidth={3} /> : index + 1}
              </span>
              {step.label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
