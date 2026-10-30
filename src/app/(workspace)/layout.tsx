import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/modules/auth/server/session";
import { logout } from "@/modules/auth/features/sign-in/actions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Authentication is checked against the request before rendering workspace content.
export const instant = false;

const links = [
  ["Dashboard", "/dashboard"],
  ["Products", "/products"],
  ["Indexing", "/training"],
  ["Shelf images", "/repository"],
  ["History", "/history"],
  ["Users", "/users"],
] as const;

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-5 py-7">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Link className="text-xl font-semibold tracking-tight" href="/dashboard">
          Lensistry
        </Link>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            {session.user.email} · {session.user.role}
          </span>
          <form action={logout}>
            <Button variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <nav aria-label="Workspace" className="flex flex-wrap gap-2 py-5">
        {links.map(([label, href]) => (
          <Button asChild key={href} variant="ghost" size="sm">
            <Link href={href}>{label}</Link>
          </Button>
        ))}
        <Button asChild variant="outline" size="sm">
          <Link href="/search">Public search</Link>
        </Button>
      </nav>
      <Separator />
      <main className="flex-1 py-8">{children}</main>
    </div>
  );
}
