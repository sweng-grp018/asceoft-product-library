import "server-only";
import axios, { type AxiosRequestConfig } from "axios";
import { auth } from "@/modules/auth/server/session";
import { apiUrl } from "@/lib/api-url";
import { connection } from "next/server";

export async function api<T>(
  path: string,
  options: AxiosRequestConfig = {},
  protectedRoute = true,
): Promise<T> {
  await connection();
  const session = protectedRoute ? await auth() : null;
  if (protectedRoute && !session?.accessToken) throw new Error("Sign in required");
  const response = await axios
    .request<T>({
      ...options,
      url: apiUrl(path).toString(),
      headers: {
        ...options.headers,
        ...(session?.accessToken ? { authorization: `Bearer ${session.accessToken}` } : {}),
      },
      responseType: "json",
      timeout: options.timeout ?? 15000,
      transitional: { silentJSONParsing: false },
      validateStatus: () => true,
    })
    .catch(() => {
      throw new Error("We could not reach the store service. Please try again.");
    });
  if (response.status < 200 || response.status >= 300) {
    const body = response.data as { error?: string } | null;
    throw Object.assign(new Error(body?.error ?? "We could not complete that request."), {
      status: response.status,
    });
  }
  if (response.status === 204) return undefined as T;
  return response.data;
}

export type Product = {
  id: string;
  imageUrl?: string | null;
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
