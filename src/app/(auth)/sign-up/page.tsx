import type { Metadata } from "next";
import { AuthShell } from "@/modules/auth/components/auth-shell";
import { SignUpForm } from "@/modules/auth/features/sign-up/sign-up-form";
export const metadata: Metadata = { title: "Create an account" };
export default function SignUp() {
  return (
    <AuthShell>
      <SignUpForm />
    </AuthShell>
  );
}
