import { api, type Product } from "@/lib/api";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!query || query.length > 150) return Response.json({ products: [] });
  try {
    const { products } = await api<{ products: Product[] }>(
      "/products",
      { params: { q: query, pageSize: 7 }, timeout: 5000 },
      false,
    );
    return Response.json({
      products: products.map(({ id, name, sku, brand }) => ({ id, name, sku, brand })),
    });
  } catch {
    return Response.json({ error: "Product suggestions are unavailable." }, { status: 503 });
  }
}
