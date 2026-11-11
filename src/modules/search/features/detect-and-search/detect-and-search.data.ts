import type { Detection, FrameSize } from "./detect-and-search.types";

/**
 * Fixture detections for the static preview.
 *
 * These are not model output. The screen labels the session as simulated
 * everywhere a score appears, and the review flow is real: every assignment,
 * override and commit below is local state.
 *
 * Boxes reuse the layout of the approved mockup so the overlay reads the same
 * on the sample frame and on a photo the operator stages.
 */
export const SAMPLE_DETECTIONS: Detection[] = [
  {
    id: "det-1",
    index: 1,
    box: { left: 16, top: 7, width: 33, height: 50 },
    confidence: 0.98,
    suggestedSku: "SKU-90214",
    classLabel: "Power tools · drill",
    orientation: "Upright",
  },
  {
    id: "det-2",
    index: 2,
    box: { left: 22, top: 55, width: 36, height: 46 },
    confidence: 0.94,
    suggestedSku: "SKU-88412",
    classLabel: "Hand tools · socket set",
    orientation: "Front face",
  },
  {
    id: "det-3",
    index: 3,
    box: { left: 66, top: 34, width: 28, height: 28 },
    confidence: 0.61,
    suggestedSku: null,
    classLabel: "Unclassified box",
    orientation: "—",
  },
];

/**
 * Similarity above this line is treated as a confident suggestion. A word of
 * care in the copy: cosine similarity is a ranking score, not a probability.
 */
export const HIGH_CONFIDENCE = 0.85;

/** No uploaded frame exists at first run, so the overlay draws on a schematic. */
export const SAMPLE_FRAME: FrameSize = { width: 1600, height: 1000 };

export const ZOOM_MIN = 1;
export const ZOOM_MAX = 2.5;
export const ZOOM_STEP = 0.25;

/** Guidance only. The API accepts any JPEG, PNG or WEBP up to 10 MB. */
export const CAPTURE_GUIDELINES = [
  "Even lighting with the product label facing the camera.",
  "Keep the shelf uprights in frame so the capture has an anchor.",
  "Shoot square-on: more than ~10° of tilt blurs the label.",
] as const;

/** How many nearby suggestions the override picker offers. */
export const NEARBY_SKU_COUNT = 2;
