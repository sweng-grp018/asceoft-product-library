"use server";
import { z } from "zod";
import { api } from "@/lib/api";
import { auth } from "@/modules/auth/server/session";

const userSchema = z.object({
  email: z.email(),
  name: z.string().min(1).max(100),
  password: z.string().min(12).max(200),
  role: z.enum(["ADMIN", "STAFF"]),
});
export async function createStaffUser(data: FormData) {
  if ((await auth())?.user.role !== "ADMIN") throw new Error("Admin access required");
  const user = userSchema.parse({
    email: data.get("email"),
    password: data.get("password"),
    name: data.get("name"),
    role: data.get("role"),
  });
  await api("/auth/users", { method: "POST", body: JSON.stringify(user) });
}
