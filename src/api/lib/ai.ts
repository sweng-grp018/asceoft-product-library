import axios from "axios";
import { z } from "zod";

export class ServerInferenceUnavailableError extends Error {
  constructor() {
    super("Photo search is unavailable. The photo search service has not been connected.");
    this.name = "ServerInferenceUnavailableError";
  }
}

// Compatibility client for explicitly configured standalone Python tooling.
// Browser inference will run independently of this server-side HTTP client.
export function createAiClient(serviceUrl: string | undefined) {
  if (!serviceUrl) throw new ServerInferenceUnavailableError();
  const base = new URL(serviceUrl);

  return async function aiRequest<T>(route: "/embed" | "/detect", image: Buffer): Promise<T> {
    try {
      const { data } = await axios.post<T>(
        new URL(route, base).toString(),
        { imageBase64: image.toString("base64") },
        {
          signal: AbortSignal.timeout(120_000),
          responseType: "json",
          transitional: { silentJSONParsing: false },
        },
      );
      return data;
    } catch {
      throw Object.assign(new Error("AI inference unavailable"), { status: 502 });
    }
  };
}

export const EMBEDDING_MODEL = "openclip-ViT-B-32-openai";
export const MATCH_THRESHOLD = 0.78;
const embedding = z
  .array(z.number().min(-1.001).max(1.001))
  .length(512)
  .refine((values) => values.some((value) => Math.abs(value) > 1e-10));

export const embeddingResult = z.object({
  embedding,
  model: z.literal(EMBEDDING_MODEL),
});
export const detectionResult = z.object({
  width: z.int().positive(),
  height: z.int().positive(),
  detectorModel: z.string(),
  detections: z
    .array(
      z.object({
        boundingBox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
        detectorScore: z.number().min(0).max(1),
        embedding,
      }),
    )
    .max(100),
});
