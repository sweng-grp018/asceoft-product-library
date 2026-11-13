import { auth } from "@/modules/auth/server/session";
import { ListProducts } from "@/modules/catalog/features/list-products/list-products";

export default async function Products() {
  const canEdit = (await auth())?.user.role === "ADMIN";

  return <ListProducts canEdit={canEdit} />;
}
