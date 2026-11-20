"use client";
import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, LoaderCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { PasswordInput } from "@/modules/auth/components/password-input";
import type { ActionResult } from "@/lib/action-result";
import { registerAccount } from "./actions";

export function SignUpForm() {
  const [result, action, pending] = useActionState<ActionResult, FormData>(
    async (_previous, data) => registerAccount(data),
    {},
  );
  if (result.message)
    return (
      <>
        <CheckCircle2 className="size-10 text-status-ready-fg" aria-hidden />
        <h1 className="text-3xl font-semibold text-brand-ink">Your account is ready.</h1>
        <p role="status" className="text-sm leading-relaxed text-ink-muted">
          {result.message}
        </p>
        <Button asChild variant="brand" size="xl">
          <Link href="/sign-in">
            Sign in
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </>
    );
  return (
    <>
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.16em] text-brand uppercase">
          Find your everyday essentials
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
          Create an account.
        </h1>
        <p className="text-sm text-ink-muted">
          Browse grocery products and keep your account details in one place.
        </p>
      </header>
      <form action={action}>
        <FieldGroup className="gap-3">
          <Field>
            <FieldLabel htmlFor="sign-up-name">Full name</FieldLabel>
            <Input
              className="h-11"
              id="sign-up-name"
              name="name"
              placeholder="Jamie Cruz"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="sign-up-email">Email address</FieldLabel>
            <Input
              className="h-11"
              id="sign-up-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              maxLength={254}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="sign-up-password">Password</FieldLabel>
            <PasswordInput
              id="sign-up-password"
              name="password"
              placeholder="At least 12 characters"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={128}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="sign-up-confirm">Confirm password</FieldLabel>
            <PasswordInput
              id="sign-up-confirm"
              name="confirmPassword"
              placeholder="Enter your password again"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={128}
            />
          </Field>
          <FieldError>{result.error}</FieldError>
          <Button type="submit" variant="brand" size="xl" disabled={pending}>
            {pending ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : null}
            {pending ? "Creating account…" : "Create account"}
            <ArrowRight data-icon="inline-end" />
          </Button>
        </FieldGroup>
      </form>
      <p className="text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-brand hover:underline">
          Sign in
        </Link>
      </p>
      <p className="text-center text-xs leading-relaxed text-ink-muted">
        For access to staff pages, ask your store manager to add you.
      </p>
    </>
  );
}
