"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold text-brand-ink">We could not load this page.</h1>
      <p className="text-sm text-ink-muted">
        Please try again. If it keeps happening, contact your store manager.
      </p>
      <Button variant="brand" onClick={reset} className="w-fit">
        Try again
      </Button>
    </main>
  );
}
