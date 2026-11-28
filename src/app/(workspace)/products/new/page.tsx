import { requirePermission } from "@/modules/auth/server/permissions";
import { ProductForm } from "@/modules/catalog/components/product-form";
export default async function NewProduct() {
  await requirePermission("products:create");
  return <ProductForm title="Add a product" />;
}
