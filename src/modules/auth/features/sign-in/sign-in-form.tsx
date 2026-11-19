"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode, type FormEvent } from "react";
import { ArrowRight, Mail, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { PasswordInput } from "@/modules/auth/components/password-input";
import { frontendPreview } from "@/lib/frontend-preview";
import {
  previewProfile,
  DEFAULT_PROFILE,
} from "@/modules/auth/features/frontend-preview/preview-profile";
import { login } from "./actions";

export function SignInForm({ error }: { error: ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rememberEmail, setRememberEmail] = useState(false);
  const [email, setEmail] = useState("");
  useEffect(() => {
    if (!frontendPreview) return;
    try {
      const savedEmail = localStorage.getItem("lensistry-preview-email-v1");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberEmail(true);
      }
    } catch {
      /* The preview works without browser storage. */
    }
  }, []);
  function submitPreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    previewProfile.setValue({
      ...DEFAULT_PROFILE,
      email,
      name: email.split("@")[0].replaceAll(/[._-]/g, " "),
    });
    try {
      if (rememberEmail) localStorage.setItem("lensistry-preview-email-v1", email);
      else localStorage.removeItem("lensistry-preview-email-v1");
    } catch {
      /* Optional email preference. */
    }
    startTransition(() => router.push("/dashboard"));
  }
  return (
    <>
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.16em] text-brand uppercase">
          Your workspace awaits
        </p>
        <h1 className="text-3xl leading-tight font-semibold tracking-tight text-brand-ink sm:text-4xl">
          Welcome back<span className="text-brand">.</span>
        </h1>
        <p className="text-sm text-ink-muted">Good to see you. Let’s pick up where you left off.</p>
      </header>
      <form
        action={frontendPreview ? undefined : login}
        onSubmit={frontendPreview ? submitPreview : undefined}
      >
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="sign-in-email">Work email</FieldLabel>
            <InputGroup className="h-11">
              <InputGroupAddon>
                <Mail aria-hidden />
              </InputGroupAddon>
              <InputGroupInput
                id="sign-in-email"
                name="email"
                type="email"
                placeholder="you@company.com"
                required
                autoComplete="username"
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </InputGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor="sign-in-password">Password</FieldLabel>
            <PasswordInput
              id="sign-in-password"
              name="password"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              maxLength={128}
            />
          </Field>
          {error}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Field orientation="horizontal" className="w-auto">
              <Checkbox
                id="remember-email"
                checked={rememberEmail}
                onCheckedChange={(checked) => setRememberEmail(checked === true)}
              />
              <FieldLabel htmlFor="remember-email">Remember my email</FieldLabel>
            </Field>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-brand hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Button variant="brand" size="xl" type="submit" disabled={pending} className="w-full">
            {pending ? <LoaderCircle data-icon="inline-start" className="animate-spin" /> : null}
            {pending ? "Opening workspace…" : "Sign in to workspace"}
            <ArrowRight data-icon="inline-end" />
          </Button>
        </FieldGroup>
      </form>
      <p className="text-center text-sm text-ink-muted">
        New to Lensistry?{" "}
        <Link href="/sign-up" className="font-semibold text-brand hover:underline">
          Create an account
        </Link>
      </p>
      {frontendPreview && (
        <p className="rounded-xl bg-brand-tint px-4 py-3 text-xs leading-relaxed text-ink-muted">
          <strong className="font-semibold text-brand-ink">You’re in preview mode.</strong> Use any
          valid email and a password to explore. No real account is required or created.
        </p>
      )}
    </>
  );
}
