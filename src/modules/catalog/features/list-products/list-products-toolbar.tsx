"use client";

import { PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CatalogStatusFilter } from "./list-products.search";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

type ListProductsToolbarProps = {
  query: string;
  canCreate: boolean;
  onQueryChange: (query: string) => void;
  onCreate: () => void;
  statusFilter: CatalogStatusFilter;
  onStatusChange: (value: CatalogStatusFilter) => void;
  onClearFilters: () => void;
};

export function ListProductsToolbar({
  query,
  canCreate,
  onQueryChange,
  onCreate,
  statusFilter,
  onStatusChange,
  onClearFilters,
}: ListProductsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-4 shadow-sm ring-1 ring-line xl:flex-row xl:items-center xl:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <InputGroup className="h-11 max-w-xl flex-1 rounded-lg border-line bg-page">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>

          <InputGroupInput
            type="text"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search by SKU, product name, or brand..."
            aria-label="Search by SKU, product name, or brand"
            className="text-sm"
          />

          {query ? (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                onClick={() => onQueryChange("")}
                aria-label="Clear search"
              >
                <XIcon />
              </InputGroupButton>
            </InputGroupAddon>
          ) : null}
        </InputGroup>
        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusChange(value as CatalogStatusFilter)}
        >
          <SelectTrigger aria-label="Filter by indexing status" className="h-11 w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All products</SelectItem>
              <SelectItem value="ready">Ready for AI Search</SelectItem>
              <SelectItem value="needs-indexing">Needs Indexing</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {statusFilter !== "all" || query ? (
          <Button type="button" variant="brand-ghost" size="sm" onClick={onClearFilters}>
            Clear filters
          </Button>
        ) : null}
      </div>

      {canCreate ? (
        <Button variant="brand" size="xl" onClick={onCreate}>
          <PlusIcon data-icon="inline-start" />
          Add product
        </Button>
      ) : null}
    </div>
  );
}
