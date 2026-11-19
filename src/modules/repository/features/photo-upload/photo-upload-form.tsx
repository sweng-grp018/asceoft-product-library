"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, LoaderCircle } from "lucide-react";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { uploadPhoto } from "./upload-photo";

export function PhotoUploadForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("image");
    if (!(file instanceof File)) return;
    setPending(true);
    setError("");
    setMessage("");
    try {
      await uploadPhoto(
        file,
        productId,
        String(data.get("store") ?? ""),
        String(data.get("campaign") ?? ""),
      );
      form.reset();
      setMessage("Photo saved.");
      router.refresh();
    } catch {
      setError(
        "We could not save that photo. Check that it is a JPG, PNG or WebP under 10 MB, then try again.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <FieldGroup className="gap-4">
        {!productId && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="photo-store">Store or branch</FieldLabel>
              <Input
                id="photo-store"
                name="store"
                placeholder="Quezon City branch"
                maxLength={100}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="photo-collection">Collection</FieldLabel>
              <Input
                id="photo-collection"
                name="campaign"
                placeholder="November grocery display"
                maxLength={100}
              />
            </Field>
          </div>
        )}
        <Field>
          <FieldLabel htmlFor="upload-photo">Photo</FieldLabel>
          <Input
            id="upload-photo"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            disabled={pending}
          />
        </Field>
        <FieldError>{error}</FieldError>
        {message && (
          <p role="status" className="text-sm text-status-ready-fg">
            {message}
          </p>
        )}
        <Button type="submit" variant="brand" size="xl" disabled={pending} className="w-fit">
          {pending ? (
            <LoaderCircle className="animate-spin" data-icon="inline-start" />
          ) : (
            <ImagePlus data-icon="inline-start" />
          )}
          {pending ? "Saving photo…" : "Save photo"}
        </Button>
      </FieldGroup>
    </form>
  );
}
