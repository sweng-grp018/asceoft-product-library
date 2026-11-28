import "server-only";
import { redirect } from "next/navigation";
import { can, defaultHomePath, hasMinRole, type Permission, type Role } from "../permissions";
import { currentAccount, type Account } from "./viewer";

export { can, defaultHomePath, hasMinRole, type Permission, type Role } from "../permissions";

export async function requireAccount(): Promise<Account> {
  const account = await currentAccount();
  if (!account) redirect("/sign-in");
  return account;
}

export async function requireMinRole(minRole: Role, fallbackPath?: string): Promise<Account> {
  const account = await requireAccount();
  if (!hasMinRole(account.role, minRole)) redirect(fallbackPath ?? defaultHomePath(account.role));
  return account;
}

export async function requirePermission(
  permission: Permission,
  fallbackPath?: string,
): Promise<Account> {
  const account = await requireAccount();
  if (!can(account.role, permission)) redirect(fallbackPath ?? defaultHomePath(account.role));
  return account;
}
