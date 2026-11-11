import { auth } from "@/modules/auth/server/session";
import { PLACEHOLDER_ROWS } from "@/modules/catalog/features/list-products/list-products.data";
import { DetectAndSearch } from "@/modules/search/features/detect-and-search/detect-and-search";

export default async function Detection() {
  const canCommit = (await auth())?.user.role === "ADMIN";

  /** Only the fields the resolver renders; the screen never sees extra columns. */
  const catalog = PLACEHOLDER_ROWS.map(({ sku, name, brand }) => ({ sku, name, brand }));

  return <DetectAndSearch canCommit={canCommit} catalog={catalog} />;
}
