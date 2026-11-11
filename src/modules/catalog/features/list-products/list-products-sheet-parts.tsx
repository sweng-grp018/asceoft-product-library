"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useRef } from "react";
import { SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { cn } from "cn";

/**
 * Chrome shared by the create and edit drawers: one scroll region above a
 * sticky footer, so the two flows cannot drift apart visually.
 */
export const sheetFieldClass =
  "h-11 rounded-lg border-line bg-card px-3.5 text-sm text-brand-ink caret-brand shadow-none placeholder:text-ink-placeholder focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15";

export const sheetTextareaClass =
  "min-h-[92px] resize-none rounded-lg border-line bg-card px-3.5 py-3 text-sm text-brand-ink caret-brand shadow-none placeholder:text-ink-placeholder focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/15";

export const sheetLeadingIconClass =
  "pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-muted";

export const sheetSectionHeadingClass =
  "flex items-center gap-2 text-[13px] font-semibold tracking-[0.06em] text-brand-ink uppercase";

/** Id the `Field` component gives its error message; pair it with `aria-describedby`. */
export function sheetFieldErrorId(htmlFor: string) {
  return `${htmlFor}-error`;
}

export function SheetPanel({
  onSubmit,
  noValidate,
  children,
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  /** Skip native constraint bubbles so the drawer can render its own inline errors. */
  noValidate?: boolean;
  children: ReactNode;
}) {
  return (
    <form onSubmit={onSubmit} noValidate={noValidate} className="flex h-full flex-col">
      {children}
    </form>
  );
}

export function SheetPanelHeader({
  eyebrow,
  badge,
  title,
  description,
  children,
}: {
  eyebrow: ReactNode;
  badge?: ReactNode;
  title: string;
  description: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-line-subtle bg-card px-6 py-5 pr-16 sm:px-8">
      <div className="flex flex-wrap items-center gap-2">
        {eyebrow}
        {badge}
      </div>

      <div className="flex flex-col gap-1">
        <SheetTitle className="text-xl leading-tight font-semibold tracking-tight text-brand-ink">
          {title}
        </SheetTitle>
        <SheetDescription asChild>
          <div className="text-sm text-ink-muted">{description}</div>
        </SheetDescription>
      </div>

      {children}
    </div>
  );
}

export function SheetPanelBody({
  children,
  resetKey,
}: {
  children: ReactNode;
  /** Change this value (for example the active step) to scroll the body back to the top. */
  resetKey?: string | number;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [resetKey]);

  return (
    <div ref={bodyRef} className="flex-1 overflow-y-auto bg-page px-6 py-6 sm:px-8">
      <div className="mx-auto flex max-w-xl flex-col gap-8">{children}</div>
    </div>
  );
}

export function SheetPanelFooter({ note, children }: { note: string; children: ReactNode }) {
  return (
    <div className="mt-auto flex items-center justify-between gap-3 border-t border-line-subtle bg-card px-6 py-4 sm:px-8">
      <p className="hidden items-center gap-2 text-xs text-ink-muted sm:flex">
        <span aria-hidden className="size-1.5 rounded-full bg-brand" />
        {note}
      </p>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

export function SheetEyebrow({
  children,
  tone = "brand",
}: {
  children: ReactNode;
  tone?: "brand" | "muted";
}) {
  return (
    <span
      className={cn(
        "w-fit rounded px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.08em] uppercase",
        tone === "brand" ? "bg-brand-tint text-brand" : "bg-page text-ink-muted ring-1 ring-line",
      )}
    >
      {children}
    </span>
  );
}

/**
 * Label + control pair. `hint` renders as a counter on the right, `action` as a
 * button beside the label, and `error` below the control.
 */
export function Field({
  label,
  htmlFor,
  hint,
  action,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  action?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={htmlFor}
          className="text-[11px] font-semibold tracking-[0.06em] text-ink-muted uppercase"
        >
          {label}
          {required ? (
            <span aria-hidden className="ml-0.5 text-destructive">
              *
            </span>
          ) : null}
        </label>
        <div className="flex items-center gap-2">
          {hint ? <span className="text-[11px] text-ink-muted tabular-nums">{hint}</span> : null}
          {action}
        </div>
      </div>
      {children}
      {error ? (
        <p id={sheetFieldErrorId(htmlFor)} className="text-[11px] font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
