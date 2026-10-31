import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/server/session";
import { createStaffUser } from "@/modules/auth/features/manage-users/actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function Users() {
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
        <form action={createStaffUser} className="flex flex-col gap-4">
          {(["name", "email", "password"] as const).map((field) => (
            <label className="flex flex-col gap-1.5 text-sm capitalize" key={field}>
              {field}
              <Input
                name={field}
                type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                minLength={field === "password" ? 12 : 1}
                required
              />
            </label>
          ))}
          <label className="flex flex-col gap-1.5 text-sm">
            Role
            <select name="role" className="h-9 rounded-lg border border-input bg-background px-2">
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </label>
          <Button type="submit">Create user</Button>
        </form>
      </CardContent>
    </Card>
  );
}
