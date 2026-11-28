"use client";

import Image from "next/image";
import { useState } from "react";
import { Images, Package, ZoomIn } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PhotoPreviewContent } from "@/components/photo-preview-content";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ProductPhoto = { id: string; url: string | null };

export function ProductPhotoImage({ photo, name }: { photo: ProductPhoto; name: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  if (!photo.url || failedUrl === photo.url) {
    return (
      <span className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-muted">
        <Package aria-hidden className="size-10" />
        <span className="text-xs">Photo unavailable</span>
      </span>
    );
  }
  return (
    <Image
      src={photo.url}
      alt={name}
      fill
      unoptimized
      className="object-contain p-3"
      onError={() => setFailedUrl(photo.url)}
    />
  );
}

export function ProductPhotoGallery({
  photos,
  productName,
}: {
  photos: ProductPhoto[];
  productName: string;
}) {
  if (!photos.length) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl bg-brand-tint text-ink-muted">
        <Package aria-hidden className="size-12" />
        <span className="text-sm">No photos available</span>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`View ${photos.length} product ${photos.length === 1 ? "photo" : "photos"} for ${productName}`}
          className="group flex w-full cursor-pointer flex-col gap-3 rounded-xl p-3 text-left outline-none transition-colors duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:bg-brand-tint motion-reduce:transition-none"
        >
          <span className="relative block w-full pb-4 pr-4 pt-1">
            {photos.length > 1 && (
              <>
                {photos.length > 2 && (
                  <span
                    aria-hidden
                    className="absolute inset-0 left-4 top-4 overflow-hidden rounded-xl border border-line bg-background"
                  >
                    <ProductPhotoImage photo={photos[2]} name="" />
                  </span>
                )}
                <span
                  aria-hidden
                  className="absolute inset-0 bottom-2 left-2 right-2 top-2 overflow-hidden rounded-xl border border-line bg-background"
                >
                  <ProductPhotoImage photo={photos[1]} name="" />
                </span>
              </>
            )}
            <span className="relative block aspect-[4/3] overflow-hidden rounded-xl border border-line bg-background">
              <ProductPhotoImage photo={photos[0]} name={productName} />
            </span>
          </span>
          <span className="flex w-full items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-medium text-brand">
              <ZoomIn aria-hidden className="size-4" />
              View photos
            </span>
            {photos.length > 1 && (
              <Badge variant="secondary">
                <Images aria-hidden className="size-3" />
                {photos.length} photos
              </Badge>
            )}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] max-w-[calc(100vw_-_2rem)] grid-rows-[auto_minmax(0,1fr)] sm:max-w-3xl motion-reduce:animate-none">
        <DialogHeader className="pr-8">
          <DialogTitle>Product photos</DialogTitle>
          <DialogDescription>{productName}</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto p-1">
          <div className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 sm:grid-cols-3">
            {photos.map((photo, index) => (
              <Dialog key={photo.id}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    aria-label={`Enlarge photo ${index + 1} of ${productName}`}
                    className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-xl border border-line bg-background outline-none transition-colors duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:bg-brand-tint motion-reduce:transition-none"
                  >
                    <ProductPhotoImage photo={photo} name={`${productName}, photo ${index + 1}`} />
                    <span className="absolute bottom-2 right-2 rounded-md bg-background p-1.5 text-brand transition-colors group-hover:bg-brand-tint">
                      <ZoomIn aria-hidden className="size-4" />
                    </span>
                  </button>
                </DialogTrigger>
                <PhotoPreviewContent
                  title={productName}
                  description={`Photo ${index + 1} of ${photos.length}`}
                >
                  <ProductPhotoImage photo={photo} name={`${productName}, photo ${index + 1}`} />
                </PhotoPreviewContent>
              </Dialog>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
