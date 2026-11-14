import { Package, CheckCircle2, Clock3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardRecentActivity } from "@/modules/dashboard/features/overview/dashboard-recent-activity";
import { DASHBOARD_ACTIVITIES } from "@/modules/dashboard/features/overview/dashboard-activity.data";

/* Placeholders for now */
const stats = [
  {
    title: "Total Products in Library",
    value: "1,248",
    description: "Catalog-wide inventory",
    icon: Package,
  },
  {
    title: "Ready for AI Search",
    value: "1,085",
    description: "Searchable by vision model",
    icon: CheckCircle2,
    badge: "87% indexed",
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Needs Indexing",
    value: "163",
    description: "Pending embedding batch",
    icon: Clock3,
    badge: "Requires training",
    badgeClass: "bg-indigo-100 text-indigo-700",
  },
];

export default function Dashboard() {
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
            <Card key={item.title} className="gap-4 border-slate-100 bg-white py-5 shadow-sm">
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
          );
        })}
      </div>

      <DashboardRecentActivity activities={DASHBOARD_ACTIVITIES} />
    </div>
  );
}
