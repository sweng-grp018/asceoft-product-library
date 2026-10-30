import Link from "next/link";
import { api, type Product } from "@/lib/api";
import { auth } from "@/modules/auth/server/session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default async function Products({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const q = (await searchParams).q?.slice(0, 150) ?? "";
  const { products, total } = await api<{ products: Product[]; total: number }>(
    `/products?q=${encodeURIComponent(q)}`,
    {},
    false,
  );
  const canEdit = (await auth())?.user.role === "ADMIN";
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Product catalog</h1>
          <p className="text-muted-foreground">{total} SKU records</p>
        </div>
        {canEdit && (
          <Button asChild>
            <Link href="/products/new">Add product</Link>
          </Button>
        )}
      </header>
      <form className="flex gap-2">
        <Input name="q" defaultValue={q} placeholder="Search name, brand or SKU" />
        <Button type="submit">Search</Button>
      </form>
      <div className="grid gap-3">
        {products.map((p) => (
          <Link key={p.id} href={`/products/${p.id}`}>
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {p.sku} · {p.brand || "Unbranded"}
                  </p>
                </div>
                <Badge variant={p.indexStatus === "INDEXED" ? "default" : "secondary"}>
                  {p.indexStatus}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
        {!products.length && (
          <p className="text-muted-foreground">No products found. Add a product to begin.</p>
        )}
      </div>
    </div>
  );
}
