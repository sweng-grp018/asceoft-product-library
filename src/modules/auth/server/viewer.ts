import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { auth } from "./session";
import { api } from "@/lib/api";

export type Account = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF" | "PUBLIC";
};

/** Always check the current database role through Express before rendering staff pages. */
export const currentAccount = cache(async (): Promise<Account | null> => {
  await connection();
  if (!(await auth())?.accessToken) return null;
  try {
    return (await api<{ user: Account }>("/auth/me")).user;
  } catch (error) {
    if (error instanceof Error && "status" in error && error.status === 401) return null;
    throw error;
  }
});
