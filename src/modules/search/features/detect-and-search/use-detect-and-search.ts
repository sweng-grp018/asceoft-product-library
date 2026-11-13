"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { readImageSize, validateImageFile } from "@/lib/image";
import { ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from "./detect-and-search.data";
import {
  assignedCount,
  clamp,
  frameSize,
  pendingConfidentDetections,
  unresolvedDetections,
} from "./detect-and-search.logic";
import type {
  Assignments,
  CaptureState,
  Detection,
  DetectionAssignment,
  UploadCapture,
} from "./detect-and-search.types";

/**
 * Owns one review session: the staged frame, the per-detection assignments,
 * the overlay zoom and the commit stamp. Everything is local; replace the
 * handlers with API calls and the presentational components stay unchanged.
 */
export function useDetectAndSearch(detections: Detection[]) {
  const [assignments, setAssignments] = useState<Assignments>({});
  const [upload, setUpload] = useState<UploadCapture | null>(null);
  const [rejection, setRejection] = useState<string | null>(null);
  const [zoom, setZoom] = useState(ZOOM_MIN);
  const [committedAt, setCommittedAt] = useState<string | null>(null);

  const uploadRef = useRef<UploadCapture | null>(null);

  const capture: CaptureState = useMemo(() => upload ?? { kind: "sample" }, [upload]);
  const frame = useMemo(() => frameSize(capture), [capture]);

  const assign = useCallback((id: string, assignment: DetectionAssignment) => {
    setAssignments((current) => ({ ...current, [id]: assignment }));
    setCommittedAt(null);
  }, []);

  const assignFromOperator = useCallback(
    (id: string, sku: string) => assign(id, { sku, source: "operator" }),
    [assign],
  );

  /** Accepts every confident suggestion that is still unassigned. */
  const acceptAllConfident = useCallback(() => {
    const pending = pendingConfidentDetections(detections, assignments);
    if (!pending.length) return 0;

    setAssignments((current) => {
      const next = { ...current };
      for (const detection of pending) {
        if (detection.suggestedSku) {
          next[detection.id] = { sku: detection.suggestedSku, source: "accepted" };
        }
      }
      return next;
    });
    setCommittedAt(null);
    return pending.length;
  }, [assignments, detections]);

  /**
   * Stages a single capture. The object URL is revoked when it is replaced,
   * reset or the screen unmounts, and a new frame clears the previous review.
   * Returns a human-readable rejection reason, or `null` on success.
   */
  const addPhoto = useCallback(async (file: File): Promise<string | null> => {
    const problem = validateImageFile(file);
    if (problem) {
      setRejection(problem);
      return problem;
    }

    let url: string | null = null;

    try {
      url = URL.createObjectURL(file);
      const { width, height } = await readImageSize(url);
      const next: UploadCapture = {
        kind: "upload",
        name: file.name,
        size: file.size,
        width,
        height,
        url,
      };

      if (uploadRef.current) URL.revokeObjectURL(uploadRef.current.url);
      uploadRef.current = next;
      setUpload(next);
      setRejection(null);
      setAssignments({});
      setZoom(ZOOM_MIN);
      setCommittedAt(null);
      return null;
    } catch {
      if (url) URL.revokeObjectURL(url);
      const message = "That file could not be decoded as an image.";
      setRejection(message);
      return message;
    }
  }, []);

  const resetSession = useCallback(() => {
    if (uploadRef.current) URL.revokeObjectURL(uploadRef.current.url);
    uploadRef.current = null;
    setUpload(null);
    setAssignments({});
    setRejection(null);
    setZoom(ZOOM_MIN);
    setCommittedAt(null);
  }, []);

  const zoomIn = useCallback(
    () => setZoom((current) => clamp(current + ZOOM_STEP, ZOOM_MIN, ZOOM_MAX)),
    [],
  );
  const zoomOut = useCallback(
    () => setZoom((current) => clamp(current - ZOOM_STEP, ZOOM_MIN, ZOOM_MAX)),
    [],
  );
  const resetZoom = useCallback(() => setZoom(ZOOM_MIN), []);

  const commitSession = useCallback(() => {
    setCommittedAt(
      new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
    );
  }, []);

  useEffect(() => {
    return () => {
      if (uploadRef.current) URL.revokeObjectURL(uploadRef.current.url);
      uploadRef.current = null;
    };
  }, []);

  const assigned = assignedCount(assignments);
  const unresolved = unresolvedDetections(detections, assignments);

  return {
    capture,
    frame,
    detections,
    assignments,
    rejection,
    zoom,
    committedAt,
    assigned,
    unresolved,
    allResolved: unresolved.length === 0,
    canZoomIn: zoom < ZOOM_MAX,
    canZoomOut: zoom > ZOOM_MIN,
    addPhoto,
    resetSession,
    assignFromOperator,
    acceptAllConfident,
    zoomIn,
    zoomOut,
    resetZoom,
    commitSession,
  };
}
