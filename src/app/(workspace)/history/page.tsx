import Link from "next/link";
import { api, type Match } from "@/lib/api";
import { allProducts } from "@/modules/catalog/server/products";
import { correctMatch } from "@/modules/repository/features/shelf-analysis/actions";
import { PageHeading } from "@/components/layout/page-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActionForm } from "@/components/action-form";
import { Field, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
export default async function History() {
  const [{ searches }, products] = await Promise.all([
    api<{ searches: { id: string; createdAt: string; matches: Match[] }[] }>(
      "/repository/searches/recent",
    ),
    allProducts(),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Past searches"
        description="Review your saved photo searches and correct any product choices."
        action={
          <Button asChild variant="brand" size="xl">
            <Link href="/detection">Find from a photo</Link>
          </Button>
        }
      />
      {searches.map((search) => (
        <Card key={search.id} className="border-line">
          <CardHeader>
            <CardTitle>
              {new Intl.DateTimeFormat("en-PH", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Asia/Manila",
              }).format(new Date(search.createdAt))}
            </CardTitle>
            <CardDescription>{search.matches.length} items found</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {search.matches.map((match, i) => (
              <div key={match.id} className="flex flex-col gap-3 rounded-xl border border-line p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold text-brand-ink">Item {i + 1}</h2>
                  <Badge variant="secondary">
                    {match.manuallySet
                      ? "Changed by you"
                      : match.productId
                        ? "Product suggested"
                        : "Needs a product choice"}
                  </Badge>
                </div>
                <ActionForm
                  action={correctMatch.bind(null, search.id, match.id)}
                  submitLabel="Save product choice"
                  variant="outline"
                >
                  <Field>
                    <FieldLabel htmlFor={`match-${match.id}`}>Product</FieldLabel>
                    <NativeSelect
                      id={`match-${match.id}`}
                      name="productId"
                      defaultValue={match.productId ?? ""}
                      className="w-full"
                    >
                      <NativeSelectOption value="">Unknown product</NativeSelectOption>
                      {products.map((product) => (
                        <NativeSelectOption key={product.id} value={product.id}>
                          {product.name} — {product.sku}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </Field>
                </ActionForm>
              </div>
            ))}
            {!search.matches.length && (
              <p className="text-sm text-ink-muted">No products were found in this photo.</p>
            )}
          </CardContent>
        </Card>
      ))}
      {!searches.length && (
        <Card className="border-line">
          <CardHeader>
            <CardTitle>No searches yet</CardTitle>
            <CardDescription>
              Your completed photo searches will appear here. You can save shelf photos while photo
              search is being connected.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/repository">View shelf photos</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
