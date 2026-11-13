"use client";

import {
  AlertTriangleIcon,
  Maximize2Icon,
  ScanSearchIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";
import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CaptureSurface } from "./detect-and-search-frame";
import { confidenceBand, formatConfidence } from "./detect-and-search.logic";
import type { Assignments, CaptureState, Detection, FrameSize } from "./detect-and-search.types";

type DetectionMapProps = {
  capture: CaptureState;
  frame: FrameSize;
  detections: Detection[];
  assignments: Assignments;
  zoom: number;
  canZoomIn: boolean;
  canZoomOut: boolean;
  activeId: string | null;
  onSelect: (id: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
};

/**
 * Overlay for the staged frame. Boxes are percentage-positioned fixture data,
 * so they land in the same place on the sample schematic and on any photo.
 */
export function DetectAndSearchMap({
  capture,
  frame,
  detections,
  assignments,
  zoom,
  canZoomIn,
  canZoomOut,
  activeId,
  onSelect,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: DetectionMapProps) {
  const confident = detections.filter(
    (detection) => confidenceBand(detection.confidence) === "confident",
  );
  const review = detections.length - confident.length;

  return (
    <section className="flex flex-col gap-3 rounded-xl bg-card p-5 shadow-sm ring-1 ring-line">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-brand-ink">
          <ScanSearchIcon aria-hidden className="size-4 text-brand" />
          Visual detection map
          <Badge
            variant="outline"
            className="h-5 rounded-full border-line bg-page px-2 text-[10px] font-semibold text-ink-muted"
          >
            {detections.length} bounding box{detections.length === 1 ? "" : "es"}
          </Badge>
        </h2>

        <div className="flex items-center gap-1 rounded-lg bg-page p-1 ring-1 ring-line">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Zoom out"
            disabled={!canZoomOut}
            onClick={onZoomOut}
          >
            <ZoomOutIcon />
          </Button>
          <span className="w-9 text-center font-mono text-[11px] text-ink-muted tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Zoom in"
            disabled={!canZoomIn}
            onClick={onZoomIn}
          >
            <ZoomInIcon />
          </Button>
          <span aria-hidden className="mx-0.5 h-5 w-px bg-line" />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Reset zoom"
            disabled={zoom === 1}
            onClick={onResetZoom}
          >
            <Maximize2Icon />
          </Button>
        </div>
      </div>

      <div
        role="group"
        aria-label="Detection overlay on the captured frame"
        className="relative w-full overflow-hidden rounded-xl bg-page ring-1 ring-line"
        style={{ aspectRatio: `${frame.width} / ${frame.height}` }}
      >
        <div
          className="absolute inset-0 transition-transform duration-200 ease-out"
          style={{ transform: `scale(${zoom})` }}
        >
          <CaptureSurface capture={capture} />

          {detections.map((detection) => (
            <DetectionOutline
              key={detection.id}
              detection={detection}
              assignment={assignments[detection.id]}
              active={activeId === detection.id}
              onSelect={() => onSelect(detection.id)}
            />
          ))}
        </div>

        <span className="pointer-events-none absolute right-2 bottom-2 rounded bg-toast-surface/85 px-2 py-1 font-mono text-[10px] text-white">
          Frame 01 · {frame.width} × {frame.height} px
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink-muted">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded bg-notice-bg px-2 py-0.5 text-[10px] font-semibold tracking-[0.06em] text-notice-fg uppercase ring-1 ring-notice-dot/30">
            Simulated
          </span>
          <LegendItem className="bg-brand" label={`${confident.length} confident`} />
          <LegendItem className="bg-notice-dot" label={`${review} needs review`} />
        </div>
        <span className="font-mono">Inference time: not measured</span>
      </div>
    </section>
  );
}

function DetectionOutline({
  detection,
  assignment,
  active,
  onSelect,
}: {
  detection: Detection;
  assignment: Assignments[string] | undefined;
  active: boolean;
  onSelect: () => void;
}) {
  const band = confidenceBand(detection.confidence);
  const isReview = band === "review";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`Detection ${detection.index}: ${formatConfidence(detection.confidence)} match${
        assignment ? `, assigned ${assignment.sku}` : ", still unassigned"
      }`}
      className={cn(
        "absolute rounded-[3px] border-2 text-left transition-shadow focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:outline-none",
        isReview ? "border-notice-fg bg-notice-dot/15" : "border-brand bg-brand/10",
        active ? "shadow-[0_0_0_2px_rgba(255,255,255,0.9)]" : "hover:border-brand-strong",
      )}
      style={{
        left: `${detection.box.left}%`,
        top: `${detection.box.top}%`,
        width: `${detection.box.width}%`,
        height: `${detection.box.height}%`,
      }}
    >
      <span
        className={cn(
          "absolute -top-5 left-0 flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap text-white shadow-sm",
          isReview ? "bg-notice-fg" : "bg-brand",
        )}
      >
        {isReview ? <AlertTriangleIcon aria-hidden className="size-2.5" /> : null}#{detection.index}{" "}
        · {formatConfidence(detection.confidence)} match
      </span>
    </button>
  );
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span aria-hidden className={cn("size-1.5 rounded-full", className)} />
      {label}
    </span>
  );
}
