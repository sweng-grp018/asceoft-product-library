import { redirect } from "next/navigation";
import { currentAccount } from "@/modules/auth/server/viewer";
import { AccountDetails } from "@/modules/auth/components/account-details";
export default async function Profile() {
  const account = await currentAccount();
  if (!account) redirect("/sign-in");
  return <AccountDetails account={account} />;
}
