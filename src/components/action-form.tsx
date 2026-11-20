"use client";
import { useActionState, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import type { ActionResult } from "@/lib/action-result";

export function ActionForm({
  action,
  children,
  submitLabel,
  variant = "brand",
}: {
  action: (data: FormData) => Promise<ActionResult>;
  children?: ReactNode;
  submitLabel: string;
  variant?: "brand" | "outline" | "danger";
}) {
  const [result, submit, pending] = useActionState<ActionResult, FormData>(
    async (_previous, data) => action(data),
    {},
  );
  return (
    <form action={submit}>
      <fieldset disabled={pending} className="flex min-w-0 flex-col gap-4">
        {children}
        <FieldError>{result.error}</FieldError>
        {result.message && (
          <p role="status" className="text-sm text-status-ready-fg">
            {result.message}
          </p>
        )}
        <Button type="submit" variant={variant} size="xl" disabled={pending} className="w-fit">
          {pending && <LoaderCircle data-icon="inline-start" className="animate-spin" />}
          {pending ? "Please wait…" : submitLabel}
        </Button>
      </fieldset>
    </form>
  );
}
