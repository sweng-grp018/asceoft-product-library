import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { STATUS_META } from "./list-products.data";
import type { IndexStatus } from "./list-products.types";

export function StatusPill({ status }: { status: IndexStatus }) {
  const meta = STATUS_META[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 gap-1.5 rounded-full border-transparent px-2.5 text-[11px] font-semibold",
        meta.pill,
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </Badge>
  );
}
