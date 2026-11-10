import { Dot, Package, CheckCircle2, Clock3, RefreshCw,} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";

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

const activities = [
  {
    sku: "SKU-90214",
    name: "Heavy-Duty Cordless Drill 20V",
    status: "Ready",
    date: "Today, 10:42 AM",
  },
  {
    sku: "SKU-88412",
    name: "Industrial Impact Socket Set (32-pc)",
    status: "Ready",
    date: "Today, 09:15 AM",
  },
  {
    sku: "SKU-77291",
    name: "Laser Distance Measure 165ft",
    status: "Processing",
    date: "Yesterday, 4:30 PM",
  },
  {
    sku: "SKU-65103",
    name: "ANSI Z87.1 Safety Eyewear (Smoke)",
    status: "Needs Indexing",
    date: "Yesterday, 2:15 PM",
  },
  {
    sku: "SKU-44029",
    name: "Waterproof Inspection Borescope HD",
    status: "Needs Indexing",
    date: "Oct 24, 2023",
  },
];

function StatusBadge({ status }: { status: string }) {
  /* For placeholder statuses */
  const styles: Record<string, string> = {
    Ready: "bg-emerald-100 text-emerald-700",
    Processing: "bg-indigo-100 text-indigo-700",
    "Needs Indexing": "bg-blue-100 text-blue-700",
  };

  return (
    <Badge variant="secondary" className={`rounded-full px-2.5 py-1 font-medium ${styles[status]}`}>
      <span className="mr-1"><Dot /></span>{status}
    </Badge>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-svh bg-[#F7F8FF] p-6 md:-m-8 md:p-8">
      
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-[10px] font-semibold tracking-wider text-[#4542bd]">FACILITY BAY OVERVIEW</p>
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
                <CardTitle className="text-xs font-medium text-[#232254]">
                  {item.title}
                </CardTitle>

                {item.badge ? (
                  <Badge variant="secondary" className={`shrink-0 rounded-full text-[10px] ${item.badgeClass}`}>{item.badge}</Badge>
                ) : (
                  <div className="rounded-md bg-indigo-50 p-2 text-[#4542bd]"><Icon size={17} /></div>
                )}
              </CardHeader>
              
              {/* Content */}
              <CardContent className="px-5">
                <p className="text-3xl font-bold tracking-tight text-[#232254]">{item.value}</p>

                <CardDescription className="mt-3 text-[11px]">
                  {item.description}
                </CardDescription>
              </CardContent>

            </Card>
          );
        })}
      </div>

      {/* Recent Activity / Table*/}
      <Card className="gap-0 overflow-hidden border-slate-100 bg-white py-0 shadow-sm">
        
        <CardHeader className="px-5 py-5">
          <CardTitle className="text-sm font-bold text-[#232254]">Recent Activity</CardTitle>
          <CardDescription className="text-xs">Latest 5 products ingested into the library</CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-0 bg-[#eef2ff] hover:bg-[#eef2ff]">
                  <TableHead className="px-5 py-3 text-[10px] font-semibold tracking-wider text-[#232254]">
                    SKU
                  </TableHead>
                  <TableHead className="py-3 text-[10px] font-semibold tracking-wider text-[#232254]">
                    PRODUCT NAME
                  </TableHead>
                  <TableHead className="py-3 text-[10px] font-semibold tracking-wider text-[#232254]">
                    STATUS
                  </TableHead>
                  <TableHead className="px-5 py-3 text-right text-[10px] font-semibold tracking-wider text-[#232254]">
                    DATE
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {activities.map((item) => (
                  <TableRow key={item.sku} className="h-13 border-slate-100">
                    <TableCell className="px-5 text-xs font-medium text-[#232254]">
                      {item.sku}
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-xs text-[#232254]">
                      {item.name}
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={item.status}/>
                    </TableCell>

                    <TableCell className="whitespace-nowrap px-5 text-right text-[10px] text-[#232254]">
                      {item.date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <p className="text-[10px] text-slate-600">Showing 5 of 1,248 items</p>

          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-lg bg-indigo-50 px-4 py-2 text-slate-700">Previous</span>
            <span className="rounded-lg bg-[#4542bd] px-4 py-2 font-medium text-white">Next</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
