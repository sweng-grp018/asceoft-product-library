import type { Product } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

export function ProductForm({
  title,
  action,
  product,
}: {
  title: string;
  action: (formData: FormData) => Promise<void>;
  product?: Product;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action}>
            <FieldGroup className="gap-4">
              {(["sku", "name", "brand", "category"] as const).map((key) => (
                <Field className="gap-1.5" key={key}>
                  <FieldLabel htmlFor={`product-${key}`} className="capitalize">
                    {key}
                  </FieldLabel>
                  <Input
                    id={`product-${key}`}
                    name={key}
                    required={key === "sku" || key === "name"}
                    maxLength={200}
                    defaultValue={product?.[key] ?? ""}
                  />
                </Field>
              ))}
              <Field className="gap-1.5">
                <FieldLabel htmlFor="product-description">Description</FieldLabel>
                <Textarea
                  id="product-description"
                  name="description"
                  maxLength={5000}
                  defaultValue={product?.description ?? ""}
                />
              </Field>
              <Button type="submit">Save product</Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
