import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { currentAccount } from "@/modules/auth/server/viewer";
import { defaultHomePath } from "@/modules/auth/server/permissions";
import { AccountDetails } from "@/modules/auth/components/account-details";
import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import { logout } from "@/modules/auth/features/sign-in/actions";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";
export const instant = false;
export const metadata: Metadata = { title: "Profile" };
export default async function Account() {
  await connection();
  const account = await currentAccount();
  if (!account) redirect("/sign-in");
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-8">
      <div className="flex items-center justify-between gap-3">
        <Brand href="/search" />
        <ConfirmActionDialog
          trigger={<Button variant="outline">Sign out</Button>}
          title="Sign out?"
          description="You’ll need to sign in again to access your profile."
          confirmLabel="Sign out"
          action={logout}
        />
      </div>
      <Link href={defaultHomePath(account.role)} className="text-sm text-brand hover:underline">
        Back to {account.role === "PUBLIC" ? "products" : "your store"}
      </Link>
      <AccountDetails account={account} />
    </main>
  );
}
