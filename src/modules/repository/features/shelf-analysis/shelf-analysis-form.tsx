"use client";

import { useActionState, useState, useTransition } from "react";
import type { ActionResult } from "@/lib/action-result";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { analyzeSelectedShelf, correctMatch } from "./actions";

type ProductChoice = { id: string; name: string; sku: string };

export function ShelfAnalysisForm({
  images,
  products,
  canCorrectMatches,
}: {
  images: { id: string; label: string }[];
  products: ProductChoice[];
  canCorrectMatches: boolean;
}) {
  const [result, submit, pending] = useActionState(analyzeSelectedShelf, {});
  const { searchId, matches } = result;
  return (
    <div className="flex flex-col gap-5">
      <form action={submit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="search-photo">Saved shelf photo</FieldLabel>
            <NativeSelect
              id="search-photo"
              name="imageId"
              required
              disabled={pending}
              className="w-full"
            >
              {images.map((image) => (
                <NativeSelectOption key={image.id} value={image.id}>
                  {image.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <FieldError>{result.error}</FieldError>
          <Button type="submit" variant="brand" disabled={pending} className="w-fit">
            {pending ? "Searching photos…" : "Find products"}
          </Button>
        </FieldGroup>
      </form>
      {!pending && searchId && matches && (
        <div aria-label="Shelf photo results" className="flex flex-col gap-4">
          <p role="status" className="text-sm text-ink-muted">
            {matches.length
              ? `${matches.length} ${matches.length === 1 ? "item" : "items"} found`
              : "No products were found in this photo."}
          </p>
          {matches.map((match, index) => {
            const matched = match.productId
              ? products.find((product) => product.id === match.productId)
              : undefined;
            return (
              <section
                key={match.id}
                className="flex flex-col gap-3 rounded-xl border border-line p-4"
              >
                <h2 className="font-medium text-brand-ink">Item {index + 1}</h2>
                {canCorrectMatches ? (
                  <MatchChoice
                    searchId={searchId}
                    matchId={match.id}
                    initialProductId={match.productId}
                    products={products}
                  />
                ) : (
                  <p className="text-sm text-ink-muted">
                    {matched ? `${matched.name} — ${matched.sku}` : "Unknown product"}
                  </p>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MatchChoice({
  searchId,
  matchId,
  initialProductId,
  products,
}: {
  searchId: string;
  matchId: string;
  initialProductId: string | null;
  products: ProductChoice[];
}) {
  const [result, setResult] = useState<ActionResult>({});
  const [pending, startTransition] = useTransition();
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(async () => setResult(await correctMatch(searchId, matchId, data)));
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`match-${matchId}`}>Product</FieldLabel>
          <NativeSelect
            id={`match-${matchId}`}
            name="productId"
            defaultValue={initialProductId ?? ""}
            className="w-full"
            disabled={pending}
          >
            <NativeSelectOption value="">Unknown product</NativeSelectOption>
            {products.map((product) => (
              <NativeSelectOption key={product.id} value={product.id}>
                {product.name} — {product.sku}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <FieldError>{result.error}</FieldError>
        {result.message && (
          <p role="status" className="text-status-ready-fg">
            {result.message}
          </p>
        )}
        <Button type="submit" variant="outline" disabled={pending} className="w-fit">
          {pending ? "Saving…" : "Save product choice"}
        </Button>
      </FieldGroup>
    </form>
  );
}
