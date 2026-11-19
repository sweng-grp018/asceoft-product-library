"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ImagePlus, Package, Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { PageHeading } from "@/components/layout/page-heading";
import { StatusPill } from "../list-products/status-pill";
import { catalogPreview } from "../list-products/catalog-preview-store";

export function PreviewProductDetails({
  productId,
  publicView = false,
}: {
  productId: string;
  publicView?: boolean;
}) {
  const product = catalogPreview.useValue().find((row) => row.id === productId);
  const back = publicView ? "/search" : "/products";
  if (!product) return <MissingProduct href={back} />;
  return (
    <div className="flex flex-col gap-6">
      <Link
        href={back}
        className="flex w-fit items-center gap-2 text-sm text-brand hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to catalog
      </Link>
      <PageHeading
        title={product.name}
        description={`${product.brand} · ${product.sku}`}
        action={
          !publicView ? (
            <Button asChild variant="brand" size="xl">
              <Link href={`/products/${product.id}/edit`}>
                <Pencil data-icon="inline-start" />
                Edit product
              </Link>
            </Button>
          ) : undefined
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="border-line">
          <CardHeader>
            <CardTitle>Reference photos</CardTitle>
            <CardDescription>A clear view makes a better match.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex aspect-square max-h-80 flex-col items-center justify-center gap-4 rounded-xl bg-brand-tint text-brand">
              <Package className="size-20" strokeWidth={1} aria-hidden />
              <span className="text-xs text-ink-muted">Sample product · no reference photos</span>
            </div>
          </CardContent>
          {!publicView && (
            <CardFooter>
              <Button asChild variant="outline" size="xl" className="w-full">
                <Link href="/products">
                  <ImagePlus data-icon="inline-start" />
                  Stage photos in the catalog
                </Link>
              </Button>
            </CardFooter>
          )}
        </Card>
        <Card className="h-fit border-line">
          <CardHeader>
            <CardTitle>Product information</CardTitle>
            <CardDescription>{product.category}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <p className="text-sm leading-relaxed text-ink-muted">
              {product.description || "No description added yet."}
            </p>
            <dl className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <dt className="mb-1 text-xs text-ink-muted">SKU</dt>
                <dd className="font-mono text-brand-ink">{product.sku}</dd>
              </div>
              <div>
                <dt className="mb-1 text-xs text-ink-muted">Brand</dt>
                <dd className="text-brand-ink">{product.brand || "Unbranded"}</dd>
              </div>
              <div>
                <dt className="mb-2 text-xs text-ink-muted">Sample index status</dt>
                <dd>
                  <StatusPill status={product.status} />
                </dd>
              </div>
              <div>
                <dt className="mb-1 text-xs text-ink-muted">Category</dt>
                <dd className="text-brand-ink">{product.category}</dd>
              </div>
            </dl>
            {product.indexError && <p className="text-sm text-destructive">{product.indexError}</p>}
          </CardContent>
          <CardFooter>
            <p className="text-xs leading-relaxed text-ink-muted">
              This is sample catalog data. Indexing and photo uploads are not connected.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function MissingProduct({ href }: { href: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-line bg-background p-10 text-center">
      <Package className="size-10 text-brand" aria-hidden />
      <h1 className="text-xl font-semibold text-brand-ink">Product unavailable</h1>
      <p className="text-sm text-ink-muted">
        This preview product may have been removed, or the page was reloaded.
      </p>
      <Button asChild variant="brand">
        <Link href={href}>Back to catalog</Link>
      </Button>
    </div>
  );
}

export function PreviewProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const rows = catalogPreview.useValue();
  const product = rows.find((row) => row.id === productId);
  const [error, setError] = useState("");
  if (productId && !product) return <MissingProduct href="/products" />;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const sku = String(data.get("sku")).trim();
    if (!sku || !String(data.get("name")).trim()) {
      setError("Enter a SKU and product name.");
      return;
    }
    if (rows.some((row) => row.id !== productId && row.sku.toLowerCase() === sku.toLowerCase())) {
      setError("This SKU already exists. Choose a unique SKU.");
      return;
    }
    const id = productId ?? crypto.randomUUID();
    const updated = {
      id,
      sku,
      name: String(data.get("name")).trim(),
      brand: String(data.get("brand")).trim(),
      category: String(data.get("category")).trim() || "Uncategorized",
      description: String(data.get("description")).trim(),
      status: product?.status ?? ("PENDING" as const),
    };
    catalogPreview.setValue((current) =>
      productId
        ? current.map((row) => (row.id === productId ? updated : row))
        : [updated, ...current],
    );
    router.push(`/products/${id}`);
  }
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link href="/products" className="flex items-center gap-2 text-sm text-brand hover:underline">
        <ArrowLeft className="size-4" aria-hidden />
        Back to catalog
      </Link>
      <PageHeading
        title={product ? "Edit product" : "Add a product"}
        description="Give your team the details they need to recognize this product."
      />
      <Card className="border-line">
        <CardHeader>
          <CardTitle>Product details</CardTitle>
          <CardDescription>Changes stay in this preview until you reload.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit}>
            <FieldGroup className="gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                {(["sku", "name", "brand", "category"] as const).map((key) => (
                  <Field key={key}>
                    <FieldLabel htmlFor={`preview-${key}`}>
                      {
                        { sku: "SKU", name: "Product name", brand: "Brand", category: "Category" }[
                          key
                        ]
                      }
                      {key === "sku" || key === "name" ? " *" : ""}
                    </FieldLabel>
                    <Input
                      className="h-11"
                      id={`preview-${key}`}
                      name={key}
                      required={key === "sku" || key === "name"}
                      defaultValue={product?.[key]}
                      maxLength={key === "name" ? 200 : 100}
                      placeholder={key === "sku" ? "SKU-12345" : undefined}
                    />
                  </Field>
                ))}
              </div>
              <Field>
                <FieldLabel htmlFor="preview-description">Description</FieldLabel>
                <Textarea
                  id="preview-description"
                  name="description"
                  defaultValue={product?.description}
                  maxLength={500}
                  rows={4}
                  placeholder="Describe the product and any distinctive details…"
                />
              </Field>
              <FieldError>{error}</FieldError>
              <div className="flex justify-end gap-3">
                <Button asChild variant="outline" size="xl">
                  <Link href="/products">Cancel</Link>
                </Button>
                <Button type="submit" variant="brand" size="xl">
                  <Save data-icon="inline-start" />
                  Save preview product
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
