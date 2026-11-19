"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/modules/auth/server/session";
import { frontendPreview } from "@/lib/frontend-preview";

export async function login(data: FormData) {
  if (frontendPreview) redirect("/dashboard");
  try {
    await signIn("credentials", {
      email: data.get("email"),
      password: data.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (!(error instanceof AuthError)) throw error;
    redirect("/sign-in?error=credentials");
  }
}

export async function logout() {
  if (frontendPreview) redirect("/sign-in");
  await signOut({ redirectTo: "/sign-in" });
}
