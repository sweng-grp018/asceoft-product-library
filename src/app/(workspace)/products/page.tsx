import { ListProducts } from "@/modules/catalog/features/list-products/list-products";
import { currentAccount } from "@/modules/auth/server/viewer";
import { productPage, catalogRow } from "@/modules/catalog/server/products";
export default async function Products({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.slice(0, 150) : "";
  const page = Math.min(10000, Math.max(1, Number.parseInt(params.page ?? "1") || 1));
  const [result, account] = await Promise.all([productPage(q, page), currentAccount()]);
  return (
    <ListProducts
      key={`${q}:${page}`}
      initialRows={result.products.map(catalogRow)}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      initialQuery={q}
      canEdit={account?.role === "ADMIN"}
    />
  );
}
