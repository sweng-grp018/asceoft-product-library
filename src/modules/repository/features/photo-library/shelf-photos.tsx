import Image from "next/image";
import { api } from "@/lib/api";
import { currentAccount } from "@/modules/auth/server/viewer";
import { can } from "@/modules/auth/server/permissions";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { PhotoUploadForm } from "../photo-upload/photo-upload-form";
import { deleteShelfPhoto } from "../photo-upload/actions";

const photoDate = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Manila",
});

export function formatShelfPhotoDate(createdAt: string) {
  return photoDate.format(new Date(createdAt));
}

export async function ShelfPhotos() {
  const account = await currentAccount();
  if (!account || account.role === "PUBLIC") return null;

  const { images } = await api<{ images: { id: string; url: string; createdAt: string }[] }>(
    "/repository",
  );

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-line">
        <CardHeader>
          <CardTitle>Add a shelf photo</CardTitle>
          <CardDescription>
            JPG, PNG, or WebP up to 10 MB. Photos are saved privately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PhotoUploadForm />
        </CardContent>
      </Card>
      <h2 className="text-lg font-semibold text-brand-ink">Saved photos ({images.length})</h2>
      {images.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => {
            const date = formatShelfPhotoDate(image.createdAt);
            return (
              <Card key={image.id} className="border-line">
                <CardContent>
                  <div className="relative h-48 rounded-xl bg-brand-tint">
                    <Image
                      src={image.url}
                      alt={`Shelf photo saved on ${date}`}
                      fill
                      unoptimized
                      sizes="(min-width:1024px) 30vw,(min-width:640px) 45vw,90vw"
                      className="object-contain p-3"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap justify-between gap-3">
                  <time dateTime={image.createdAt} className="text-xs text-ink-muted">
                    {date}
                  </time>
                  {can(account.role, "repository:delete") && (
                    <ConfirmActionDialog
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={`Delete shelf photo saved on ${date}`}
                        >
                          Delete photo
                        </Button>
                      }
                      title="Delete shelf photo?"
                      description={`The photo saved on ${date} will be permanently deleted.`}
                      confirmLabel="Delete photo"
                      action={deleteShelfPhoto.bind(null, image.id)}
                    />
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-ink-muted">
          No shelf photos yet. Add the first photo above.
        </p>
      )}
    </div>
  );
}
