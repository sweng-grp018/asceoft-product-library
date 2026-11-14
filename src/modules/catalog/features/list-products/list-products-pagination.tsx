"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";

const NUMBER_FORMAT = new Intl.NumberFormat("en-US");

type ListProductsPaginationProps = {
  start: number;
  end: number;
  total: number;
  page: number;
  pageCount: number;
  onPrevious: () => void;
  onNext: () => void;
};

/** Footer shared by the desktop table and mobile cards. */
export function ListProductsPagination({
  start,
  end,
  total,
  page,
  pageCount,
  onPrevious,
  onNext,
}: ListProductsPaginationProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-line-subtle px-6 py-4 lg:flex-row">
      <p role="status" className="text-sm text-ink-muted tabular-nums">
        {total > 0 ? (
          <>
            Showing{" "}
            <span className="font-semibold text-brand-ink">
              {NUMBER_FORMAT.format(start)}–{NUMBER_FORMAT.format(end)}
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
              disabled={page <= 1 || total === 0}
              onClick={onPrevious}
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
              disabled={page >= pageCount || total === 0}
              onClick={onNext}
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
