import type { Metadata } from "next";
import { api, type Product } from "@/lib/api";
import { currentAccount } from "@/modules/auth/server/viewer";
import { catalogRow } from "@/modules/catalog/server/products";
import { DashboardView } from "@/modules/catalog/features/dashboard/dashboard";
export const metadata: Metadata = { title: "Overview" };
export default async function Dashboard() {
  const [summary, account] = await Promise.all([
    api<{ total: number; ready: number; recent: Product[] }>("/products/summary"),
    currentAccount(),
  ]);
  return (
    <DashboardView
      rows={summary.recent.map(catalogRow)}
      total={summary.total}
      ready={summary.ready}
      name={account?.name ?? "there"}
      canEdit={account?.role === "ADMIN"}
    />
  );
}
