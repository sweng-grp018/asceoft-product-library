import type { Metadata } from "next";
import { PreviewDashboard } from "@/modules/catalog/features/frontend-preview/preview-dashboard";
export const metadata: Metadata = { title: "Overview" };
export default function Dashboard() {
  return <PreviewDashboard />;
}
