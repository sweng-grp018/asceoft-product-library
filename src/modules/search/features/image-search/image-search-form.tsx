"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { LoaderCircle, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { searchByImage } from "./actions";
import { validateImageFile } from "@/lib/image";
import { MAX_SEARCH_IMAGE_BYTES } from "./limits";

export function ImageSearchForm({ enabled, signedIn }: { enabled: boolean; signedIn: boolean }) {
  const [result, submit, pending] = useActionState(searchByImage, {});
  const [fileError, setFileError] = useState<string | null>(null);
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
      <Card className="max-w-2xl border-line">
        <CardHeader>
          <CardTitle>Search by image</CardTitle>
          <CardDescription>Choose a clear photo of one grocery product.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={submit}>
            <FieldGroup>
              <Field data-invalid={Boolean(fileError || result.error)}>
                <FieldLabel htmlFor="query-photo">Product photo</FieldLabel>
                <Input
                  id="query-photo"
                  name="photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  aria-describedby="query-photo-hint"
                  aria-invalid={Boolean(fileError || result.error)}
                  required
                  disabled={pending}
                  onChange={(event) => {
                    const photo = event.currentTarget.files?.[0];
                    setFileError(photo ? validateImageFile(photo, MAX_SEARCH_IMAGE_BYTES) : null);
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
                disabled={pending || Boolean(fileError)}
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
                  href={`/search/${product.productId}`}
                  className="flex h-full flex-col gap-1 rounded-xl border border-line bg-card p-4 hover:border-brand"
                >
                  <span className="font-medium text-brand-ink">{product.name}</span>
                  <span className="text-sm text-ink-muted">
                    {[product.sku, product.brand].filter(Boolean).join(" · ")}
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
