"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Save, LoaderCircle, ArrowLeft } from "lucide-react";
import type { Product } from "@/lib/api";
import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { saveCatalogProduct } from "../features/product-management/save-product";

export function ProductForm({ title, product }: { title: string; product?: Product }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    startTransition(async () => {
      const result = await saveCatalogProduct(data, product?.id);
      if (!result.product) {
        setError(result.error ?? "We could not save this product.");
        return;
      }
      router.push(`/products/${result.product.id}`);
      router.refresh();
    });
  }
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link href="/products" className="flex items-center gap-2 text-sm text-brand hover:underline">
        <ArrowLeft className="size-4" aria-hidden />
        Back to products
      </Link>
      <PageHeading
        title={title}
        description="Keep the details your team needs to find the right grocery product."
      />
      <Card className="border-line">
        <CardHeader>
          <CardTitle>Product details</CardTitle>
          <CardDescription>
            Add the pack size to the name, such as “Jasmine Rice 5 kg”.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit}>
            <FieldGroup className="gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                {(["sku", "name", "brand", "category"] as const).map((key) => (
                  <Field key={key}>
                    <FieldLabel htmlFor={`product-${key}`}>
                      {
                        {
                          sku: "Product code",
                          name: "Product name",
                          brand: "Brand",
                          category: "Category",
                        }[key]
                      }
                      {key === "sku" || key === "name" ? " *" : ""}
                    </FieldLabel>
                    <Input
                      className="h-11"
                      id={`product-${key}`}
                      name={key}
                      required={key === "sku" || key === "name"}
                      maxLength={key === "name" ? 200 : 100}
                      defaultValue={product?.[key] ?? ""}
                      placeholder={key === "sku" ? "PH-GR-0019" : undefined}
                    />
                  </Field>
                ))}
              </div>
              <Field>
                <FieldLabel htmlFor="product-description">Description</FieldLabel>
                <Textarea
                  id="product-description"
                  name="description"
                  rows={4}
                  maxLength={5000}
                  defaultValue={product?.description ?? ""}
                  placeholder="Describe the pack, size, and anything that makes it easy to recognize."
                />
              </Field>
              <FieldError>{error}</FieldError>
              <div className="flex justify-end gap-3">
                <Button asChild variant="outline" size="xl">
                  <Link href="/products">Cancel</Link>
                </Button>
                <Button type="submit" variant="brand" size="xl" disabled={pending}>
                  {pending ? (
                    <LoaderCircle className="animate-spin" data-icon="inline-start" />
                  ) : (
                    <Save data-icon="inline-start" />
                  )}
                  {pending ? "Saving…" : "Save product"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
