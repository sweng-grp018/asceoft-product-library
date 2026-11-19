"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  LayoutDashboard,
  Package,
  ScanSearch,
  Images,
  History,
  Layers,
  Users,
  Settings,
  ArrowUpRight,
  FlaskConical,
} from "lucide-react";
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
import {
  previewProfile,
  DEFAULT_PROFILE,
} from "@/modules/auth/features/frontend-preview/preview-profile";

const links = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Product catalog", href: "/products", icon: Package },
  { label: "Detection & search", href: "/detection", icon: ScanSearch },
  { label: "Image repository", href: "/repository", icon: Images },
  { label: "Detection history", href: "/history", icon: History },
  { label: "Reference index", href: "/training", icon: Layers },
];

export function AppSidebar({
  email,
  role,
  logout,
  preview = false,
}: {
  email: string;
  role: string;
  logout: () => void;
  preview?: boolean;
}) {
  const pathname = usePathname();
  const profile = previewProfile.useValue();
  const { isMobile, setOpenMobile } = useSidebar();
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };
  const navigation =
    role === "ADMIN" || preview
      ? [...links, { label: "Team members", href: "/users", icon: Users }]
      : links;

  return (
    <Sidebar className="border-r border-line">
      <SidebarHeader className="px-6 py-7">
        <Brand />
      </SidebarHeader>
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
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
        {preview && (
          <div className="mx-3 mt-auto rounded-xl border border-line bg-brand-tint p-4">
            <FlaskConical className="mb-2 size-5 text-brand" aria-hidden />
            <p className="text-xs font-semibold text-brand-ink">A space to explore</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              Sample data. Local changes. Reload for a fresh start.
            </p>
          </div>
        )}
      </SidebarContent>
      <SidebarFooter className="gap-3 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-9">
              <Link href="/search" onClick={closeOnMobile}>
                <ArrowUpRight aria-hidden />
                <span>Public catalog</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/profile"} className="h-9">
              <Link href="/profile" onClick={closeOnMobile}>
                <Settings aria-hidden />
                <span>Settings & profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <Separator />
        <div className="flex items-center gap-3 px-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-sm font-semibold text-brand">
            {(preview ? profile.name : email).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-brand-ink">
              {preview ? profile.name : email}
            </p>
            <p className="truncate text-[11px] text-ink-muted">
              {preview ? "Preview workspace" : role.toLowerCase()}
            </p>
          </div>
        </div>
        {preview ? (
          <SidebarMenuButton asChild>
            <Link
              href="/sign-in"
              onClick={() => {
                previewProfile.setValue(DEFAULT_PROFILE);
                closeOnMobile();
              }}
            >
              <LogOut aria-hidden />
              <span>Leave preview</span>
            </Link>
          </SidebarMenuButton>
        ) : (
          <form action={logout}>
            <SidebarMenuButton type="submit">
              <LogOut aria-hidden />
              <span>Sign out</span>
            </SidebarMenuButton>
          </form>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
