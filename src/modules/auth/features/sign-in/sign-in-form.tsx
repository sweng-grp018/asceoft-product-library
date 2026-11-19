"use client";
import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import { ArrowRight, Mail, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { PasswordInput } from "@/modules/auth/components/password-input";
import type { ActionResult } from "@/lib/action-result";
import { login } from "./actions";

export function SignInForm({ error }: { error: ReactNode }) {
  const [result, action, pending] = useActionState<ActionResult, FormData>(
    async (_previous, data) => login(data),
    {},
  );
  return (
    <>
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.16em] text-brand uppercase">
          Your grocery library
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
          Welcome back.
        </h1>
        <p className="text-sm text-ink-muted">Sign in to find and manage your store’s products.</p>
      </header>
      <form action={action}>
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="sign-in-email">Email address</FieldLabel>
            <InputGroup className="h-11">
              <InputGroupAddon>
                <Mail aria-hidden />
              </InputGroupAddon>
              <InputGroupInput
                id="sign-in-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="username"
                required
                maxLength={254}
              />
            </InputGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor="sign-in-password">Password</FieldLabel>
            <PasswordInput
              id="sign-in-password"
              name="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              maxLength={128}
            />
          </Field>
          {error}
          <FieldError>{result.error}</FieldError>
          <Link
            href="/forgot-password"
            className="self-end text-xs font-medium text-brand hover:underline"
          >
            Forgot password?
          </Link>
          <Button type="submit" variant="brand" size="xl" disabled={pending} className="w-full">
            {pending ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : null}
            {pending ? "Signing in…" : "Sign in"}
            <ArrowRight data-icon="inline-end" />
          </Button>
        </FieldGroup>
      </form>
      <p className="text-center text-sm text-ink-muted">
        New here?{" "}
        <Link href="/sign-up" className="font-semibold text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
