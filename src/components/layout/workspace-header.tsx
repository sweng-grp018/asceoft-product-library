"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { accountPages, storePages } from "./navigation";

export function WorkspaceHeader() {
  const pathname = usePathname();
  const title =
    [...storePages, ...accountPages].find(
      (page) => pathname === page.href || pathname.startsWith(`${page.href}/`),
    )?.label ?? "Store";
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line bg-background px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-4" />
        <span className="hidden text-xs text-ink-muted sm:inline">Store</span>
        <ChevronRight aria-hidden className="hidden size-3 text-ink-muted sm:block" />
        <span className="truncate text-xs font-medium text-brand-ink">{title}</span>
      </div>
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" aria-label="Find grocery products">
          <Link href="/search">
            <Search />
          </Link>
        </Button>
      </div>
    </header>
  );
}
