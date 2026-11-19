import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/server/session";
import { createStaffUser } from "@/modules/auth/features/manage-users/actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { frontendPreview } from "@/lib/frontend-preview";
import { PreviewTeam } from "@/modules/auth/features/frontend-preview/preview-team";

export default async function Users() {
  if (frontendPreview) return <PreviewTeam />;
  if ((await auth())?.user.role !== "ADMIN") redirect("/dashboard");
  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Create staff account</CardTitle>
        <CardDescription>
          Administrative provisioning. Accounts cannot register themselves.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createStaffUser}>
          <FieldGroup className="gap-4">
            {(["name", "email", "password"] as const).map((field) => (
              <Field className="gap-1.5" key={field}>
                <FieldLabel htmlFor={`staff-${field}`} className="capitalize">
                  {field}
                </FieldLabel>
                <Input
                  id={`staff-${field}`}
                  name={field}
                  type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                  minLength={field === "password" ? 12 : 1}
                  required
                />
              </Field>
            ))}
            <Field className="gap-1.5">
              <FieldLabel htmlFor="staff-role">Role</FieldLabel>
              <NativeSelect id="staff-role" name="role" defaultValue="STAFF" className="w-full">
                <NativeSelectOption value="STAFF">Staff</NativeSelectOption>
                <NativeSelectOption value="ADMIN">Administrator</NativeSelectOption>
              </NativeSelect>
            </Field>
            <Button type="submit">Create user</Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
