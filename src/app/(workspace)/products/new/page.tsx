import { redirect } from "next/navigation";
import { currentAccount } from "@/modules/auth/server/viewer";
import { ProductForm } from "@/modules/catalog/components/product-form";
export default async function NewProduct() {
  if ((await currentAccount())?.role !== "ADMIN") redirect("/products");
  return <ProductForm title="Add a product" />;
}
