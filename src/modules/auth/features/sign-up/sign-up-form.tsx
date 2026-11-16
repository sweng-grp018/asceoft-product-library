"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

/** Static preview: credentials are never sent, logged or persisted. */
export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.currentTarget.reset();
    setShowPassword(false);
    setSubmitted(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
      onChange={() => setSubmitted(false)}
      className="mt-10 flex flex-col gap-6"
    >
      <label
        className="flex flex-col gap-2 text-sm font-semibold text-brand-ink"
        htmlFor="signup-email"
      >
        Email
        <Input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          className="h-12"
        />
      </label>
      <div className="flex flex-col gap-2">
        <label htmlFor="signup-password" className="text-sm font-semibold text-brand-ink">
          Password
        </label>
        <InputGroup className="h-12">
          <InputGroupInput
            id="signup-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create a password"
            minLength={12}
            required
            aria-describedby="signup-password-hint"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-sm"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <p id="signup-password-hint" className="text-xs text-ink-muted">
          Use at least 12 characters.
        </p>
      </div>
      <Button type="submit" variant="brand" size="xl" className="mt-3 h-12 w-full">
        Create account
      </Button>
      <p role="status" className="text-center text-sm text-ink-muted">
        {submitted ? "This is a preview. No account was created." : null}
      </p>
    </form>
  );
}
