"use client";
import { useState, type FormEvent } from "react";
import { Users, UserPlus, Trash2 } from "lucide-react";
import { z } from "zod";
import { createPreviewStore } from "@/lib/preview-store";
import { PageHeading } from "@/components/layout/page-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const memberSchema = z.object({
  name: z.string().trim().min(2, { error: "Enter the member’s full name." }).max(100),
  email: z.email({ error: "Enter a valid email address." }),
  role: z.enum(["STAFF", "ADMIN"]),
});
const membersPreview = createPreviewStore([
  { id: "member-1", name: "Alex Rivera", email: "alex@lensistry.demo", role: "ADMIN" },
  { id: "member-2", name: "Jamie Cruz", email: "jamie@lensistry.demo", role: "STAFF" },
  { id: "member-3", name: "Sam Reyes", email: "sam@lensistry.demo", role: "STAFF" },
]);

export function PreviewTeam() {
  const members = membersPreview.useValue();
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [message, setMessage] = useState("");
  function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = memberSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!result.success) {
      setErrors(z.flattenError(result.error).fieldErrors);
      return;
    }
    if (members.some((member) => member.email.toLowerCase() === result.data.email.toLowerCase())) {
      setErrors({ email: ["This email is already in your preview team."] });
      return;
    }
    membersPreview.setValue((current) => [...current, { id: crypto.randomUUID(), ...result.data }]);
    setErrors({});
    setMessage(`${result.data.name} added locally. No invitation was sent or account created.`);
    event.currentTarget.reset();
  }
  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        eyebrow="Good work happens together"
        title="Team members"
        description="Explore how your team will share the library. Preview roles do not grant real access."
      />
      <div className="grid items-start gap-6 xl:grid-cols-[1fr_340px]">
        <Card className="overflow-hidden border-line">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your team</CardTitle>
              <Badge variant="secondary">
                <Users data-icon="inline-start" />
                {members.length} members
              </Badge>
            </div>
            <CardDescription>Sample people in this workspace.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="pr-5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="py-4 pl-5">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-xs font-semibold text-brand">
                          {member.name
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="font-medium text-brand-ink">{member.name}</span>
                          <span className="text-xs text-ink-muted">{member.email}</span>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{member.role === "ADMIN" ? "Admin" : "Staff"}</Badge>
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <Button
                        variant="danger-ghost"
                        size="icon"
                        aria-label={`Remove ${member.name} from preview`}
                        onClick={() => {
                          membersPreview.setValue((current) =>
                            current.filter((person) => person.id !== member.id),
                          );
                          setMessage(`${member.name} removed from this preview.`);
                        }}
                      >
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!members.length && (
              <p className="p-8 text-center text-sm text-ink-muted">
                No preview members yet. Add someone to see them here.
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="border-line">
          <CardHeader>
            <CardTitle>Add a preview member</CardTitle>
            <CardDescription>Try the flow. No real accounts or invitations.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={addMember} noValidate>
              <FieldGroup className="gap-4">
                {(
                  [
                    { name: "name", label: "Full name", type: "text", placeholder: "Jamie Cruz" },
                    {
                      name: "email",
                      label: "Work email",
                      type: "email",
                      placeholder: "jamie@company.com",
                    },
                  ] as const
                ).map((field) => (
                  <Field key={field.name} data-invalid={!!errors[field.name]}>
                    <FieldLabel htmlFor={`member-${field.name}`}>{field.label}</FieldLabel>
                    <Input
                      className="h-11"
                      id={`member-${field.name}`}
                      name={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      required
                      maxLength={field.name === "name" ? 100 : 254}
                      aria-invalid={!!errors[field.name]}
                      aria-describedby={
                        errors[field.name] ? `member-${field.name}-error` : undefined
                      }
                    />
                    <FieldError id={`member-${field.name}-error`}>
                      {errors[field.name]?.[0]}
                    </FieldError>
                  </Field>
                ))}
                <Field>
                  <FieldLabel htmlFor="member-role">Preview role</FieldLabel>
                  <NativeSelect
                    className="w-full"
                    id="member-role"
                    name="role"
                    defaultValue="STAFF"
                  >
                    <NativeSelectOption value="STAFF">Staff</NativeSelectOption>
                    <NativeSelectOption value="ADMIN">Administrator</NativeSelectOption>
                  </NativeSelect>
                </Field>
                <Button variant="brand" size="xl" type="submit">
                  <UserPlus data-icon="inline-start" />
                  Add preview member
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
      {message && (
        <p role="status" className="text-sm text-status-ready-fg">
          {message}
        </p>
      )}
    </div>
  );
}
