import type { Product } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
          <form action={action} className="flex flex-col gap-4">
            {(["sku", "name", "brand", "category"] as const).map((key) => (
              <label className="flex flex-col gap-1.5 text-sm" key={key}>
                <span className="capitalize">{key}</span>
                <Input
                  name={key}
                  required={key === "sku" || key === "name"}
                  maxLength={200}
                  defaultValue={product?.[key] ?? ""}
                />
              </label>
            ))}
            <label className="flex flex-col gap-1.5 text-sm">
              Description
              <Textarea
                name="description"
                maxLength={5000}
                defaultValue={product?.description ?? ""}
              />
            </label>
            <Button type="submit">Save product</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
