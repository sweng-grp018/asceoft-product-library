import Link from "next/link";
import { login } from "@/modules/auth/features/sign-in/actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto flex min-h-[80svh] w-full max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sign in to Lensistry</CardTitle>
          <CardDescription>Use your administrator or staff account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              Email
              <Input name="email" type="email" required autoComplete="username" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              Password
              <Input name="password" type="password" required autoComplete="current-password" />
            </label>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                Invalid email or password.
              </p>
            )}
            <Button type="submit">Sign in</Button>
          </form>
          <Link href="/search" className="mt-4 block text-sm text-muted-foreground underline">
            Browse the public catalog
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
