import type { Metadata } from "next";
import { frontendPreview } from "@/lib/frontend-preview";
import { auth } from "@/modules/auth/server/session";
import { PreviewProfileSettings } from "@/modules/auth/features/frontend-preview/preview-profile-settings";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
export const metadata: Metadata = { title: "Settings & profile" };
export default async function Profile() {
  if (frontendPreview) return <PreviewProfileSettings />;
  const session = await auth();
  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Account profile</CardTitle>
        <CardDescription>Contact your administrator to update account details.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p>{session?.user.email}</p>
        <p className="text-sm text-muted-foreground">Role: {session?.user.role}</p>
      </CardContent>
    </Card>
  );
}
