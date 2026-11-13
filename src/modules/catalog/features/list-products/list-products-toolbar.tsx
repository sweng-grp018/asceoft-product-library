"use client";

import { PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
};

export function ListProductsToolbar({
  query,
  canCreate,
  onQueryChange,
  onCreate,
}: ListProductsToolbarProps) {
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

      {canCreate ? (
        <Button variant="brand" size="xl" onClick={onCreate}>
          <PlusIcon data-icon="inline-start" />
          Add product
        </Button>
      ) : null}
    </div>
  );
}
