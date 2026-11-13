import type { CSSProperties } from "react";
import { HIGH_CONFIDENCE, SAMPLE_FRAME } from "./detect-and-search.data";
import type {
  Assignments,
  CaptureState,
  ConfidenceBand,
  Detection,
  DetectionBox,
  FrameSize,
  PixelRect,
} from "./detect-and-search.types";

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function frameSize(capture: CaptureState): FrameSize {
  return capture.kind === "upload"
    ? { width: capture.width, height: capture.height }
    : SAMPLE_FRAME;
}

export function confidenceBand(confidence: number): ConfidenceBand {
  return confidence >= HIGH_CONFIDENCE ? "confident" : "review";
}

export function formatConfidence(confidence: number) {
  return `${Math.round(confidence * 100)}%`;
}

/**
 * Expands a detection box to the smallest square that contains it, with a
 * little padding, then clamps it inside the frame. Cropping a square keeps the
 * card thumbnails aligned without distorting the image.
 */
export function squareCrop(box: DetectionBox, frame: FrameSize): PixelRect {
  const boxWidth = (box.width / 100) * frame.width;
  const boxHeight = (box.height / 100) * frame.height;
  const side = Math.min(Math.max(boxWidth, boxHeight) * 1.15, frame.width, frame.height);

  const centerX = ((box.left + box.width / 2) / 100) * frame.width;
  const centerY = ((box.top + box.height / 2) / 100) * frame.height;

  return {
    left: clamp(centerX - side / 2, 0, frame.width - side),
    top: clamp(centerY - side / 2, 0, frame.height - side),
    width: side,
    height: side,
  };
}

/**
 * Positions an image of `frame` size inside a cropped `rect` container. The
 * percentages are relative to the container, so the same math works at any
 * thumbnail size.
 */
export function cropStyle(rect: PixelRect, frame: FrameSize): CSSProperties {
  return {
    position: "absolute",
    width: `${(frame.width / rect.width) * 100}%`,
    height: `${(frame.height / rect.height) * 100}%`,
    left: `${-(rect.left / rect.width) * 100}%`,
    top: `${-(rect.top / rect.height) * 100}%`,
  };
}

export function assignedCount(assignments: Assignments) {
  return Object.keys(assignments).length;
}

export function unresolvedDetections(detections: Detection[], assignments: Assignments) {
  return detections.filter((detection) => !assignments[detection.id]);
}

export function pendingConfidentDetections(detections: Detection[], assignments: Assignments) {
  return detections.filter(
    (detection) =>
      detection.suggestedSku !== null &&
      confidenceBand(detection.confidence) === "confident" &&
      !assignments[detection.id],
  );
}

/** Catalog options offered as shortcuts in the override picker. */
export function nearbyOptions<T extends { sku: string }>(
  options: readonly T[],
  assignedSku: string | null,
  limit: number,
): T[] {
  return options.filter((option) => option.sku !== assignedSku).slice(0, limit);
}

export type SessionExportInput = {
  capture: CaptureState;
  frame: FrameSize;
  detections: Detection[];
  assignments: Assignments;
};

/** Plain object form of the session, shared by the JSON download and tests. */
export function buildSessionExport({
  capture,
  frame,
  detections,
  assignments,
}: SessionExportInput) {
  return {
    note: "Simulated session: detections are fixture data, not model output. Nothing was sent to the API.",
    generatedAt: new Date().toISOString(),
    frame: {
      source: capture.kind,
      name: capture.kind === "upload" ? capture.name : "sample-frame",
      width: frame.width,
      height: frame.height,
    },
    detections: detections.map((detection) => {
      const assignment = assignments[detection.id];

      return {
        index: detection.index,
        confidence: detection.confidence,
        box: detection.box,
        classLabel: detection.classLabel,
        orientation: detection.orientation,
        suggestedSku: detection.suggestedSku,
        assignedSku: assignment?.sku ?? null,
        resolution: assignment?.source ?? "unresolved",
      };
    }),
  };
}
