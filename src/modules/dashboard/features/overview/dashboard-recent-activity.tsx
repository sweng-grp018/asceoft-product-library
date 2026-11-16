"use client";

import { useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  activityDate,
  filterDashboardActivities,
  type ActivityStatusFilter,
  type ActivityPeriod,
} from "./dashboard-activity.filters";

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Manila",
});

export function DashboardRecentActivity({
  activities,
  statusFilter = "all",
  onClearStatus,
}: {
  activities: readonly DashboardActivity[];
  statusFilter?: ActivityStatusFilter;
  onClearStatus?: () => void;
}) {
  const [requestedPage, setPage] = useState(1);
  const [period, setPeriod] = useState<ActivityPeriod>("all");
  const [today, setToday] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [previousStatus, setPreviousStatus] = useState(statusFilter);
  useEffect(() => {
    setToday(activityDate(new Date()));
  }, []);
  if (previousStatus !== statusFilter) {
    setPreviousStatus(statusFilter);
    setPage(1);
  }
  const invalidRange = period === "custom" && Boolean(from && to && from > to);
  const filtered = filterDashboardActivities(activities, {
    status: statusFilter,
    period,
    today,
    from,
    to,
  });
  const { visibleActivities, page, pageCount, total, start, end } = paginateDashboardActivities(
    filtered,
    requestedPage,
  );

  if (page !== requestedPage) setPage(page);

  return (
    <Card
      id="dashboard-recent-activity"
      className="gap-0 overflow-hidden border-line bg-card py-0 shadow-sm"
    >
      <CardHeader className="px-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-sm font-bold text-brand-ink">Recent Activity</CardTitle>
            <CardDescription className="text-xs">
              Sample products, newest first · 5 per page
            </CardDescription>
          </div>
          <div className="flex w-full flex-col gap-1.5 sm:w-auto">
            <label htmlFor="activity-period" className="text-xs font-medium text-ink-muted">
              Date added
            </label>
            <Select
              value={period}
              onValueChange={(value) => {
                setPeriod(value as ActivityPeriod);
                setPage(1);
                if (value === "custom" && !from && !to) {
                  setFrom(today);
                  setTo(today);
                }
              }}
            >
              <SelectTrigger id="activity-period" className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">Last 30 days</SelectItem>
                  <SelectItem value="custom">Custom date range</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        {period === "custom" ? (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label
              className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-ink-muted"
              htmlFor="activity-from"
            >
              From
              <Input
                id="activity-from"
                type="date"
                value={from}
                max={to || undefined}
                aria-describedby="activity-date-help"
                aria-invalid={invalidRange}
                onChange={(event) => {
                  setFrom(event.target.value);
                  setPage(1);
                }}
              />
            </label>
            <label
              className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-ink-muted"
              htmlFor="activity-to"
            >
              To
              <Input
                id="activity-to"
                type="date"
                value={to}
                min={from || undefined}
                aria-describedby="activity-date-help"
                aria-invalid={invalidRange}
                onChange={(event) => {
                  setTo(event.target.value);
                  setPage(1);
                }}
              />
            </label>
          </div>
        ) : null}
        <p id="activity-date-help" className="mt-2 text-xs text-ink-muted">
          {invalidRange
            ? "End date must be on or after the start date."
            : period === "custom"
              ? "Dates use Philippine time. Select the same start and end date for a single day."
              : "Dates use Philippine time."}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium text-brand-ink">
            {statusFilter === "ready"
              ? "Ready for AI Search"
              : statusFilter === "needs-indexing"
                ? "Needs Indexing (unindexed or failed)"
                : "All indexing statuses"}
          </p>
          {statusFilter !== "all" || period !== "all" ? (
            <Button
              type="button"
              size="sm"
              variant="brand-ghost"
              onClick={() => {
                onClearStatus?.();
                setPeriod("all");
                setFrom("");
                setTo("");
                setPage(1);
              }}
            >
              Clear filters
            </Button>
          ) : null}
        </div>
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
                  <div className="flex flex-col gap-1">
                    <p>No activity matches these filters.</p>
                    <p className="text-xs">Try a wider date range or clear the filters.</p>
                  </div>
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
