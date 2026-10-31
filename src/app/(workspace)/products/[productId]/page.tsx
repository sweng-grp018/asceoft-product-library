import Link from "next/link";
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

export default async function ProductDetails({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const { product } = await api<{ product: Product }>(
    `/products/${encodeURIComponent(productId)}`,
    {},
    false,
  );
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
            <form
              action={uploadReference.bind(null, productId)}
              className="flex flex-wrap items-end gap-3"
            >
              <label className="flex flex-1 flex-col gap-1.5 text-sm">
                Image
                <Input type="file" name="image" accept="image/png,image/jpeg,image/webp" required />
              </label>
              <Button type="submit" variant="outline">
                Upload
              </Button>
            </form>
            <form action={indexProduct.bind(null, productId)}>
              <Button disabled={!product.images.length || product.indexStatus === "PROCESSING"}>
                {product.indexStatus === "FAILED" ? "Retry indexing" : "Generate embeddings"}
              </Button>
            </form>
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
