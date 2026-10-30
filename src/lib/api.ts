import "server-only";
import { auth } from "@/modules/auth/server/session";

const base = process.env.API_URL ?? "http://localhost:4000";

export async function api<T>(
  path: string,
  options: RequestInit = {},
  protectedRoute = true,
): Promise<T> {
  const session = protectedRoute ? await auth() : null;
  if (protectedRoute && !session?.accessToken) throw new Error("Sign in required");
  const response = await fetch(`${base}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      ...(options.body && typeof options.body === "string"
        ? { "content-type": "application/json" }
        : {}),
      ...(session?.accessToken ? { authorization: `Bearer ${session.accessToken}` } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `API request failed: ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export type Product = {
  id: string;
  sku: string;
  name: string;
  brand: string | null;
  category: string | null;
  description: string | null;
  indexStatus: "PENDING" | "PROCESSING" | "INDEXED" | "FAILED";
  indexError: string | null;
  images: Array<{
    id: string;
    isPrimary: boolean;
    contentType?: string;
    embeddingModel?: string | null;
  }>;
};

export type Match = {
  id: string;
  productId: string | null;
  boundingBox: number[];
  detectorScore: number;
  similarityScore: number | null;
  manuallySet: boolean;
};
