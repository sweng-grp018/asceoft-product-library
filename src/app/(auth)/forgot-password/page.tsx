import type { Metadata } from "next";
import { AuthShell } from "@/modules/auth/components/auth-shell";
import { ForgotPasswordForm } from "@/modules/auth/features/forgot-password/forgot-password-form";
export const metadata: Metadata = { title: "Reset password" };
export default function ForgotPassword() {
  return (
    <AuthShell>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
