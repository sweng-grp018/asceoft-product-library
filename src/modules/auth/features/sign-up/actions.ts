"use server";
import { z } from "zod";
import { api } from "@/lib/api";
import { actionError, type ActionResult } from "@/lib/action-result";

const registration = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  password: z.string().min(12).max(128),
});
export async function registerAccount(data: FormData): Promise<ActionResult> {
  const input = registration.safeParse(Object.fromEntries(data));
  if (!input.success)
    return { error: "Enter your name, email and a password with at least 12 characters." };
  if (input.data.password !== data.get("confirmPassword"))
    return { error: "Your passwords do not match." };
  try {
    await api("/auth/register", { method: "POST", data: input.data }, false);
    return {
      message:
        "Your account is ready. Sign in to browse products. Staff access is provided by your store manager.",
    };
  } catch (error) {
    return actionError(error);
  }
}
