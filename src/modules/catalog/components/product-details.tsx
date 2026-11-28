import Link from "next/link";
import { Pencil, Package, Trash2 } from "lucide-react";
import type { Product } from "@/lib/api";
import { PageHeading } from "@/components/layout/page-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "../features/list-products/status-pill";
import { PhotoUploadForm } from "@/modules/repository/features/photo-upload/photo-upload-form";
import { ActionForm } from "@/components/action-form";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";
import { deleteReferencePhoto, indexProduct } from "../features/product-management/actions";
import { ProductPhotoGallery, ProductPhotoImage } from "./product-photo-gallery";
import { ProductDetailsBackLink } from "./product-details-back-link";

export function ProductDetailsView({
  product,
  photos = [],
  canEdit = false,
  canManageReferenceImages = false,
  canPrepare = false,
  publicView = false,
  fromImageSearch = false,
}: {
  product: Product;
  photos?: { id: string; url: string | null }[];
  canEdit?: boolean;
  canManageReferenceImages?: boolean;
  canPrepare?: boolean;
  publicView?: boolean;
  fromImageSearch?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <ProductDetailsBackLink publicView={publicView} fromImageSearch={fromImageSearch} />
      <PageHeading
        title={product.name}
        description={`${product.brand || "No brand"} · ${product.sku}`}
        action={
          canEdit ? (
            <Button asChild variant="brand" size="xl">
              <Link href={`/products/${product.id}/edit`}>
                <Pencil data-icon="inline-start" />
                Edit product
              </Link>
            </Button>
          ) : undefined
        }
      />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card className="border-line">
          <CardHeader>
            <CardTitle>Product details</CardTitle>
            <CardDescription>{product.category || "Other groceries"}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <p className="text-sm leading-relaxed text-ink-muted">
              {product.description || "No description added yet."}
            </p>
            <dl className="grid grid-cols-2 gap-5 text-sm">
              <div>
                <dt className="text-xs text-ink-muted">Product code</dt>
                <dd className="mt-1 font-mono text-brand-ink">{product.sku}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Brand</dt>
                <dd className="mt-1">{product.brand || "No brand"}</dd>
              </div>
              {!publicView && (
                <>
                  <div>
                    <dt className="mb-2 text-xs text-ink-muted">Photo search status</dt>
                    <dd>
                      <StatusPill status={product.indexStatus} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-muted">Saved photos</dt>
                    <dd className="mt-1">{product.images.length}</dd>
                  </div>
                </>
              )}
            </dl>
            {!publicView && product.indexError && (
              <p role="alert" className="text-sm text-destructive">
                The photos could not be prepared. Check the photos and try again.
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="border-line">
          <CardHeader>
            <CardTitle>Product photos</CardTitle>
            <CardDescription>
              {publicView
                ? "Select a photo to open the gallery."
                : "Clear photos help your team recognize similar packs."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {publicView ? (
              <ProductPhotoGallery photos={photos} productName={product.name} />
            ) : photos.length ? (
              <div className="grid grid-cols-2 gap-3">
                {photos.map((photo, index) => (
                  <div key={photo.id} className="flex flex-col gap-2">
                    <div className="relative aspect-square rounded-xl bg-brand-tint">
                      <ProductPhotoImage photo={photo} name={product.name} />
                    </div>
                    {canManageReferenceImages && (
                      <ConfirmActionDialog
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label={`Remove reference photo ${index + 1} for ${product.name}`}
                          >
                            <Trash2 data-icon="inline-start" />
                            Remove
                          </Button>
                        }
                        title="Remove product photo?"
                        description="This reference photo will be permanently deleted."
                        confirmLabel="Remove photo"
                        action={deleteReferencePhoto.bind(null, product.id, photo.id)}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl bg-brand-tint">
                <Package className="size-12 text-brand/50" aria-hidden />
                <span className="text-xs text-ink-muted">
                  {publicView ? "Grocery product" : "No photos saved yet"}
                </span>
              </div>
            )}
            {canManageReferenceImages && (
              <>
                <PhotoUploadForm productId={product.id} />
                {canPrepare && product.images.length > 0 && product.indexStatus !== "PROCESSING" ? (
                  <ActionForm
                    action={indexProduct.bind(null, product.id)}
                    submitLabel="Prepare photos for search"
                    variant="outline"
                  />
                ) : (
                  <p className="text-xs leading-relaxed text-ink-muted">
                    {canPrepare
                      ? "Add a photo before preparing this product for photo search."
                      : "Photo search is not available yet. You can still save photos and find products by name."}
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
