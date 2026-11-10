"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, MoveRight, LogOut, LayoutDashboard, Package, ScanSearch, Image, History, Search,} from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,} from "@/components/ui/sidebar";

// nav menus
const links = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Product Catalog", href: "/products", icon: Package },
  { label: "AI Indexing", href: "/training", icon: ScanSearch },
  { label: "Image Repository", href: "/repository", icon: Image },
  { label: "Find in Photos", href: "/find-in-photos", icon: Search },
  { label: "Search History", href: "/history", icon: History },
];

type AppSidebarProps = {
  email: string;
  role: string;
  logout: () => void;
};

export function AppSidebar({ email, role, logout }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r-0 text-[#3c6340]">

      <SidebarHeader className="px-6 py-8 mb-6">
        <Link href="/dashboard" className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-[#235946] text-lg font-bold text-white">
            <Box />
          </div>

          <div>
            <p className="text-2xl font-bold text-[#1a2421]">Lensistry</p>
            <p className="text-sm text-[#364d46]">Product Library</p>
          </div>
        </Link>
      </SidebarHeader>

      <p className="px-6 py-4 text-xs font-semibold text-[#364d46]">WORKSPACE</p>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-6">
              {links.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label} className="gap-5 h-11 rounded-lg px-3 text-[#364d46] hover:bg-[#dce8d9] hover:text-[#235946] data-[active=true]:bg-[#e8f0e5] data-[active=true]:text-[#315c40] data-[active=true]:hover:bg-[#e8f0e5] data-[active=true]:hover:text-[#315c40]">
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-6 py-4">

        <Link href="/search" className="flex items-center py-2 text-sm gap-4 text-[#364d46] hover:text-[#235946]">
          Public search
          <MoveRight />
        </Link>

        <Link href="/profile" className="flex items-center py-2 text-sm text-[#364d46] hover:text-[#235946]">
          Settings & Profile
        </Link>

        <div className="flex items-center gap-3 px-1 py-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-[#d5ded5] text-lg font-semibold text-[#235946]">
            {email.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#1a2421]">{email}</p>
            <p className="text-xs text-[#364d46]">{role}</p>
          </div>
        </div>
        
        {/* FOR TESTING : Don't mind the placement of this muna */}
        <form action={logout}>
          <SidebarMenuButton className="h-10 text-[#49634F] hover:bg-[#DCE8D9]">
            <LogOut />
            <span>Sign out</span>
          </SidebarMenuButton>
        </form>
      </SidebarFooter>

      
    </Sidebar>
  );
}
