import type { Account } from "@/modules/auth/server/viewer";
import { PageHeading } from "@/components/layout/page-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ActionForm } from "@/components/action-form";
import { updateAccount } from "@/modules/auth/features/manage-users/actions";
export function AccountDetails({ account }: { account: Account }) {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeading title="Profile" description="Keep your name and email address up to date." />
      <Card className="border-line">
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
          <CardDescription>
            {account.role === "ADMIN"
              ? "Store manager"
              : account.role === "STAFF"
                ? "Staff account"
                : "Grocery browsing account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActionForm action={updateAccount} submitLabel="Save changes">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="account-name">Full name</FieldLabel>
                <Input
                  id="account-name"
                  name="name"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={100}
                  defaultValue={account.name}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="account-email">Email address</FieldLabel>
                <Input
                  id="account-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  defaultValue={account.email}
                />
              </Field>
            </FieldGroup>
          </ActionForm>
        </CardContent>
      </Card>
    </div>
  );
}
