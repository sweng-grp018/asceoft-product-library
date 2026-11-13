"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ListFilterIcon,
  PencilIcon,
  XIcon,
} from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NEARBY_SKU_COUNT } from "./detect-and-search.data";
import { DetectionCrop } from "./detect-and-search-frame";
import { confidenceBand, formatConfidence, nearbyOptions } from "./detect-and-search.logic";
import type {
  CaptureState,
  CatalogOption,
  Detection,
  DetectionAssignment,
  FrameSize,
} from "./detect-and-search.types";

type DetectionCardProps = {
  detection: Detection;
  capture: CaptureState;
  frame: FrameSize;
  catalog: CatalogOption[];
  assignment: DetectionAssignment | undefined;
  active: boolean;
  /** Committed sessions are read-only until they are reset. */
  locked: boolean;
  onSelect: () => void;
  onAssign: (sku: string) => void;
};

/**
 * One candidate object: the crop, the similarity band, the resolved SKU and an
 * inline resolver. The resolver starts open when nothing cleared the threshold,
 * because that card is the operator's only way forward.
 */
export function DetectAndSearchDetectionCard({
  detection,
  capture,
  frame,
  catalog,
  assignment,
  active,
  locked,
  onSelect,
  onAssign,
}: DetectionCardProps) {
  const [isPicking, setIsPicking] = useState(() => !assignment && detection.suggestedSku === null);
  const [selection, setSelection] = useState(assignment?.sku ?? "");

  useEffect(() => {
    if (locked) setIsPicking(false);
  }, [locked]);

  useEffect(() => {
    if (!isPicking) setSelection(assignment?.sku ?? "");
  }, [assignment, isPicking]);

  const band = confidenceBand(detection.confidence);
  const currentSku = assignment?.sku ?? detection.suggestedSku;
  const product = catalog.find((option) => option.sku === currentSku);
  const isUnknown = product === undefined;
  const nearby = nearbyOptions(catalog, currentSku, NEARBY_SKU_COUNT);

  function confirm() {
    if (!selection) return;
    onAssign(selection);
    setIsPicking(false);
  }

  return (
    <article
      id={`detection-${detection.id}`}
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-3.5 transition-shadow",
        isUnknown ? "border-notice-dot/35 bg-notice-bg/40" : "border-line bg-page/70",
        active && "ring-2 ring-brand/35",
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onSelect}
          aria-label={`Highlight detection ${detection.index} on the map`}
          className="shrink-0 rounded-lg focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none"
        >
          <DetectionCrop capture={capture} frame={frame} box={detection.box} className="size-20" />
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
            <div className="flex min-w-0 flex-col gap-0.5">
              <h3 className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-brand-ink">
                {isUnknown ? (
                  <>
                    <AlertTriangleIcon aria-hidden className="size-3.5 shrink-0 text-notice-fg" />
                    <span className="truncate text-notice-fg">Unknown product</span>
                  </>
                ) : (
                  <>
                    <span className="shrink-0 font-mono text-[13px] font-semibold whitespace-nowrap text-brand">
                      {product.sku}
                    </span>
                    <span aria-hidden className="shrink-0 text-ink-muted">
                      —
                    </span>
                    <span className="min-w-0 truncate">{product.name}</span>
                  </>
                )}
              </h3>
              <p className="truncate text-[11px] text-ink-muted">
                {product ? product.brand : "No catalog match above threshold"}
              </p>
            </div>

            <Button
              type="button"
              variant="brand-ghost"
              size="sm"
              className="border border-brand/20 bg-brand-tint/60"
              aria-expanded={isPicking}
              aria-controls={`detection-${detection.id}-resolver`}
              disabled={locked}
              onClick={() => setIsPicking((current) => !current)}
            >
              <PencilIcon />
              Correct match
              {isPicking ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[11px] text-ink-muted">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-semibold",
                band === "confident"
                  ? "bg-status-ready-bg text-status-ready-fg"
                  : "bg-notice-bg text-notice-fg",
              )}
            >
              {formatConfidence(detection.confidence)} match
            </span>

            <span className="rounded bg-card px-2 py-0.5 ring-1 ring-line">
              Class · {detection.classLabel}
            </span>
            <span className="rounded bg-card px-2 py-0.5 ring-1 ring-line">
              Orientation · {detection.orientation}
            </span>

            <AssignmentChip assignment={assignment} band={band} />
          </div>
        </div>
      </div>

      {isPicking ? (
        <div
          id={`detection-${detection.id}-resolver`}
          className="flex flex-col gap-2.5 rounded-lg border border-line bg-card px-3 py-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.06em] text-brand-ink uppercase">
              <ListFilterIcon aria-hidden className="size-3.5" />
              Assign a catalog SKU
            </p>
            <p className="text-[10px] text-ink-muted">Pick a SKU, then confirm</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={selection} onValueChange={setSelection}>
              <SelectTrigger
                aria-label={`Assign a SKU to detection ${detection.index}`}
                className="h-10 w-full flex-1 rounded-lg border-line bg-page text-sm text-brand-ink"
              >
                <SelectValue placeholder="Select a catalog SKU…" />
              </SelectTrigger>
              <SelectContent>
                {catalog.map((option) => (
                  <SelectItem key={option.sku} value={option.sku}>
                    <span className="font-mono text-[11px] font-semibold text-brand">
                      {option.sku}
                    </span>
                    <span className="truncate">{option.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="brand"
              size="xl"
              className="shrink-0"
              disabled={!selection}
              onClick={confirm}
            >
              <CheckIcon data-icon="inline-start" />
              Confirm override
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="icon-lg"
              className="shrink-0"
              aria-label="Close SKU picker"
              onClick={() => setIsPicking(false)}
            >
              <XIcon />
            </Button>
          </div>

          {nearby.length ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold tracking-[0.06em] text-ink-muted uppercase">
                Common nearby
              </span>
              {nearby.map((option) => (
                <button
                  key={option.sku}
                  type="button"
                  onClick={() => setSelection(option.sku)}
                  className={cn(
                    "rounded bg-page px-2 py-0.5 text-[11px] ring-1 transition-colors",
                    selection === option.sku
                      ? "bg-brand-tint text-brand ring-brand/30"
                      : "ring-line hover:bg-brand-tint hover:text-brand",
                  )}
                >
                  {option.sku} · {option.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function AssignmentChip({
  assignment,
  band,
}: {
  assignment: DetectionAssignment | undefined;
  band: ReturnType<typeof confidenceBand>;
}) {
  if (!assignment) {
    return (
      <span
        className={cn(
          "rounded-full px-2 py-0.5 font-semibold",
          band === "review"
            ? "bg-notice-bg text-notice-fg ring-1 ring-notice-dot/40"
            : "bg-status-pending-bg text-status-pending-fg",
        )}
      >
        {band === "review" ? "Needs review" : "Suggested"}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 font-semibold",
        assignment.source === "operator"
          ? "bg-status-processing-bg text-status-processing-fg"
          : "bg-status-ready-bg text-status-ready-fg",
      )}
    >
      {assignment.source === "operator" ? "Overridden" : "Accepted"}
    </span>
  );
}
