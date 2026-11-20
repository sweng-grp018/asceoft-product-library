"use server";
import { z } from "zod";
import { api } from "@/lib/api";
import { auth } from "@/modules/auth/server/session";
import { revalidatePath } from "next/cache";
import { actionError, type ActionResult } from "@/lib/action-result";

const userSchema = z.object({
  email: z.email(),
  name: z.string().min(1).max(100),
  password: z.string().min(12).max(200),
  role: z.enum(["ADMIN", "STAFF"]),
});
export async function createStaffUser(data: FormData): Promise<ActionResult> {
  if ((await auth())?.user.role !== "ADMIN")
    return { error: "Only your store manager can add staff." };
  const user = userSchema.safeParse({
    email: data.get("email"),
    password: data.get("password"),
    name: data.get("name"),
    role: data.get("role"),
  });
  if (!user.success)
    return { error: "Enter a name, a valid email, and a password with at least 12 characters." };
  try {
    await api("/auth/users", { method: "POST", data: user.data });
    revalidatePath("/users");
    return {
      message: "Staff account created. Share the sign-in details with your colleague securely.",
    };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateAccount(data: FormData): Promise<ActionResult> {
  const input = z
    .object({ name: z.string().trim().min(2).max(100), email: z.email() })
    .safeParse(Object.fromEntries(data));
  if (!input.success) return { error: "Enter your name and a valid email address." };
  try {
    await api("/auth/me", { method: "PATCH", data: input.data });
    revalidatePath("/", "layout");
    return { message: "Your account details have been saved." };
  } catch (error) {
    return actionError(error);
  }
}

export async function resetStaffPassword(userId: string, data: FormData): Promise<ActionResult> {
  const input = z.string().min(12).max(128).safeParse(data.get("password"));
  if (!input.success) return { error: "Use a password with at least 12 characters." };
  try {
    await api(`/auth/users/${z.uuid().parse(userId)}/password`, {
      method: "PATCH",
      data: { password: input.data },
    });
    return { message: "Password changed. Share the new password securely with this person." };
  } catch (error) {
    return actionError(error);
  }
}
