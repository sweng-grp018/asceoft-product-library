import Link from "next/link";
import { Box } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({
  href = "/dashboard",
  inverse = false,
}: {
  href?: string;
  inverse?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label="Lensistry home"
      className={cn("inline-flex items-center gap-3", inverse ? "text-white" : "text-brand-ink")}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          inverse ? "bg-white/15" : "bg-brand text-white",
        )}
      >
        <Box className="size-5" aria-hidden />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-lg leading-none font-bold tracking-tight">Lensistry.</span>
        <span
          className={cn(
            "text-[11px] font-medium tracking-wide",
            inverse ? "text-white/65" : "text-ink-muted",
          )}
        >
          Product Library
        </span>
      </span>
    </Link>
  );
}
