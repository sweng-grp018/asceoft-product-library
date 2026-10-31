import Link from "next/link";
import { api, type Product } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function Search({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = (await searchParams).q?.slice(0, 150) ?? "";
  const { products } = await api<{ products: Product[] }>(
    `/products?q=${encodeURIComponent(q)}`,
    {},
    false,
  );
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-7 px-5 py-14">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/" className="text-2xl font-semibold">
          Lensistry
        </Link>
        <Button asChild variant="outline">
          <Link href="/dashboard">Staff workspace</Link>
        </Button>
      </header>
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Find the right product</h1>
        <p className="mt-2 text-muted-foreground">
          Search the public product catalog by name, brand, or SKU.
        </p>
      </div>
      <form className="flex gap-2">
        <Input name="q" defaultValue={q} placeholder="What product are you looking for?" />
        <Button type="submit">Search</Button>
      </form>
      <div className="grid gap-3 md:grid-cols-2">
        {products.map((p) => (
          <Link href={`/search/${p.id}`} key={p.id}>
            <Card>
              <CardHeader>
                <CardTitle>{p.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  {p.sku} · {p.brand || "Unbranded"}
                </p>
                <Badge variant="secondary">{p.indexStatus}</Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {!products.length && <p>No products found.</p>}
    </main>
  );
}
