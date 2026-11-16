import type { DashboardActivity } from "./dashboard-activity.data";

export type ActivityStatusFilter = "all" | "ready" | "needs-indexing";
export type ActivityPeriod = "all" | "today" | "week" | "month" | "custom";
export type ActivityFilters = {
  status: ActivityStatusFilter;
  period: ActivityPeriod;
  today: string;
  from: string;
  to: string;
};

const MANILA_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Manila",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function activityDate(date: Date): string {
  const parts = MANILA_DATE.formatToParts(date);
  const part = (type: string) => parts.find((value) => value.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function daysBefore(today: string, days: number): string {
  const date = new Date(`${today}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

export function filterDashboardActivities(
  activities: readonly DashboardActivity[],
  filters: ActivityFilters,
) {
  let from = "";
  let to = "";
  if (filters.period === "custom") {
    ({ from, to } = filters);
    if (!from || !to || from > to) return [];
  } else if (filters.period !== "all") {
    if (!filters.today) return [];
    to = filters.today;
    from = daysBefore(to, filters.period === "week" ? 6 : filters.period === "month" ? 29 : 0);
  }
  return activities.filter((activity) => {
    if (filters.status === "ready" && activity.status !== "INDEXED") return false;
    if (
      filters.status === "needs-indexing" &&
      activity.status !== "PENDING" &&
      activity.status !== "FAILED"
    )
      return false;
    if (!from) return true;
    const day = activityDate(new Date(activity.addedAt));
    return day >= from && day <= to;
  });
}
