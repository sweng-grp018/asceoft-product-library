"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
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

export function AppSidebar({
  role,
  logout,
  name,
}: {
  role: string;
  logout: () => void;
  name: string;
}) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };
  const navigation = visibleStorePages(role);

  return (
    <Sidebar className="border-r border-line">
      <SidebarHeader className="px-6 py-7">
        <Brand />
      </SidebarHeader>
      <SidebarContent className="px-3">
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
          {accountPages.map(({ label, href, icon: Icon }) => (
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
        <Separator />
        <div className="flex items-center gap-3 px-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-sm font-semibold text-brand">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-brand-ink">{name}</p>
            <p className="truncate text-[11px] text-ink-muted">
              {role === "ADMIN" ? "Store manager" : "Staff"}
            </p>
          </div>
        </div>
        <form action={logout}>
          <SidebarMenuButton type="submit">
            <LogOut aria-hidden />
            <span>Sign out</span>
          </SidebarMenuButton>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
