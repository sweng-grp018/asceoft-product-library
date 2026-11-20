import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageHeading } from "@/components/layout/page-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { currentAccount } from "@/modules/auth/server/viewer";
import { AccountDetails } from "@/modules/auth/components/account-details";

export const metadata: Metadata = { title: "Profile" };

export default function Profile() {
  return (
    <Suspense
      fallback={
        <div className="flex max-w-2xl flex-col gap-6">
          <PageHeading title="Profile" description="Keep your name and email address up to date." />
          <Skeleton
            role="status"
            aria-label="Loading profile details"
            className="h-64 w-full rounded-xl"
          />
        </div>
      }
    >
      <ProfileDetails />
    </Suspense>
  );
}

async function ProfileDetails() {
  const account = await currentAccount();
  if (!account) redirect("/sign-in");
  return <AccountDetails account={account} />;
}
