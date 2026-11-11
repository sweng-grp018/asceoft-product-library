"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PHOTO_LIMIT, PHOTO_MAX_BYTES, PHOTO_TYPES } from "./list-products.data";
import type { CatalogPhoto } from "./list-products.types";

const ACCEPTED_TYPES = new Set<string>(PHOTO_TYPES);

function describeBytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Stages reference photos in the browser for the create drawer.
 *
 * Nothing is uploaded: the API only issues a presigned URL for a product that
 * already exists. Object URLs are revoked on removal and on unmount so a long
 * session does not leak blob memory.
 */
export function useReferencePhotos(limit: number = PHOTO_LIMIT) {
  const [photos, setPhotos] = useState<CatalogPhoto[]>([]);
  const [rejections, setRejections] = useState<string[]>([]);
  const photosRef = useRef<CatalogPhoto[]>([]);
  const objectUrls = useRef<string[]>([]);

  const commit = useCallback((next: CatalogPhoto[]) => {
    photosRef.current = next;
    setPhotos(next);
  }, []);

  const addFiles = useCallback(
    (files: FileList | File[] | null) => {
      const incoming = files ? Array.from(files) : [];
      if (!incoming.length) return;

      const accepted: CatalogPhoto[] = [];
      const rejected: string[] = [];
      let remaining = Math.max(0, limit - photosRef.current.length);

      for (const file of incoming) {
        if (!ACCEPTED_TYPES.has(file.type)) {
          rejected.push(`${file.name} is not a JPG, PNG or WEBP file.`);
          continue;
        }
        if (file.size > PHOTO_MAX_BYTES) {
          rejected.push(
            `${file.name} is ${describeBytes(file.size)}; the limit is ${describeBytes(PHOTO_MAX_BYTES)}.`,
          );
          continue;
        }
        if (remaining <= 0) {
          rejected.push(`Only ${limit} photos can be staged here.`);
          break;
        }

        const previewUrl = URL.createObjectURL(file);
        objectUrls.current.push(previewUrl);
        accepted.push({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          previewUrl,
        });
        remaining -= 1;
      }

      setRejections(rejected);
      if (accepted.length) commit([...photosRef.current, ...accepted]);
    },
    [commit, limit],
  );

  const removePhoto = useCallback(
    (id: string) => {
      const target = photosRef.current.find((photo) => photo.id === id);
      if (!target) return;

      URL.revokeObjectURL(target.previewUrl);
      objectUrls.current = objectUrls.current.filter((url) => url !== target.previewUrl);
      commit(photosRef.current.filter((photo) => photo.id !== id));
      setRejections([]);
    },
    [commit],
  );

  useEffect(() => {
    const urls = objectUrls;
    return () => {
      urls.current.forEach((url) => URL.revokeObjectURL(url));
      urls.current = [];
    };
  }, []);

  return { photos, rejections, addFiles, removePhoto, isFull: photos.length >= limit };
}
