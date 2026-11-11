/**
 * Image rules shared by every upload surface in the app.
 *
 * These mirror the authoritative checks in `api/src/modules/catalog` and
 * `services/app/main.py`: the API issues presigned URLs for these types, and the
 * inference service re-decodes the bytes and rejects anything else.
 */
export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const IMAGE_MAX_BYTES = 10 * 1024 * 1024;

const ACCEPTED = new Set<string>(IMAGE_MIME_TYPES);

export function describeBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Returns a human-readable reason, or `null` when the file is acceptable. */
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED.has(file.type)) {
    return `${file.name} is not a JPG, PNG or WEBP file.`;
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return `${file.name} is ${describeBytes(file.size)}; the limit is ${describeBytes(IMAGE_MAX_BYTES)}.`;
  }
  return null;
}

/** Reads the pixel dimensions of an object URL or remote image. */
export function readImageSize(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("Could not decode that image."));
    image.src = url;
  });
}
