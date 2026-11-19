"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, KeyRound, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState<string | null>(null);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmail(String(new FormData(event.currentTarget).get("email")).trim());
  }
  return (
    <>
      <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-tint text-brand">
        {email ? <MailCheck aria-hidden /> : <KeyRound aria-hidden />}
      </div>
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-brand-ink">
          {email ? "You’re all set." : "Forgot your password?"}
        </h1>
        <p className="text-sm leading-relaxed text-ink-muted">
          {email
            ? `Reset request previewed for ${email}.`
            : "It happens. Enter your work email to preview the recovery flow."}
        </p>
      </header>
      {email ? (
        <div role="status" className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-ink-muted">
            This is a frontend preview, so no email was sent and no password was changed. For a real
            workspace account, ask your administrator for help.
          </p>
          <Button variant="outline" size="xl" onClick={() => setEmail(null)}>
            Try another email
          </Button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="reset-email">Work email</FieldLabel>
              <Input
                className="h-11"
                id="reset-email"
                name="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                maxLength={254}
                required
              />
            </Field>
            <Button variant="brand" size="xl" type="submit">
              Preview reset request
              <ArrowRight data-icon="inline-end" />
            </Button>
          </FieldGroup>
        </form>
      )}
      <Link
        href="/sign-in"
        className="flex items-center justify-center gap-2 text-sm font-medium text-brand hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to sign in
      </Link>
    </>
  );
}
