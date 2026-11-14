import assert from "node:assert/strict";
import test from "node:test";
import { PLACEHOLDER_ROWS } from "./list-products.data";
import { paginateCatalogRows } from "./list-products.paging";
import { filterCatalogRows } from "./list-products.search";

test("all sample products are reachable across three distinct pages", () => {
  const pages = [1, 2, 3].map((page) => paginateCatalogRows(PLACEHOLDER_ROWS, page));
  assert.deepEqual(
    pages.map(({ start, end }) => [start, end]),
    [
      [1, 6],
      [7, 12],
      [13, 18],
    ],
  );
  assert.ok(pages.every(({ total, pageCount }) => total === 18 && pageCount === 3));
  assert.deepEqual(
    pages.flatMap(({ visibleRows }) => visibleRows),
    PLACEHOLDER_ROWS,
  );
  assert.equal(new Set(PLACEHOLDER_ROWS.map(({ sku }) => sku)).size, 18);
});

test("search filters the full catalog before paging", () => {
  const matching = filterCatalogRows(PLACEHOLDER_ROWS, "Makita");
  const result = paginateCatalogRows(matching, 1);
  assert.equal(result.total, 2);
  assert.equal(result.pageCount, 1);
  assert.ok(result.visibleRows.every(({ brand }) => brand === "Makita"));
});

test("out-of-range pages clamp to the first and last pages", () => {
  assert.equal(paginateCatalogRows(PLACEHOLDER_ROWS, 0).page, 1);
  assert.equal(paginateCatalogRows(PLACEHOLDER_ROWS, 99).page, 3);
});

test("deleting the last page clamps to the remaining partial page", () => {
  const result = paginateCatalogRows(PLACEHOLDER_ROWS.slice(0, 7), 3);
  assert.equal(result.page, 2);
  assert.equal(result.pageCount, 2);
  assert.equal(result.start, 7);
  assert.equal(result.end, 7);
  assert.equal(result.visibleRows.length, 1);
});

test("an empty search or catalog has a stable empty first page", () => {
  const result = paginateCatalogRows(filterCatalogRows(PLACEHOLDER_ROWS, "no-such-product"), 3);
  assert.deepEqual(result, {
    visibleRows: [],
    total: 0,
    page: 1,
    pageCount: 1,
    start: 0,
    end: 0,
  });
});
