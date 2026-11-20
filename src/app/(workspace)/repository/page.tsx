import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { PageHeading } from "@/components/layout/page-heading";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhotoUploadForm } from "@/modules/repository/features/photo-upload/photo-upload-form";

export default async function Repository() {
  const { images } = await api<{
    images: {
      id: string;
      url: string;
      store: string | null;
      campaign: string | null;
      createdAt: string;
    }[];
  }>("/repository");
  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Shelf photos"
        description="Save grocery shelf photos by store or collection, ready for later review."
        action={
          <Button asChild variant="outline" size="xl">
            <Link href="/detection">Find from a photo</Link>
          </Button>
        }
      />
      <Card className="border-line">
        <CardHeader>
          <CardTitle>Add a shelf photo</CardTitle>
          <CardDescription>
            JPG, PNG, or WebP. Up to 10 MB. Photos are saved privately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PhotoUploadForm />
        </CardContent>
      </Card>
      <h2 className="text-lg font-semibold text-brand-ink">Saved photos ({images.length})</h2>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {images.map((image) => (
          <Card key={image.id} className="border-line">
            <CardHeader>
              <div className="relative mb-3 h-48 rounded-xl bg-brand-tint">
                <Image
                  src={image.url}
                  alt={`Shelf photo from ${image.store || "the store"}`}
                  fill
                  unoptimized
                  sizes="(min-width:1280px) 30vw,(min-width:640px) 45vw,90vw"
                  className="object-contain p-3"
                />
              </div>
              <CardTitle>{image.store || "No store name"}</CardTitle>
              <CardDescription>{image.campaign || "No collection"}</CardDescription>
            </CardHeader>
            <CardFooter>
              <p className="text-xs text-ink-muted">
                {new Intl.DateTimeFormat("en-PH", {
                  dateStyle: "medium",
                  timeZone: "Asia/Manila",
                }).format(new Date(image.createdAt))}
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>
      {!images.length && (
        <p className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-ink-muted">
          No shelf photos yet. Add the first photo above.
        </p>
      )}
    </div>
  );
}
