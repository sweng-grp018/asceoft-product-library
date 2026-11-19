"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ImagePlus, ScanLine, Trash2, LoaderCircle, Images } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { readImageSize, validateImageFile, describeBytes } from "@/lib/image";

type PreviewPhoto = {
  id: string;
  url: string;
  name: string;
  store: string;
  campaign: string;
  size?: number;
};
const SAMPLE_PHOTOS: PreviewPhoto[] = [
  {
    id: "sample-packaging",
    url: "/images/colorfulChips.png",
    name: "Product packaging · sample",
    store: "Sample studio",
    campaign: "Packaging references",
  },
  {
    id: "sample-detail",
    url: "/images/yellowChips.png",
    name: "Single product · sample",
    store: "Sample studio",
    campaign: "Front-view reference",
  },
];

export function PreviewRepository() {
  const [photos, setPhotos] = useState(SAMPLE_PHOTOS);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const urls = useRef(new Set<string>());
  useEffect(() => {
    const activeUrls = urls.current;
    return () => activeUrls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("image");
    if (!(file instanceof File) || !file.size) {
      setError("Choose a photo first.");
      return;
    }
    const problem = validateImageFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    if (photos.length >= 12) {
      setError("This preview holds up to 12 photos. Remove one to add another.");
      return;
    }
    setPending(true);
    setError("");
    setMessage("");
    const url = URL.createObjectURL(file);
    try {
      await readImageSize(url);
      urls.current.add(url);
      setPhotos((current) => [
        {
          id: crypto.randomUUID(),
          url,
          name: file.name,
          store: String(data.get("store")).trim() || "Unspecified location",
          campaign: String(data.get("campaign")).trim() || "No collection",
          size: file.size,
        },
        ...current,
      ]);
      setMessage(`${file.name} added to this preview. The photo stays on your device.`);
      form.reset();
    } catch {
      URL.revokeObjectURL(url);
      setError("That file could not be opened as an image. Try another photo.");
    } finally {
      setPending(false);
    }
  }
  function remove(photo: PreviewPhoto) {
    if (urls.current.delete(photo.url)) URL.revokeObjectURL(photo.url);
    setPhotos((current) => current.filter((item) => item.id !== photo.id));
    setMessage(`${photo.name} removed from this preview.`);
  }
  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        eyebrow="A home for your visual references"
        title="Image repository"
        description="Collect product and shelf photos, ready for your next review."
        action={
          <Button asChild variant="outline" size="xl">
            <Link href="/detection">
              <ScanLine data-icon="inline-start" />
              Detection preview
            </Link>
          </Button>
        }
      />
      <Card className="border-line">
        <CardHeader>
          <CardTitle>Add a photo</CardTitle>
          <CardDescription>
            JPG, PNG, or WebP · Up to 10 MB · Stored on this device for this page only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit}>
            <FieldGroup className="gap-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="preview-store">Store / location</FieldLabel>
                  <Input
                    className="h-11"
                    id="preview-store"
                    name="store"
                    placeholder="e.g. Main showroom"
                    maxLength={100}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="preview-campaign">Collection</FieldLabel>
                  <Input
                    className="h-11"
                    id="preview-campaign"
                    name="campaign"
                    placeholder="e.g. November display"
                    maxLength={100}
                  />
                </Field>
                <Field data-invalid={!!error}>
                  <FieldLabel htmlFor="preview-image">Photo</FieldLabel>
                  <Input
                    className="h-11"
                    id="preview-image"
                    name="image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    required
                    aria-invalid={!!error}
                    aria-describedby={error ? "photo-error" : undefined}
                  />
                </Field>
              </div>
              <FieldError id="photo-error">{error}</FieldError>
              <Button type="submit" variant="brand" size="xl" disabled={pending} className="w-fit">
                {pending ? (
                  <LoaderCircle data-icon="inline-start" className="animate-spin" />
                ) : (
                  <ImagePlus data-icon="inline-start" />
                )}
                {pending ? "Preparing photo…" : "Add to preview"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      {message && (
        <p role="status" className="text-sm text-status-ready-fg">
          {message}
        </p>
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-brand-ink">Your photos</h2>
        <Badge variant="secondary">{photos.length} photos</Badge>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {photos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden border-line">
            <CardHeader>
              <div className="relative mb-3 h-44 rounded-xl bg-brand-tint">
                <Image
                  src={photo.url}
                  alt={photo.name}
                  fill
                  sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 90vw"
                  unoptimized={photo.url.startsWith("blob:")}
                  className="object-contain p-5"
                />
              </div>
              <CardTitle className="truncate">{photo.name}</CardTitle>
              <CardDescription>{photo.store}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-2 text-xs text-ink-muted">
              <span>{photo.campaign}</span>
              <span>{photo.size ? describeBytes(photo.size) : "Sample"}</span>
            </CardContent>
            <CardFooter className="justify-between">
              <Badge variant="outline">{photo.size ? "Local photo" : "Sample photo"}</Badge>
              <Button
                variant="danger-ghost"
                size="icon"
                aria-label={`Remove ${photo.name}`}
                onClick={() => remove(photo)}
              >
                <Trash2 />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {!photos.length && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line p-12 text-center">
          <Images className="size-8 text-brand" aria-hidden />
          <h2 className="font-medium text-brand-ink">Room for your first photo</h2>
          <p className="text-sm text-ink-muted">Add a reference above to start your collection.</p>
        </div>
      )}
    </div>
  );
}
