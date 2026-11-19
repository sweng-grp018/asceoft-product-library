import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { currentAccount, type Account } from "@/modules/auth/server/viewer";
import { createStaffUser, resetStaffPassword } from "@/modules/auth/features/manage-users/actions";
import { PasswordInput } from "@/modules/auth/components/password-input";
import { PageHeading } from "@/components/layout/page-heading";
import { ActionForm } from "@/components/action-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
export default async function Staff() {
  if ((await currentAccount())?.role !== "ADMIN") redirect("/dashboard");
  const { users } = await api<{ users: Account[] }>("/auth/users");
  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Staff"
        description="Add people who help manage your store’s grocery products."
      />
      <div className="grid items-start gap-6 xl:grid-cols-[1fr_350px]">
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id} className="border-line">
              <CardHeader>
                <CardTitle>{user.name}</CardTitle>
                <CardDescription>
                  {user.email} · {user.role === "ADMIN" ? "Store manager" : "Staff"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <details>
                  <summary className="cursor-pointer text-sm font-medium text-brand">
                    Reset password
                  </summary>
                  <div className="pt-4">
                    <ActionForm
                      action={resetStaffPassword.bind(null, user.id)}
                      submitLabel="Save new password"
                      variant="outline"
                    >
                      <Field>
                        <FieldLabel htmlFor={`reset-${user.id}`}>New password</FieldLabel>
                        <PasswordInput
                          id={`reset-${user.id}`}
                          name="password"
                          autoComplete="new-password"
                          minLength={12}
                          maxLength={128}
                          required
                          placeholder="At least 12 characters"
                        />
                      </Field>
                    </ActionForm>
                  </div>
                </details>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-line">
          <CardHeader>
            <CardTitle>Add staff</CardTitle>
            <CardDescription>
              Create an account for a colleague. Use a unique password and share it securely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActionForm action={createStaffUser} submitLabel="Create staff account">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="staff-name">Full name</FieldLabel>
                  <Input
                    id="staff-name"
                    name="name"
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder="Jamie Cruz"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="staff-email">Email address</FieldLabel>
                  <Input
                    id="staff-email"
                    name="email"
                    type="email"
                    required
                    maxLength={254}
                    placeholder="jamie@example.com"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="staff-password">Password</FieldLabel>
                  <PasswordInput
                    id="staff-password"
                    name="password"
                    required
                    minLength={12}
                    maxLength={128}
                    autoComplete="new-password"
                    placeholder="At least 12 characters"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="staff-role">Access</FieldLabel>
                  <NativeSelect id="staff-role" name="role" className="w-full" defaultValue="STAFF">
                    <NativeSelectOption value="STAFF">Staff</NativeSelectOption>
                    <NativeSelectOption value="ADMIN">Store manager</NativeSelectOption>
                  </NativeSelect>
                </Field>
              </FieldGroup>
            </ActionForm>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
