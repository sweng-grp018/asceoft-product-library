import Link from "next/link";
import { KeyRound, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  return (
    <>
      <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-tint text-brand">
        <KeyRound aria-hidden />
      </div>
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-brand-ink">
          Need a new password?
        </h1>
        <p className="text-sm leading-relaxed text-ink-muted">
          For a staff account, ask your store manager to reset your password from the Staff page.
          You can then sign in with the new password they give you.
        </p>
      </header>
      <p className="text-xs leading-relaxed text-ink-muted">
        Password reset emails are not available yet. For a browsing account, or if your store
        manager cannot sign in, contact the person who maintains the app.
      </p>
      <Button asChild variant="outline" size="xl">
        <Link href="/sign-in">
          <ArrowLeft data-icon="inline-start" />
          Back to sign in
        </Link>
      </Button>
    </>
  );
}
