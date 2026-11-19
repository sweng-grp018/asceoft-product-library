"use client";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Package,
  Plus,
  ScanLine,
  CheckCircle2,
  Clock3,
  ImagePlus,
} from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { catalogPreview } from "../list-products/catalog-preview-store";
import { StatusPill } from "../list-products/status-pill";
import { previewProfile } from "@/modules/auth/features/frontend-preview/preview-profile";

export function PreviewDashboard() {
  const rows = catalogPreview.useValue();
  const profile = previewProfile.useValue();
  const indexed = rows.filter((row) => row.status === "INDEXED").length;
  const pending = rows.length - indexed;
  const readyPercent = rows.length ? Math.round((indexed / rows.length) * 100) : 0;
  const stats = [
    {
      label: "Products in your library",
      value: rows.length,
      detail: "Across your sample catalog",
      icon: Package,
    },
    {
      label: "Indexed products",
      value: indexed,
      detail: "Sample reference status",
      icon: CheckCircle2,
    },
    {
      label: "Need attention",
      value: pending,
      detail: "Unindexed, processing, or failed",
      icon: Clock3,
    },
  ];
  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        eyebrow="A clearer view of your library"
        title={`Welcome, ${profile.name.split(" ")[0] || "there"}.`}
        description="Here’s what’s happening in your product workspace."
        action={
          <Button asChild variant="brand" size="xl">
            <Link href="/products/new">
              <Plus data-icon="inline-start" />
              Add product
            </Link>
          </Button>
        }
      />
      <section className="relative flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-2xl bg-brand-strong px-6 py-7 text-white sm:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-28 right-12 size-80 rounded-full border border-white/10"
        />
        <div className="relative flex max-w-lg flex-col gap-3">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-white/65 uppercase">
            Less searching. More finding.
          </p>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Your product knowledge, in focus.
          </h2>
          <p className="text-sm leading-relaxed text-white/75">
            Build a better catalog today. Explore how shelf-photo review could help your team
            tomorrow.
          </p>
        </div>
        <Button asChild variant="secondary" size="xl">
          <Link href="/detection">
            <ScanLine data-icon="inline-start" />
            Try detection preview
            <ArrowUpRight data-icon="inline-end" />
          </Link>
        </Button>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(({ label, value, detail, icon: Icon }) => (
          <Card key={label} className="gap-3 border-line shadow-none">
            <CardHeader className="flex flex-row items-start justify-between">
              <CardTitle className="text-ink-muted">{label}</CardTitle>
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand-tint text-brand">
                <Icon className="size-4" aria-hidden />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-tight text-brand-ink">
                {value.toLocaleString()}
              </p>
              <CardDescription className="mt-2">{detail}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[1fr_300px]">
        <Card className="gap-0 overflow-hidden border-line shadow-none">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 py-5">
            <div className="flex flex-col gap-1">
              <CardTitle>Library at a glance</CardTitle>
              <CardDescription>Your most recent sample products.</CardDescription>
            </div>
            <Button asChild variant="brand-ghost">
              <Link href="/products">
                View catalog
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-brand-tint/50">
                  <TableHead className="pl-6">Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, 5).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="max-w-72 py-4 pl-6">
                      <Link
                        href={`/products/${row.id}`}
                        className="block truncate font-medium text-brand-ink hover:text-brand"
                      >
                        {row.name}
                      </Link>
                      <span className="text-xs text-ink-muted">{row.brand}</span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-ink-muted">{row.sku}</TableCell>
                    <TableCell className="pr-6">
                      <StatusPill status={row.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!rows.length && (
              <p className="p-8 text-center text-sm text-ink-muted">
                Your library is empty. Add your first product to get started.
              </p>
            )}
          </CardContent>
          <CardFooter className="py-4 text-xs text-ink-muted">
            {rows.length} sample products · Changes reset on reload
          </CardFooter>
        </Card>
        <div className="flex flex-col gap-5">
          <Card className="border-line shadow-none">
            <CardHeader>
              <CardTitle>Reference readiness</CardTitle>
              <CardDescription>Sample catalog coverage.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-brand-ink">{readyPercent}%</span>
                <span className="text-xs text-ink-muted">indexed</span>
              </div>
              <Progress value={readyPercent} aria-label="Sample reference readiness" />
              <p className="text-xs leading-relaxed text-ink-muted">
                {indexed} of {rows.length} products have an indexed sample status. No model has run
                on these records.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/training">
                  Review reference index
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          <Card className="border-line shadow-none">
            <CardHeader>
              <CardTitle>Keep your library growing</CardTitle>
              <CardDescription>Better references start with clear photos.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="brand-ghost">
                <Link href="/repository">
                  <ImagePlus data-icon="inline-start" />
                  Explore image repository
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
