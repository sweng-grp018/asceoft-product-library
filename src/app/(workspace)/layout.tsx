import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { auth } from "@/modules/auth/server/session";
import { logout } from "@/modules/auth/features/sign-in/actions";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { WorkspaceHeader } from "@/components/layout/workspace-header";
import { frontendPreview } from "@/lib/frontend-preview";

export const instant = false;

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  if (!frontendPreview) await connection();
  const session = frontendPreview ? null : await auth();

  if (!frontendPreview && !session?.user) {
    redirect("/sign-in");
  }

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar
        email={session?.user.email ?? ""}
        role={session?.user.role ?? "PUBLIC"}
        logout={logout}
        preview={frontendPreview}
      />

      <SidebarInset className="min-w-0 bg-page">
        <WorkspaceHeader preview={frontendPreview} />
        <main id="main-content" className="mx-auto w-full max-w-[1600px] flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
