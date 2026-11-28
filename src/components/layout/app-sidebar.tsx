"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, LogOut, Search } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Brand } from "./brand";
import { accountPages, visibleStorePages } from "./navigation";
import { PageGuide } from "./page-guide";
import { defaultHomePath } from "@/modules/auth/permissions";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";
import { GlobalSearchDialog } from "./global-search";

export function AppSidebar({
  role,
  logout,
  name,
  accountId,
}: {
  role: string;
  logout: () => Promise<void>;
  name: string;
  accountId: string;
}) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };
  const navigation = visibleStorePages(role);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function openSearch(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      setSearchOpen(true);
    }
    window.addEventListener("keydown", openSearch);
    return () => window.removeEventListener("keydown", openSearch);
  }, []);

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <Sidebar className="border-r border-sidebar-border">
        <SidebarHeader className="px-6 py-7">
          <Brand href={defaultHomePath(role)} />
        </SidebarHeader>
        <SidebarContent className="px-3">
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <DialogTrigger asChild>
                  <SidebarMenuButton
                    className="h-10 border border-sidebar-border bg-background/70"
                    aria-keyshortcuts="Control+K Meta+K"
                  >
                    <Search aria-hidden />
                    <span>Search</span>
                    <kbd className="ml-auto rounded border border-sidebar-border px-1 text-[10px]">
                      Ctrl K
                    </kbd>
                  </SidebarMenuButton>
                </DialogTrigger>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Store</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {navigation.map(({ label, href, icon: Icon }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === href || pathname.startsWith(`${href}/`)}
                      className="h-10 gap-3"
                      tooltip={label}
                    >
                      <Link
                        href={href}
                        onClick={closeOnMobile}
                        aria-current={
                          pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined
                        }
                      >
                        <Icon aria-hidden />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="gap-3 p-4">
          <SidebarMenu>
            {accountPages
              .filter(({ href }) => href !== "/profile")
              .map(({ label, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={pathname === href} className="h-9">
                    <Link href={href} onClick={closeOnMobile}>
                      <Icon aria-hidden />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            <SidebarMenuItem>
              <PageGuide role={role} onVisit={closeOnMobile} />
            </SidebarMenuItem>
          </SidebarMenu>
          <Separator className="bg-sidebar-border" />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/profile"}
                className="h-auto gap-3 py-2"
              >
                <Link href="/profile" onClick={closeOnMobile} aria-label={`Profile for ${name}`}>
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-sm font-semibold text-brand">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{name}</p>
                    <p className="truncate text-[11px] text-ink-muted">
                      {role === "ADMIN" ? "Store manager" : "Staff"}
                    </p>
                  </div>
                  <ChevronRight aria-hidden />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <ConfirmActionDialog
                trigger={
                  <SidebarMenuButton type="button">
                    <LogOut aria-hidden />
                    <span>Sign out</span>
                  </SidebarMenuButton>
                }
                title="Sign out?"
                description="You’ll need to sign in again to return to the workspace."
                confirmLabel="Sign out"
                action={logout}
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <GlobalSearchDialog
        role={role}
        accountId={accountId}
        onNavigate={() => {
          setSearchOpen(false);
          closeOnMobile();
        }}
      />
    </Dialog>
  );
}
