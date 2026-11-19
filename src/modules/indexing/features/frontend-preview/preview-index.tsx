"use client";
import Link from "next/link";
import { ArrowRight, Layers, ImagePlus } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { catalogPreview } from "@/modules/catalog/features/list-products/catalog-preview-store";
import { StatusPill } from "@/modules/catalog/features/list-products/status-pill";

export function PreviewIndex() {
  const products = catalogPreview.useValue();
  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        eyebrow="Better references. Better recognition."
        title="Reference index"
        description="Review the sample indexing state of each product in your library."
        action={
          <Button asChild variant="outline" size="xl">
            <Link href="/products">
              <ImagePlus data-icon="inline-start" />
              Manage products
            </Link>
          </Button>
        }
      />
      <Card className="border-line">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-brand-tint text-brand">
            <Layers className="size-5" aria-hidden />
          </div>
          <CardTitle>From product photos to visual references</CardTitle>
          <CardDescription>
            Reference indexing helps identify a detected product. It is separate from training the
            product detector.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-ink-muted">
            These statuses are examples. No indexing or model training runs in this preview. Browser
            inference with the team’s exported detector is planned.
          </p>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {products.map((product) => (
          <Card key={product.id} className="border-line">
            <CardHeader>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-ink-muted">{product.sku}</span>
                <StatusPill status={product.status} />
              </div>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>
                {product.brand} · {product.category}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-ink-muted">
                {product.indexError || "Sample indexing state · no live processing"}
              </p>
            </CardContent>
            <CardFooter className="justify-end">
              <Button asChild variant="brand-ghost">
                <Link href={`/products/${product.id}`}>
                  Review product
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
