"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, FlaskConical, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const titles: Record<string, string> = {
  dashboard: "Overview",
  products: "Product catalog",
  detection: "Detection & search",
  repository: "Image repository",
  history: "Detection history",
  training: "Reference index",
  users: "Team members",
  profile: "Settings & profile",
};

export function WorkspaceHeader({ preview }: { preview: boolean }) {
  const pathname = usePathname();
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line bg-background px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-4" />
        <span className="hidden text-xs text-ink-muted sm:inline">Workspace</span>
        <ChevronRight aria-hidden className="hidden size-3 text-ink-muted sm:block" />
        <span className="truncate text-xs font-medium text-brand-ink">
          {titles[pathname.split("/")[1]] ?? "Workspace"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {preview && (
          <Badge variant="secondary">
            <FlaskConical data-icon="inline-start" />
            Frontend preview
          </Badge>
        )}
        <Button asChild variant="ghost" size="icon" aria-label="Search the public catalog">
          <Link href="/search">
            <Search />
          </Link>
        </Button>
      </div>
    </header>
  );
}
