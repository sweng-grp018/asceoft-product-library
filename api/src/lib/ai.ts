// This synchronous POC contract deliberately avoids a queue; timeout failures are surfaced
// and indexed images can be retried from the CMS.
export async function aiRequest<T>(route: "/embed" | "/detect", image: Buffer): Promise<T> {
  const { config } = await import("./config.js");
  const response = await fetch(new URL(route, config.AI_SERVICE_URL), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ imageBase64: image.toString("base64") }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) throw Object.assign(new Error("AI inference unavailable"), { status: 502 });
  return (await response.json()) as T;
}

export type EmbeddingResult = { embedding: number[]; model: string };
export type DetectionResult = {
  width: number;
  height: number;
  detectorModel: string;
  detections: Array<{
    boundingBox: [number, number, number, number];
    detectorScore: number;
    embedding: number[];
  }>;
};

export function cosine(a: number[], b: number[]) {
  if (a.length === 0 || a.length !== b.length) return 0;
  let dot = 0;
  let aa = 0;
  let bb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    aa += a[i] * a[i];
    bb += b[i] * b[i];
  }
  return aa && bb ? dot / Math.sqrt(aa * bb) : 0;
}

export function bestMatch(
  embedding: number[],
  candidates: Array<{ productId: string; embedding: number[] }>,
  threshold = 0.78,
) {
  const ranked = candidates
    .map((item) => ({ productId: item.productId, similarity: cosine(embedding, item.embedding) }))
    .sort((a, b) => b.similarity - a.similarity);
  const best = ranked[0];
  return best && best.similarity >= threshold
    ? { productId: best.productId, similarity: best.similarity }
    : { productId: null, similarity: best?.similarity ?? null };
}
