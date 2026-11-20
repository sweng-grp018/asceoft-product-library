"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";

const NUMBER_FORMAT = new Intl.NumberFormat("en-US");

type ListProductsPaginationProps = {
  shownCount: number;
  total: number;
  page: number;
  pageCount: number;
  pageSize?: number;
  onPage?: (page: number) => void;
};

/**
 * Shows database-backed page totals and navigation.
 */
export function ListProductsPagination({
  shownCount,
  total,
  page,
  pageCount,
  pageSize = 25,
  onPage,
}: ListProductsPaginationProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-line-subtle px-6 py-4 lg:flex-row">
      <p className="text-sm text-ink-muted tabular-nums">
        {shownCount > 0 ? (
          <>
            Showing{" "}
            <span className="font-semibold text-brand-ink">
              {(page - 1) * pageSize + 1}–{(page - 1) * pageSize + shownCount}
            </span>{" "}
            of <span className="font-semibold text-brand-ink">{NUMBER_FORMAT.format(total)}</span>{" "}
            products
          </>
        ) : (
          "No products to show"
        )}
      </p>

      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <Button
              type="button"
              variant="secondary"
              size="xl"
              disabled={page <= 1}
              onClick={() => onPage?.(page - 1)}
            >
              <ChevronLeftIcon data-icon="inline-start" />
              Previous
            </Button>
          </PaginationItem>

          <PaginationItem>
            <span className="px-2 font-mono text-xs whitespace-nowrap text-ink-muted tabular-nums">
              <span className="rounded bg-brand-tint px-1.5 py-0.5 font-semibold text-brand-ink">
                {page}
              </span>
              {" / "}
              {NUMBER_FORMAT.format(pageCount)}
            </span>
          </PaginationItem>

          <PaginationItem>
            <Button
              type="button"
              variant="secondary"
              size="xl"
              disabled={page >= pageCount}
              onClick={() => onPage?.(page + 1)}
            >
              Next
              <ChevronRightIcon data-icon="inline-end" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
