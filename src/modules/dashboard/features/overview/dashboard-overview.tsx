"use client";

import { useState } from "react";
import type { ActivityStatusFilter } from "./dashboard-activity.filters";
import { Package, CheckCircle2, Clock3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardRecentActivity } from "./dashboard-recent-activity";
import { DASHBOARD_ACTIVITIES } from "./dashboard-activity.data";
import { PLACEHOLDER_ROWS } from "@/modules/catalog/features/list-products/list-products.data";

const readyCount = PLACEHOLDER_ROWS.filter((row) => row.status === "INDEXED").length;
const needsIndexingCount = PLACEHOLDER_ROWS.filter(
  (row) => row.status === "PENDING" || row.status === "FAILED",
).length;
/* Summary counts stay catalog-wide while filters affect recent activity only. */
const stats = [
  {
    title: "Total Products in Library",
    filter: "all" as const,
    value: PLACEHOLDER_ROWS.length.toLocaleString(),
    description: "Catalog-wide inventory",
    icon: Package,
  },
  {
    title: "Ready for AI Search",
    filter: "ready" as const,
    value: readyCount.toLocaleString(),
    description: "Searchable by vision model",
    icon: CheckCircle2,
    badge: `${Math.round((readyCount / Math.max(1, PLACEHOLDER_ROWS.length)) * 100)}% indexed`,
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Needs Indexing",
    filter: "needs-indexing" as const,
    value: needsIndexingCount.toLocaleString(),
    description: "Unindexed or failed indexing",
    icon: Clock3,
    badge: "Requires indexing",
    badgeClass: "bg-indigo-100 text-indigo-700",
  },
];

export function DashboardOverview() {
  const [statusFilter, setStatusFilter] = useState<ActivityStatusFilter>("all");
  return (
    <div className="min-h-svh bg-[#F7F8FF] p-6 md:-m-8 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-[10px] font-semibold tracking-wider text-[#4542bd]">
            FACILITY BAY OVERVIEW
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-[#232254]">Admin Dashboard</h1>
        </div>
      </div>

      {/* Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              type="button"
              aria-pressed={statusFilter === item.filter}
              aria-controls="dashboard-recent-activity"
              onClick={() => setStatusFilter(item.filter)}
              className="group cursor-pointer rounded-xl text-left transition-shadow aria-pressed:ring-2 aria-pressed:ring-brand aria-pressed:ring-offset-2 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            >
              <Card className="h-full gap-4 border-slate-100 bg-white py-5 shadow-sm">
                {/* Header */}
                <CardHeader className="flex flex-row items-start justify-between gap-2 px-5">
                  <CardTitle className="text-xs font-medium text-[#232254]">{item.title}</CardTitle>

                  {item.badge ? (
                    <Badge
                      variant="secondary"
                      className={`shrink-0 rounded-full text-[10px] ${item.badgeClass}`}
                    >
                      {item.badge}
                    </Badge>
                  ) : (
                    <div className="rounded-md bg-indigo-50 p-2 text-[#4542bd]">
                      <Icon size={17} />
                    </div>
                  )}
                </CardHeader>

                {/* Content */}
                <CardContent className="px-5">
                  <p className="text-3xl font-bold tracking-tight text-[#232254]">{item.value}</p>

                  <CardDescription className="mt-3 text-[11px]">{item.description}</CardDescription>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      <DashboardRecentActivity
        activities={DASHBOARD_ACTIVITIES}
        statusFilter={statusFilter}
        onClearStatus={() => setStatusFilter("all")}
      />
    </div>
  );
}
