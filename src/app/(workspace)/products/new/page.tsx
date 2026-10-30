import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/server/session";
import { createProduct } from "@/modules/catalog/features/product-management/actions";
import { ProductForm } from "@/modules/catalog/components/product-form";

export default async function NewProduct() {
  if ((await auth())?.user.role !== "ADMIN") redirect("/products");
  return <ProductForm title="Add a product" action={createProduct} />;
}
