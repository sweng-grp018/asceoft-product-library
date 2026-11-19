import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { currentAccount } from "@/modules/auth/server/viewer";
import { logout } from "@/modules/auth/features/sign-in/actions";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { WorkspaceHeader } from "@/components/layout/workspace-header";

export const instant = false;

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  await connection();
  const account = await currentAccount();
  if (!account) redirect("/sign-in");
  if (account.role === "PUBLIC") redirect("/search");

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar name={account.name} role={account.role} logout={logout} />

      <SidebarInset className="min-w-0 bg-page">
        <WorkspaceHeader />
        <main id="main-content" className="mx-auto w-full max-w-[1600px] flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
