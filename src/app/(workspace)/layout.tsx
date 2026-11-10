
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/modules/auth/server/session";
import { logout } from "@/modules/auth/features/sign-in/actions";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";

export const instant = false;

export default async function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar
        email={session.user.email ?? ""}
        role={session.user.role}
        logout={logout}
      />

      <SidebarInset className="min-w-0 bg-[#F7F9F6]">
        <main className="min-h-svh p-6 md:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
