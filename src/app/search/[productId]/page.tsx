import Link from "next/link";
import { notFound } from "next/navigation";
import { api, type Product } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PublicProductDetails({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  let product: Product;
  try {
    ({ product } = await api<{ product: Product }>(
      `/products/${encodeURIComponent(productId)}`,
      {},
      false,
    ));
  } catch (error) {
    if (
      error instanceof Error &&
      /(?:Product not found|API request failed: (?:400|404))$/.test(error.message)
    )
      notFound();
    throw error;
  }
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-14">
      <header className="flex items-center justify-between gap-4">
        <Link href="/search" className="text-2xl font-semibold">
          Lensistry
        </Link>
        <Button asChild variant="outline">
          <Link href="/search">Back to search</Link>
        </Button>
      </header>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{product.name}</h1>
          <p className="text-muted-foreground">
            SKU {product.sku} · {product.brand || "Unbranded"}
          </p>
        </div>
        <Badge variant="secondary">{product.indexStatus}</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>{product.description || "No description yet."}</p>
          <p className="text-muted-foreground">Category: {product.category || "Uncategorized"}</p>
        </CardContent>
      </Card>
    </main>
  );
}
