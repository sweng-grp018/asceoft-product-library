import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ScanLine } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type Product } from "@/lib/api";
import { currentAccount } from "@/modules/auth/server/viewer";
import { catalogRow } from "@/modules/catalog/server/products";
import { DashboardView } from "@/modules/catalog/features/dashboard/dashboard";
export const metadata: Metadata = { title: "Overview" };

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Overview"
        description="See what’s in your product library and which products are ready for photo search."
      />
      <section className="flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-brand-strong px-6 py-7 text-white sm:px-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Find from a photo</h2>
          <p className="text-sm text-white/80">Look for products from a pack or shelf photo.</p>
        </div>
        <Button asChild variant="secondary" size="xl">
          <Link href="/detection">
            <ScanLine data-icon="inline-start" />
            Open photo search
          </Link>
        </Button>
      </section>
      <Suspense
        fallback={
          <div role="status" aria-label="Loading product totals" className="flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-64" />
          </div>
        }
      >
        <DashboardData />
      </Suspense>
    </div>
  );
}

async function DashboardData() {
  const account = await currentAccount();
  if (!account || account.role === "PUBLIC") return null;

  const summary = await api<{ total: number; ready: number; recent: Product[] }>(
    "/products/summary",
  );
  return (
    <DashboardView
      rows={summary.recent.map(catalogRow)}
      total={summary.total}
      ready={summary.ready}
      name={account.name}
      canEdit={account.role === "ADMIN"}
    />
  );
}
