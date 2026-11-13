"use client";

import { AlertTriangleIcon, CheckCircle2Icon, DownloadIcon, SparklesIcon } from "lucide-react";
import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DetectAndSearchDetectionCard } from "./detect-and-search-detection-card";
import { pendingConfidentDetections } from "./detect-and-search.logic";
import type {
  Assignments,
  CaptureState,
  CatalogOption,
  Detection,
  FrameSize,
} from "./detect-and-search.types";

type DetectionResultsProps = {
  capture: CaptureState;
  frame: FrameSize;
  detections: Detection[];
  assignments: Assignments;
  catalog: CatalogOption[];
  activeId: string | null;
  assigned: number;
  /** Set once the session is committed; cards and bulk actions lock. */
  committedAt: string | null;
  onSelect: (id: string) => void;
  onAssign: (id: string, sku: string) => void;
  onAcceptAll: () => void;
  onExport: () => void;
};

/**
 * Review queue for the current frame. The bulk action only covers suggestions
 * above the threshold; anything ambiguous must be assigned by hand.
 */
export function DetectAndSearchResults({
  capture,
  frame,
  detections,
  assignments,
  catalog,
  activeId,
  assigned,
  committedAt,
  onSelect,
  onAssign,
  onAcceptAll,
  onExport,
}: DetectionResultsProps) {
  const locked = committedAt !== null;
  const pending = pendingConfidentDetections(detections, assignments);
  const allAssigned = assigned === detections.length;

  return (
    <section className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow-sm ring-1 ring-line">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-brand-ink">
            Detected items
            <Badge
              variant="outline"
              className="h-5 rounded-full border-line bg-page px-2 text-[10px] font-semibold text-ink-muted"
            >
              {detections.length} identified
            </Badge>
          </h2>
          <p className="max-w-xl text-xs leading-relaxed text-ink-muted">
            Review the proposed classification and override any SKU before committing the session.
            Similarity ranks candidates; it is not a calibrated probability.
          </p>
        </div>

        <Button
          type="button"
          variant="brand-ghost"
          size="sm"
          className="w-full justify-center border border-brand/20 bg-brand-tint/60 sm:w-auto"
          disabled={locked || pending.length === 0}
          onClick={onAcceptAll}
        >
          <SparklesIcon />
          Accept all confident
        </Button>
      </header>

      <div className="flex flex-col gap-3">
        {detections.map((detection) => (
          <DetectAndSearchDetectionCard
            key={detection.id}
            detection={detection}
            capture={capture}
            frame={frame}
            catalog={catalog}
            assignment={assignments[detection.id]}
            active={activeId === detection.id}
            locked={locked}
            onSelect={() => onSelect(detection.id)}
            onAssign={(sku) => onAssign(detection.id, sku)}
          />
        ))}
      </div>

      <footer className="flex flex-col gap-3 border-t border-line-subtle pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={cn(
            "flex items-center gap-2 text-xs",
            allAssigned ? "text-status-ready-fg" : "text-ink-muted",
          )}
        >
          {allAssigned ? (
            <CheckCircle2Icon aria-hidden className="size-4 shrink-0" />
          ) : (
            <AlertTriangleIcon aria-hidden className="size-4 shrink-0 text-notice-fg" />
          )}
          <span>
            {assigned} of {detections.length} detected items assigned
            {committedAt ? ` · committed at ${committedAt}` : ""}
          </span>
        </p>

        <Button type="button" variant="secondary" size="xl" onClick={onExport}>
          <DownloadIcon data-icon="inline-start" />
          Export session JSON
        </Button>
      </footer>
    </section>
  );
}
