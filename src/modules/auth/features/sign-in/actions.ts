"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/modules/auth/server/session";
import type { ActionResult } from "@/lib/action-result";

export async function login(data: FormData): Promise<ActionResult> {
  try {
    await signIn("credentials", {
      email: data.get("email"),
      password: data.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (!(error instanceof AuthError)) throw error;
    return { error: "Check your email and password and try again." };
  }
  return {};
}

export async function logout() {
  await signOut({ redirectTo: "/sign-in" });
}
