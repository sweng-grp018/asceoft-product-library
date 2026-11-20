import Link from "next/link";
import { api } from "@/lib/api";
import { allProducts } from "@/modules/catalog/server/products";
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
import { StatusPill } from "@/modules/catalog/features/list-products/status-pill";
export default async function ProductPhotos() {
  const products = await allProducts();
  const { ready } = await api<{ ready: number }>("/products/summary");
  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Product photos"
        description="Check which groceries have photos and which are ready for photo search."
      />
      <p className="text-sm text-ink-muted">
        {ready} of {products.length} products are ready for photo search.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {products.map((p) => (
          <Card key={p.id} className="border-line">
            <CardHeader>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-ink-muted">{p.sku}</span>
                <StatusPill status={p.indexStatus} />
              </div>
              <CardTitle>{p.name}</CardTitle>
              <CardDescription>
                {p.brand} · {p.category}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-ink-muted">{p.images.length} saved photos</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="brand-ghost">
                <Link href={`/products/${p.id}`}>View product and photos</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {!products.length && (
        <p className="text-sm text-ink-muted">
          Add a product first, then save a clear photo of its pack.
        </p>
      )}
    </div>
  );
}
