import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthShell } from "@/modules/auth/components/auth-shell";
import { SignInForm } from "@/modules/auth/features/sign-in/sign-in-form";

export const metadata: Metadata = { title: "Sign in" };
async function SignInError({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return error ? (
    <p role="alert" className="text-sm text-destructive">
      We couldn’t sign you in. Check your email and password and try again.
    </p>
  ) : null;
}
export default function SignIn({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <AuthShell>
      <SignInForm
        error={
          <Suspense fallback={null}>
            <SignInError searchParams={searchParams} />
          </Suspense>
        }
      />
    </AuthShell>
  );
}
