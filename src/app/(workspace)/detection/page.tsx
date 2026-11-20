import Link from "next/link";
import { api } from "@/lib/api";
import { PageHeading } from "@/components/layout/page-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActionForm } from "@/components/action-form";
import { Field, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { formatShelfPhotoDate } from "@/modules/repository/features/photo-library/shelf-photos";
import { analyzeSelectedShelf } from "@/modules/repository/features/shelf-analysis/actions";
export default async function PhotoSearch() {
  const { images, serverInferenceEnabled } = await api<{
    images: { id: string; createdAt: string }[];
    serverInferenceEnabled: boolean;
  }>("/repository");
  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Find from a photo"
        description="Choose a saved grocery shelf photo to look for matching products."
      />
      <Card className="max-w-2xl border-line">
        <CardHeader>
          <CardTitle>
            {serverInferenceEnabled ? "Choose a shelf photo" : "Photo search is not available yet"}
          </CardTitle>
          <CardDescription>
            {serverInferenceEnabled
              ? "Search results will be saved to Past searches for you to review."
              : "The photo search service has not been connected. You can still save shelf photos and find products by name."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {serverInferenceEnabled && images.length > 0 ? (
            <ActionForm action={analyzeSelectedShelf} submitLabel="Find products">
              <Field>
                <FieldLabel htmlFor="search-photo">Shelf photo</FieldLabel>
                <NativeSelect id="search-photo" name="imageId" required className="w-full">
                  {images.map((image) => (
                    <NativeSelectOption key={image.id} value={image.id}>
                      {formatShelfPhotoDate(image.createdAt)}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
            </ActionForm>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="brand">
              <Link href="/repository">
                {images.length ? "View shelf photos" : "Add a shelf photo"}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/products">Find by name</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
