"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusPill } from "@/modules/catalog/features/list-products/status-pill";
import type { DashboardActivity } from "./dashboard-activity.data";
import { paginateDashboardActivities } from "./dashboard-activity.paging";

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Manila",
});

export function DashboardRecentActivity({
  activities,
}: {
  activities: readonly DashboardActivity[];
}) {
  const [requestedPage, setPage] = useState(1);
  const { visibleActivities, page, pageCount, total, start, end } = paginateDashboardActivities(
    activities,
    requestedPage,
  );

  if (page !== requestedPage) setPage(page);

  return (
    <Card className="gap-0 overflow-hidden border-line bg-card py-0 shadow-sm">
      <CardHeader className="px-5 py-5">
        <CardTitle className="text-sm font-bold text-brand-ink">Recent Activity</CardTitle>
        <CardDescription className="text-xs">
          Sample products, newest first · 5 per page
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableCaption className="sr-only">
            Sample products with indexing status and added date.
          </TableCaption>
          <TableHeader>
            <TableRow className="border-0 bg-brand-tint hover:bg-brand-tint">
              <TableHead
                scope="col"
                className="px-5 py-3 text-[10px] font-semibold tracking-wider text-brand-ink"
              >
                SKU
              </TableHead>
              <TableHead
                scope="col"
                className="py-3 text-[10px] font-semibold tracking-wider text-brand-ink"
              >
                PRODUCT NAME
              </TableHead>
              <TableHead
                scope="col"
                className="py-3 text-[10px] font-semibold tracking-wider text-brand-ink"
              >
                STATUS
              </TableHead>
              <TableHead
                scope="col"
                className="px-5 py-3 text-right text-[10px] font-semibold tracking-wider text-brand-ink"
              >
                DATE
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleActivities.map((item) => (
              <TableRow key={item.id} className="h-13 border-line-subtle">
                <TableCell className="px-5 text-xs font-medium text-brand-ink">
                  {item.sku}
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs text-brand-ink">
                  {item.name}
                </TableCell>
                <TableCell>
                  <StatusPill status={item.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap px-5 text-right text-[10px] text-brand-ink">
                  <time dateTime={item.addedAt}>{DATE_FORMAT.format(new Date(item.addedAt))}</time>
                </TableCell>
              </TableRow>
            ))}
            {total === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No recent products to show.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardContent>

      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <p role="status" className="text-xs text-ink-muted tabular-nums">
          {total ? `Showing ${start}–${end} of ${total} items` : "No items to show"}
        </p>
        <Pagination aria-label="Recent activity pages" className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={page <= 1 || total === 0}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeftIcon data-icon="inline-start" />
                Previous
              </Button>
            </PaginationItem>
            <PaginationItem>
              <span
                className="px-2 text-xs text-ink-muted"
                aria-label={`Page ${page} of ${pageCount}`}
              >
                {page} / {pageCount}
              </span>
            </PaginationItem>
            <PaginationItem>
              <Button
                type="button"
                variant="brand"
                size="sm"
                disabled={page >= pageCount || total === 0}
                onClick={() => setPage(page + 1)}
              >
                Next
                <ChevronRightIcon data-icon="inline-end" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </Card>
  );
}
