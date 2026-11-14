import assert from "node:assert/strict";
import test from "node:test";
import { DASHBOARD_ACTIVITIES } from "./dashboard-activity.data";
import { paginateDashboardActivities } from "./dashboard-activity.paging";

test("all 18 products appear exactly once over four pages of five", () => {
  const pages = [1, 2, 3, 4].map((page) => paginateDashboardActivities(DASHBOARD_ACTIVITIES, page));
  assert.deepEqual(
    pages.map(({ start, end }) => [start, end]),
    [
      [1, 5],
      [6, 10],
      [11, 15],
      [16, 18],
    ],
  );
  assert.ok(pages.every(({ pageCount, total }) => pageCount === 4 && total === 18));
  const allRows = pages.flatMap(({ visibleActivities }) => visibleActivities);
  assert.deepEqual(allRows, DASHBOARD_ACTIVITIES);
  assert.equal(new Set(allRows.map(({ id }) => id)).size, 18);
});

test("demo timestamps are valid and ordered newest first", () => {
  const timestamps = DASHBOARD_ACTIVITIES.map(({ addedAt }) => Date.parse(addedAt));
  assert.ok(timestamps.every(Number.isFinite));
  assert.deepEqual(
    timestamps,
    [...timestamps].sort((a, b) => b - a),
  );
});

test("page bounds clamp to first and last page", () => {
  assert.equal(paginateDashboardActivities(DASHBOARD_ACTIVITIES, 0).page, 1);
  assert.equal(paginateDashboardActivities(DASHBOARD_ACTIVITIES, 99).page, 4);
});

test("empty results produce an empty first page", () => {
  assert.deepEqual(paginateDashboardActivities([], 4), {
    visibleActivities: [],
    page: 1,
    pageCount: 1,
    total: 0,
    start: 0,
    end: 0,
  });
});

test("an exact page has no extra page and shrinking data clamps the page", () => {
  const result = paginateDashboardActivities(DASHBOARD_ACTIVITIES.slice(0, 5), 4);
  assert.equal(result.page, 1);
  assert.equal(result.pageCount, 1);
  assert.equal(result.end, 5);
});
