/** Catalog entry the resolver can assign to a detection. */
export type CatalogOption = {
  sku: string;
  name: string;
  brand: string;
};

/**
 * Bounding box in percentages of the frame, so one fixture can overlay a
 * viewport-sized schematic and an arbitrary uploaded photo.
 */
export type DetectionBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/** One candidate object returned for a frame. */
export type Detection = {
  id: string;
  /** 1-based number shown on the box and in the card copy. */
  index: number;
  box: DetectionBox;
  /** Similarity score in the 0..1 range. Not a calibrated probability. */
  confidence: number;
  /** Best catalog candidate, or `null` when nothing cleared the threshold. */
  suggestedSku: string | null;
  classLabel: string;
  orientation: string;
};

export type ConfidenceBand = "confident" | "review";

/** Who resolved the SKU for a detection. */
export type AssignmentSource = "accepted" | "operator";

export type DetectionAssignment = {
  sku: string;
  source: AssignmentSource;
};

export type Assignments = Record<string, DetectionAssignment>;

export type SampleCapture = { kind: "sample" };

export type UploadCapture = {
  kind: "upload";
  name: string;
  size: number;
  width: number;
  height: number;
  /** `URL.createObjectURL` handle; revoked when replaced, reset or unmounted. */
  url: string;
};

export type CaptureState = SampleCapture | UploadCapture;

export type FrameSize = { width: number; height: number };

/** Pixel rectangle in frame space, used by the crop thumbnails. */
export type PixelRect = { left: number; top: number; width: number; height: number };
