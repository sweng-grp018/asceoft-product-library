import { api } from "@/lib/api";
import { uploadShelf, analyzeShelf } from "@/modules/repository/features/shelf-analysis/actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

type Shelf = { id: string; store: string | null; campaign: string | null; createdAt: string };
export default async function Repository({
  searchParams,
}: {
  searchParams: Promise<{ uploaded?: string }>;
}) {
  const { images } = await api<{ images: Shelf[] }>("/repository");
  const { uploaded } = await searchParams;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Shelf images</h1>
        <p className="text-muted-foreground">
          Upload a store photo, then detect multiple items and match against indexed references.
        </p>
      </div>
      {uploaded && (
        <p role="status" className="rounded-lg bg-muted p-3">
          Image uploaded. Select Analyze to run detection.
        </p>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Upload shelf photo</CardTitle>
          <CardDescription>
            JPEG, PNG or WebP, maximum 10 MiB. The AI service must be running to analyze photos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={uploadShelf}>
            <FieldGroup className="grid gap-3 md:grid-cols-2">
              <Field className="gap-1.5">
                <FieldLabel htmlFor="shelf-store">Store</FieldLabel>
                <Input id="shelf-store" name="store" maxLength={100} placeholder="Store location" />
              </Field>
              <Field className="gap-1.5">
                <FieldLabel htmlFor="shelf-campaign">Campaign</FieldLabel>
                <Input
                  id="shelf-campaign"
                  name="campaign"
                  maxLength={100}
                  placeholder="Optional campaign"
                />
              </Field>
              <Field className="gap-1.5 md:col-span-2">
                <FieldLabel htmlFor="shelf-image">Photo</FieldLabel>
                <Input
                  id="shelf-image"
                  name="image"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  required
                />
              </Field>
              <Button type="submit">Upload photo</Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <h2 className="text-xl font-semibold">Recent shelf photos</h2>
      {images.map((image) => (
        <Card key={image.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-medium">{image.store || "Unspecified store"}</p>
              <p className="text-sm text-muted-foreground">
                {image.campaign || "No campaign"} · {new Date(image.createdAt).toLocaleString()}
              </p>
            </div>
            <form action={analyzeShelf.bind(null, image.id)}>
              <Button type="submit" variant="outline">
                Analyze
              </Button>
            </form>
          </CardContent>
        </Card>
      ))}
      {!images.length && <p className="text-muted-foreground">No shelf photos uploaded yet.</p>}
    </div>
  );
}
