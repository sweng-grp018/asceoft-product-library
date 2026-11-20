"use client";

import { SearchIcon, XIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

type ListProductsToolbarProps = {
  query: string;
  onQueryChange: (query: string) => void;
};

export function ListProductsToolbar({ query, onQueryChange }: ListProductsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-4 shadow-sm ring-1 ring-line sm:flex-row sm:items-center sm:justify-between">
      <InputGroup className="h-11 max-w-xl rounded-lg border-line bg-page">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>

        <InputGroupInput
          type="text"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search by product code, name, or brand..."
          aria-label="Search by product code, name, or brand"
          maxLength={150}
          className="text-sm"
        />

        <InputGroupAddon align="inline-end">
          {query && (
            <InputGroupButton
              size="icon-xs"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
            >
              <XIcon />
            </InputGroupButton>
          )}
          <InputGroupButton type="submit" variant="outline" size="sm">
            Search
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
