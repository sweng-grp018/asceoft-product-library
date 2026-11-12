import Link from "next/link";
import { login } from "@/modules/auth/features/sign-in/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoveLeft, Box, Sparkles } from "lucide-react";
import Image from "next/image";

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="grid min-h-svh lg:grid-cols-[42%_58%]">
      {/* LEFT */}
      <section className="flex min-h-[600px] flex-col bg-[#2e2c9c] px-5 py-8 text-[#1C352A] sm:px-8 md:px-12 lg:min-h-svh lg:px-10 xl:px-16">
        <Link href="/search" className="flex items-center gap-4">
          <div className="size-10 flex items-center justify-center rounded-xl bg-[#232254] text-white">
            <Box size={22} />
          </div>

          <div>
            <p className="text-lg font-bold text-white sm:text-xl">Lensistry</p>
            <p className="text-xs text-white sm:text-sm">Product Library</p>
          </div>
        </Link>

        <div className="my-auto py-16">
          <p className="mb-6 text-[11px] font-medium text-white sm:text-xs">
            YOUR TEAM'S PRODUCT KNOWLEDGE
          </p>

          <h1 className="max-w-lg text-4xl text-white font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Every product.
            <br />
            One shared library.
          </h1>
          <p className="mt-5 max-w-xs text-white text-sm leading-relaxed sm:text-base">
            Keep your catalog organized.
            <br />
            Help your team find and recognize
            <br />
            the right product.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Image
              src="/images/colorfulChips.png"
              alt="Colorful Chips"
              width={2000}
              height={1000}
              className="h-auto w-full shrink-0 max-w-[360px] object-contain"
            />
          </div>
        </div>

        <div className="text-sm leading-relaxed text-white sm:text-base">
          A product catalog
          <br />
          Find with confidence
        </div>
      </section>

      {/* RIGHT */}
      <section className="flex min-h-[650px] items-center justify-center bg-white px-6 py-12 md:px-12 lg:min-h-svh">
        <div className="w-full max-w-md">
          <Link
            href="/signup"
            className="mb-12 flex items-center gap-2 text-xs text-[#232254] hover:underline sm:text-sm"
          >
            <MoveLeft size={18} />
            No account? Sign up here.
          </Link>

          <div className="mb-7">
            <h2 className="text-5xl font-bold text-[#232254]">Welcome back.</h2>
            <p className="mt-3 text-sm text-[#788b7d] sm:text-base">
              Sign in to your account to continue.
            </p>
          </div>

          <form action={login} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2 text-xs font-medium text-[#1c352a] sm:text-sm">
              Work Email
              <Input
                name="email"
                type="email"
                placeholder="you@company.com"
                required
                autoComplete="username"
                className="h-12 text-sm sm:h-12"
              />
            </label>

            <label className="flex flex-col gap-2 text-xs font-medium text-[#1c352a] sm:text-sm">
              Password
              <Input
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="h-12 text-sm sm:h-12"
              />
            </label>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                Invalid email or password.
              </p>
            )}

            <div className="flex items-center justify-between gap-2 text-[10px] sm:text-xs">
              <label className="flex items-center gap-2 text-[#788b7d]">
                <input type="checkbox" className="accent-[#176b4b]" />
                Remember this device
              </label>

              <span className="font-semibold text-[#4542bd]">Forgot password?</span>
            </div>

            <Button
              type="submit"
              className="h-12 w-full bg-[#4542bd] text-sm text-white hover:bg-[#12583e] sm:h-12"
            >
              Sign in to workspace
            </Button>
          </form>

          <div className="mt-5 flex gap-3 rounded-xl bg-[#edf3ff] p-4 text-[#315e9b] sm:p-5">
            <Sparkles size={18} className="mt-0.5 shrink-0" />

            <div>
              <p className="text-xs font-semibold sm:text-sm">Need access?</p>
              <p className="mt-1 text-[10px] leading-relaxed sm:text-xs">
                Ask your company administrator for a staff account. You can explore products without
                signing in.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
