"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { PasswordInput } from "@/modules/auth/components/password-input";
import { previewProfile } from "@/modules/auth/features/frontend-preview/preview-profile";
import { frontendPreview } from "@/lib/frontend-preview";

const signUpSchema = z
  .object({
    name: z.string().trim().min(2, { error: "Enter your full name." }).max(100),
    company: z.string().trim().min(1, { error: "Enter your company or team name." }).max(100),
    email: z.email({ error: "Enter a valid work email." }),
    password: z.string().min(12, { error: "Use at least 12 characters." }).max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    error: "Your passwords don’t match.",
  });

export function SignUpForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [pending, startTransition] = useTransition();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = signUpSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!result.success) {
      const fieldErrors = z.flattenError(result.error).fieldErrors;
      setErrors(fieldErrors);
      event.currentTarget
        .querySelector<HTMLInputElement>(`[name="${Object.keys(fieldErrors)[0]}"]`)
        ?.focus();
      return;
    }
    if (!frontendPreview) return;
    const { name, email, company } = result.data;
    previewProfile.setValue({ name, email, company });
    setErrors({});
    startTransition(() => router.push("/dashboard"));
  }
  return (
    <>
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.16em] text-brand uppercase">
          Make room for better work
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
          Start your library<span className="text-brand">.</span>
        </h1>
        <p className="text-sm text-ink-muted">
          One place for your products. A clearer view for your team.
        </p>
      </header>
      <form onSubmit={submit} noValidate>
        <FieldGroup className="gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                {
                  name: "name",
                  label: "Full name",
                  placeholder: "Alex Rivera",
                  autoComplete: "name",
                },
                {
                  name: "company",
                  label: "Company / team",
                  placeholder: "Your company",
                  autoComplete: "organization",
                },
              ] as const
            ).map((field) => (
              <Field key={field.name} data-invalid={!!errors[field.name]}>
                <FieldLabel htmlFor={`sign-up-${field.name}`}>{field.label}</FieldLabel>
                <Input
                  className="h-11"
                  id={`sign-up-${field.name}`}
                  name={field.name}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  required
                  maxLength={100}
                  aria-invalid={!!errors[field.name]}
                  aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
                />
                <FieldError id={`${field.name}-error`}>{errors[field.name]?.[0]}</FieldError>
              </Field>
            ))}
          </div>
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="sign-up-email">Work email</FieldLabel>
            <Input
              className="h-11"
              id="sign-up-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              required
              maxLength={254}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            <FieldError id="email-error">{errors.email?.[0]}</FieldError>
          </Field>
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="sign-up-password">Password</FieldLabel>
            <PasswordInput
              id="sign-up-password"
              name="password"
              placeholder="At least 12 characters"
              autoComplete="new-password"
              required
              maxLength={128}
              aria-invalid={!!errors.password}
              aria-describedby="password-hint password-error"
            />
            <p id="password-hint" className="flex items-center gap-1 text-[11px] text-ink-muted">
              <Check className="size-3" aria-hidden />
              12 or more characters keeps it stronger.
            </p>
            <FieldError id="password-error">{errors.password?.[0]}</FieldError>
          </Field>
          <Field data-invalid={!!errors.confirmPassword}>
            <FieldLabel htmlFor="sign-up-confirm">Confirm password</FieldLabel>
            <PasswordInput
              id="sign-up-confirm"
              name="confirmPassword"
              placeholder="Enter your password again"
              autoComplete="new-password"
              required
              maxLength={128}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "confirm-error" : undefined}
            />
            <FieldError id="confirm-error">{errors.confirmPassword?.[0]}</FieldError>
          </Field>
          <Button
            type="submit"
            variant="brand"
            size="xl"
            disabled={pending || !frontendPreview}
            className="mt-1 w-full"
          >
            {pending ? <LoaderCircle data-icon="inline-start" className="animate-spin" /> : null}
            {pending ? "Preparing your workspace…" : "Create preview account"}
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
        {frontendPreview
          ? "Frontend preview only. Your profile lasts until you reload; passwords are never saved or sent."
          : "Staff accounts are created by your administrator. Contact them to request access."}
      </p>
    </>
  );
}
