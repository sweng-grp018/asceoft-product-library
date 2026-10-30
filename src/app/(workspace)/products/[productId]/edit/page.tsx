import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/server/session";
import { api, type Product } from "@/lib/api";
import { updateProduct } from "@/modules/catalog/features/product-management/actions";
import { ProductForm } from "@/modules/catalog/components/product-form";

export default async function EditProduct({ params }: { params: Promise<{ productId: string }> }) {
  if ((await auth())?.user.role !== "ADMIN") redirect("/products");
  const { productId } = await params;
  const { product } = await api<{ product: Product }>(
    `/products/${encodeURIComponent(productId)}`,
    {},
    false,
  );
  return (
    <ProductForm
      title={`Edit ${product.name}`}
      product={product}
      action={updateProduct.bind(null, productId)}
    />
  );
}
