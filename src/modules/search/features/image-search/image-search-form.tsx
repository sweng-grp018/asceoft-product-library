"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { LoaderCircle, Package, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { searchByImage, type ImageSearchState } from "./actions";
import { validateImageFile } from "@/lib/image";
import { MAX_SEARCH_IMAGE_BYTES } from "./limits";

function MatchThumbnail({ url, name }: { url: string | null; name: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  return (
    <span className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-tint">
      {url && url !== failedUrl ? (
        <Image
          src={url}
          alt={name}
          fill
          unoptimized
          className="object-contain"
          onError={() => setFailedUrl(url)}
        />
      ) : (
        <>
          <Package aria-hidden className="size-7 text-ink-muted" />
          <span className="sr-only">Photo unavailable</span>
        </>
      )}
    </span>
  );
}

export function ImageSearchForm({ enabled, signedIn }: { enabled: boolean; signedIn: boolean }) {
  const [result, setResult] = useState<ImageSearchState>({});
  const [pending, startSearch] = useTransition();
  const [ready, setReady] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  useEffect(() => setReady(true), []);
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );
  if (!enabled) {
    return (
      <p className="rounded-xl border border-line bg-card p-5 text-sm text-ink-muted">
        Photo search is unavailable right now. You can still search by name or product code.
      </p>
    );
  }
  if (!signedIn) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-card p-5">
        <p className="text-sm text-ink-muted">Sign in to search with a product photo.</p>
        <Button asChild variant="outline">
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="max-w-3xl border-line">
        <CardHeader>
          <CardTitle>Search by image</CardTitle>
          <CardDescription>Choose a clear photo of one grocery product.</CardDescription>
        </CardHeader>
        <CardContent className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_auto]">
          <form
            className="min-w-0"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              startSearch(async () => {
                setResult(await searchByImage(data));
              });
            }}
          >
            <FieldGroup>
              <Field data-invalid={Boolean(fileError || result.error)}>
                <FieldLabel htmlFor="query-photo">Product photo</FieldLabel>
                <Input
                  id="query-photo"
                  name="photo"
                  type="file"
                  className="h-auto py-1.5 file:mr-3 file:h-8 file:cursor-pointer file:rounded-md file:bg-brand-tint file:px-3 file:text-brand-ink file:transition-colors file:duration-150 hover:file:bg-muted active:file:bg-brand active:file:text-white focus-visible:file:bg-muted motion-reduce:file:transition-none"
                  accept="image/jpeg,image/png,image/webp"
                  aria-describedby="query-photo-hint"
                  aria-invalid={Boolean(fileError || result.error)}
                  required
                  disabled={!ready || pending}
                  onChange={(event) => {
                    const photo = event.currentTarget.files?.[0];
                    const error = photo ? validateImageFile(photo, MAX_SEARCH_IMAGE_BYTES) : null;
                    setFileError(error);
                    setPreviewUrl(photo && !error ? URL.createObjectURL(photo) : null);
                    setResult({});
                  }}
                />
                <FieldDescription id="query-photo-hint">
                  JPG, PNG, or WebP up to 3 MB.
                </FieldDescription>
                <FieldError>{fileError ?? result.error}</FieldError>
              </Field>
              <Button
                type="submit"
                variant="brand"
                size="xl"
                className="w-fit"
                disabled={!ready || pending || Boolean(fileError)}
              >
                {pending ? (
                  <LoaderCircle data-icon="inline-start" className="animate-spin" />
                ) : (
                  <ScanSearch data-icon="inline-start" />
                )}
                {pending ? "Searching photos…" : "Find matching products"}
              </Button>
            </FieldGroup>
          </form>
          {previewUrl && (
            <Image
              src={previewUrl}
              alt="Selected product photo"
              width={224}
              height={176}
              unoptimized
              onError={() => {
                setPreviewUrl(null);
                setFileError("This photo could not be opened. Choose another photo.");
              }}
              className="h-44 w-full rounded-lg border border-line bg-page object-contain sm:w-56"
            />
          )}
        </CardContent>
      </Card>
      {!pending && result.matches && (
        <section aria-label="Image search results" className="flex flex-col gap-4">
          <p role="status" className="text-sm text-ink-muted">
            {result.matches.length
              ? `${result.matches.length} possible ${result.matches.length === 1 ? "match" : "matches"}`
              : "No close matches. Try a clearer photo of the front of the pack."}
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.matches.map((product) => (
              <li key={product.productId}>
                <Link
                  href={`/search/${product.productId}?from=image-search`}
                  className="flex h-full items-center gap-4 rounded-xl border border-line bg-card p-4 hover:border-brand"
                >
                  <MatchThumbnail url={product.imageUrl} name={product.name} />
                  <span className="flex min-w-0 flex-col gap-1 wrap-anywhere">
                    <span className="font-medium text-brand-ink">{product.name}</span>
                    {product.brand && (
                      <span className="text-sm text-ink-muted">{product.brand}</span>
                    )}
                    <span className="text-xs text-ink-muted">Product code {product.sku}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
