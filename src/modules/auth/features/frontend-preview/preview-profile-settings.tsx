"use client";
import { useState, type FormEvent } from "react";
import { Save, Check, ShieldCheck, FlaskConical } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { previewProfile } from "./preview-profile";

export function PreviewProfileSettings() {
  const profile = previewProfile.useValue();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name")).trim();
    const company = String(data.get("company")).trim();
    if (!name || !company) {
      setError("Enter your name and company.");
      setSaved(false);
      return;
    }
    previewProfile.setValue({ name, company, email: String(data.get("email")).trim() });
    setError("");
    setSaved(true);
  }
  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <PageHeading
        eyebrow="Make yourself at home"
        title="Settings & profile"
        description="A few details to make this preview feel more like your workspace."
      />
      <div className="grid items-start gap-6 md:grid-cols-[250px_1fr]">
        <Card className="border-line">
          <CardHeader className="items-center text-center">
            <div className="mx-auto mb-3 flex size-20 items-center justify-center rounded-full bg-brand-tint text-2xl font-semibold text-brand">
              {profile.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <CardTitle>{profile.name}</CardTitle>
            <CardDescription className="break-all">{profile.email}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Badge variant="secondary">
              <FlaskConical data-icon="inline-start" />
              Preview profile
            </Badge>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-5">
          <Card className="border-line">
            <CardHeader>
              <CardTitle>Personal details</CardTitle>
              <CardDescription>Updates appear in your sidebar and dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={save} onChange={() => setSaved(false)}>
                <FieldGroup className="gap-5">
                  {(
                    [
                      { key: "name", label: "Full name", type: "text", autoComplete: "name" },
                      { key: "email", label: "Work email", type: "email", autoComplete: "email" },
                      {
                        key: "company",
                        label: "Company / team",
                        type: "text",
                        autoComplete: "organization",
                      },
                    ] as const
                  ).map(({ key, label, type, autoComplete }) => (
                    <Field key={key}>
                      <FieldLabel htmlFor={`profile-${key}`}>{label}</FieldLabel>
                      <Input
                        className="h-11"
                        id={`profile-${key}`}
                        name={key}
                        type={type}
                        autoComplete={autoComplete}
                        required
                        maxLength={key === "email" ? 254 : 100}
                        defaultValue={profile[key]}
                      />
                    </Field>
                  ))}
                  <FieldError>{error}</FieldError>
                  <div className="flex flex-wrap items-center gap-4">
                    <Button variant="brand" size="xl" type="submit">
                      <Save data-icon="inline-start" />
                      Save preview profile
                    </Button>
                    {saved && (
                      <span
                        role="status"
                        className="flex items-center gap-1.5 text-xs text-status-ready-fg"
                      >
                        <Check className="size-4" aria-hidden />
                        Saved for this preview
                      </span>
                    )}
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
          <Card className="border-line">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-brand" aria-hidden />
                Your preview, explained
              </CardTitle>
              <CardDescription>
                Profile edits last while you navigate and reset on reload. No password, real
                account, or access permissions are changed.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
