"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ChevronDown, ScanLine, Check } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { catalogPreview } from "@/modules/catalog/features/list-products/catalog-preview-store";

const sessions = [
  {
    id: "sample-01",
    title: "Showroom shelf review",
    date: "19 Nov 2026 · 10:42 AM",
    detections: [
      { id: "match-1", sku: "SKU-90214", score: "0.89" },
      { id: "match-2", sku: "SKU-88412", score: "0.84" },
      { id: "match-3", sku: "", score: "0.61" },
    ],
  },
  {
    id: "sample-02",
    title: "New reference check",
    date: "18 Nov 2026 · 3:15 PM",
    detections: [{ id: "match-4", sku: "SKU-65103", score: "0.81" }],
  },
];

export function PreviewHistory() {
  const products = catalogPreview.useValue();
  const [corrections, setCorrections] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  function save(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const sku = String(new FormData(event.currentTarget).get("sku"));
    setCorrections((current) => ({ ...current, [id]: sku }));
    setMessage(`Preview correction saved: ${sku || "Unknown product"}.`);
  }
  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        eyebrow="A record of what you reviewed"
        title="Detection history"
        description="Explore sample sessions and try a manual SKU correction. All scores and matches are simulated."
        action={
          <Button asChild variant="brand" size="xl">
            <Link href="/detection">
              <ScanLine data-icon="inline-start" />
              New review
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Sample sessions", value: 2 },
          { title: "Objects for review", value: 4 },
          { title: "Local corrections", value: Object.keys(corrections).length },
        ].map((stat) => (
          <Card key={stat.title} className="border-line">
            <CardHeader>
              <CardDescription>{stat.title}</CardDescription>
              <CardTitle className="text-2xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      {message && (
        <p role="status" className="flex items-center gap-2 text-sm text-status-ready-fg">
          <Check className="size-4" aria-hidden />
          {message}
        </p>
      )}
      {sessions.map((session, index) => (
        <details
          key={session.id}
          open={index === 0}
          className="group overflow-hidden rounded-xl border border-line bg-background"
        >
          <summary className="flex cursor-pointer list-none flex-wrap items-center gap-4 p-5 focus-visible:outline-2 focus-visible:outline-brand [&::-webkit-details-marker]:hidden">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-tint text-brand">
              <ScanLine className="size-5" aria-hidden />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="font-semibold text-brand-ink">{session.title}</span>
              <span className="text-xs text-ink-muted">{session.date} · Sample session</span>
            </span>
            <Badge variant="secondary">{session.detections.length} detections</Badge>
            <ChevronDown
              className="size-4 text-ink-muted transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <div className="grid gap-4 border-t border-line p-5">
            {session.detections.map((detection, i) => (
              <Card key={detection.id} className="border-line shadow-none">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-3">
                    <CardTitle>Object {i + 1}</CardTitle>
                    <Badge variant="outline">
                      {(corrections[detection.id] ?? detection.sku) ? "Sample match" : "Unknown"}
                    </Badge>
                    {detection.id in corrections && (
                      <Badge variant="secondary">Corrected locally</Badge>
                    )}
                  </div>
                  <CardDescription>
                    Simulated cosine similarity: {detection.score}. This is not a probability.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(event) => save(event, detection.id)}>
                    <FieldGroup className="flex-row flex-wrap items-end gap-3">
                      <Field className="min-w-0 flex-1">
                        <FieldLabel htmlFor={detection.id}>Product assignment</FieldLabel>
                        <NativeSelect
                          className="w-full"
                          id={detection.id}
                          name="sku"
                          defaultValue={corrections[detection.id] ?? detection.sku}
                        >
                          <NativeSelectOption value="">Unknown / no match</NativeSelectOption>
                          {products.map((p) => (
                            <NativeSelectOption key={p.id} value={p.sku}>
                              {p.sku} — {p.name}
                            </NativeSelectOption>
                          ))}
                        </NativeSelect>
                      </Field>
                      <Button type="submit" variant="outline">
                        Save correction
                      </Button>
                    </FieldGroup>
                  </form>
                </CardContent>
              </Card>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
