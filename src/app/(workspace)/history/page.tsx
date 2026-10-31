import { api, type Match, type Product } from "@/lib/api";
import { correctMatch } from "@/modules/repository/features/shelf-analysis/actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Search = { id: string; createdAt: string; matches: Match[] };
export default async function History() {
  const [{ searches }, { products }] = await Promise.all([
    api<{ searches: Search[] }>("/repository/searches/recent"),
    api<{ products: Product[] }>("/products", {}, false),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Detection history</h1>
        <p className="text-muted-foreground">
          Review boxes, scores and manual SKU corrections for your searches.
        </p>
      </div>
      {searches.map((s) => (
        <Card key={s.id}>
          <CardHeader>
            <CardTitle>{new Date(s.createdAt).toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {!s.matches.length && <p>No objects detected in this image.</p>}
            {s.matches.map((match, i) => (
              <div key={match.id} className="flex flex-col gap-2 rounded-lg border p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <strong>Detection {i + 1}</strong>
                  <Badge variant={match.productId ? "default" : "secondary"}>
                    {match.productId ? "Matched" : "Unknown"}
                  </Badge>
                  {match.manuallySet && <Badge variant="outline">Corrected</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  Box [{match.boundingBox.join(", ")}] · detector confidence{" "}
                  {(match.detectorScore * 100).toFixed(1)}% · cosine similarity{" "}
                  {match.similarityScore === null ? "N/A" : match.similarityScore.toFixed(3)}
                </p>
                <form
                  action={correctMatch.bind(null, s.id, match.id)}
                  className="flex flex-wrap gap-2"
                >
                  <label className="min-w-52 flex-1 text-sm">
                    Correct SKU
                    <select
                      name="productId"
                      defaultValue={match.productId ?? ""}
                      className="mt-1 block h-9 w-full rounded-lg border border-input bg-background px-2"
                    >
                      <option value="">Unknown / no match</option>
                      {products.map((p) => (
                        <option value={p.id} key={p.id}>
                          {p.sku} — {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button type="submit" variant="outline" className="self-end">
                    Save correction
                  </Button>
                </form>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
      {!searches.length && <p className="text-muted-foreground">No detection history yet.</p>}
    </div>
  );
}
