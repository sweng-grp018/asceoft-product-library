import type { DashboardActivity } from "./dashboard-activity.data";

const ACTIVITY_PAGE_SIZE = 5;

export function paginateDashboardActivities(
  activities: readonly DashboardActivity[],
  requestedPage: number,
) {
  const total = activities.length;
  const pageCount = Math.max(1, Math.ceil(total / ACTIVITY_PAGE_SIZE));
  const page = Math.max(1, Math.min(requestedPage, pageCount));
  const offset = (page - 1) * ACTIVITY_PAGE_SIZE;
  const visibleActivities = activities.slice(offset, offset + ACTIVITY_PAGE_SIZE);

  return {
    visibleActivities,
    page,
    pageCount,
    total,
    start: total ? offset + 1 : 0,
    end: offset + visibleActivities.length,
  };
}
