import { auth } from "@/modules/auth/server/session";
import { ListProducts } from "@/modules/catalog/features/list-products/list-products";
import { frontendPreview } from "@/lib/frontend-preview";

export default async function Products() {
  const canEdit = frontendPreview || (await auth())?.user.role === "ADMIN";

  return <ListProducts canEdit={canEdit} />;
}
