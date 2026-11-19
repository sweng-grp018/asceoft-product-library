import Link from "next/link";
import { Suspense } from "react";
import { PageLoading } from "@/components/layout/page-loading";
import { api, type Product } from "@/lib/api";
import { auth } from "@/modules/auth/server/session";
import {
  uploadReference,
  indexProduct,
  deleteProduct,
} from "@/modules/catalog/features/product-management/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { frontendPreview } from "@/lib/frontend-preview";
import { PreviewProductDetails } from "@/modules/catalog/features/frontend-preview/preview-product";

async function ProductDetailsContent({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  if (frontendPreview) return <PreviewProductDetails productId={productId} />;
  const { product, serverInferenceEnabled } = await api<{
    product: Product;
    serverInferenceEnabled: boolean;
  }>(`/products/${encodeURIComponent(productId)}`, {}, false);
  const admin = (await auth())?.user.role === "ADMIN";
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{product.name}</h1>
          <p className="text-muted-foreground">
            SKU {product.sku} · {product.brand || "Unbranded"}
          </p>
        </div>
        <Badge>{product.indexStatus}</Badge>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Product information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p>{product.description || "No description yet."}</p>
          <p className="text-muted-foreground">Category: {product.category || "Uncategorized"}</p>
          <p className="text-muted-foreground">
            {product.images.length} reference images registered
          </p>
          {product.indexError && (
            <p role="alert" className="text-destructive">
              {product.indexError}
            </p>
          )}
        </CardContent>
      </Card>
      {admin && (
        <Card>
          <CardHeader>
            <CardTitle>Reference images & indexing</CardTitle>
            <CardDescription>
              Upload reference photos, then create visual embeddings. Model fine-tuning is a
              separate workflow.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form action={uploadReference.bind(null, productId)}>
              <FieldGroup className="flex-row flex-wrap items-end gap-3">
                <Field className="flex-1 gap-1.5">
                  <FieldLabel htmlFor="reference-image">Image</FieldLabel>
                  <Input
                    id="reference-image"
                    type="file"
                    name="image"
                    accept="image/png,image/jpeg,image/webp"
                    required
                  />
                </Field>
                <Button type="submit" variant="outline">
                  Upload
                </Button>
              </FieldGroup>
            </form>
            <form action={indexProduct.bind(null, productId)}>
              <Button
                disabled={
                  !serverInferenceEnabled ||
                  !product.images.length ||
                  product.indexStatus === "PROCESSING"
                }
              >
                {product.indexStatus === "FAILED" ? "Retry indexing" : "Generate embeddings"}
              </Button>
            </form>
            {!serverInferenceEnabled && (
              <p className="text-sm text-muted-foreground">
                Server indexing is disabled. Model training is managed separately; browser inference
                with an exported model is planned.
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href={`/products/${productId}/edit`}>Edit</Link>
              </Button>
              <form action={deleteProduct.bind(null, productId)}>
                <Button type="submit" variant="destructive">
                  Delete product
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ProductDetails(props: { params: Promise<{ productId: string }> }) {
  return (
    <Suspense fallback={<PageLoading />}>
      <ProductDetailsContent {...props} />
    </Suspense>
  );
}
