import Link from "next/link";
import { api, type Product } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function Training() {
  const { products } = await api<{ products: Product[] }>("/products", {}, false);
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-semibold">Embedding index</h1>
        <p className="text-muted-foreground">
          Reference images produce OpenCLIP embeddings. YOLO model fine-tuning requires a labeled
          dataset and is not part of this POC.
        </p>
      </header>
      <div className="grid gap-3">
        {products.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle>{p.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <span>
                {p.images.length} references · <Badge>{p.indexStatus}</Badge>
              </span>
              <Button variant="outline" asChild>
                <Link href={`/products/${p.id}`}>Manage indexing</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
