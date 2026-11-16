import Link from "next/link";
import { Box, MoveLeft } from "lucide-react";
import { SignUpForm } from "@/modules/auth/features/sign-up/sign-up-form";

export default function SignUp() {
  return (
    <main className="grid min-h-svh bg-card lg:grid-cols-[42%_58%]">
      <section className="flex flex-col gap-10 bg-brand px-6 py-8 text-white sm:px-12 lg:min-h-svh lg:px-10 xl:px-16">
        <Link
          href="/search"
          className="flex w-fit items-center gap-4 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <Box aria-hidden className="size-12" strokeWidth={1.5} />
          <div className="border-l border-white/40 pl-4">
            <p className="text-2xl font-bold">Lensistry</p>
            <p className="text-sm text-white/80">Product Library</p>
          </div>
        </Link>
        <div className="my-auto flex flex-col gap-7 py-4 lg:py-12">
          <h2 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl xl:text-6xl">
            Every product.
            <br />
            One shared library.
          </h2>
          <p className="max-w-sm text-base leading-relaxed text-white/90 sm:text-lg">
            Keep your catalog organized.
            <br />
            Help your team find the right product.
          </p>
          <svg
            aria-hidden
            viewBox="0 0 440 300"
            fill="none"
            className="mt-8 hidden w-full max-w-md text-white/90 lg:block"
          >
            <ellipse cx="220" cy="268" rx="205" ry="24" fill="currentColor" opacity="0.12" />
            <g stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round">
              <path d="M48 88 142 70 193 89 100 110 48 88v160l52 23 93-23V89M100 110v161" />
              <path d="m119 133 54-12v58l-54 12z" fill="currentColor" fillOpacity="0.3" />
              <path d="m119 211 44-10m-44 25 29-7" opacity="0.5" />
              <path d="M304 85V54h40v31m-47-31V43h54l25 4v9l-32-2M299 85h51v28c21 10 32 26 32 49v83c0 12-10 19-22 19h-70c-12 0-22-7-22-19v-83c0-23 11-39 31-49z" />
              <rect
                x="285"
                y="166"
                width="80"
                height="49"
                rx="5"
                fill="currentColor"
                fillOpacity="0.3"
              />
              <path d="M296 233h57m-57 13h36" opacity="0.5" />
              <path d="M161 201v57c0 13 28 23 62 23s62-10 62-23v-57" />
              <ellipse cx="223" cy="201" rx="62" ry="20" fill="var(--brand)" />
              <path d="M161 220c0 12 28 22 62 22s62-10 62-22" />
              <rect
                x="195"
                y="247"
                width="55"
                height="20"
                rx="4"
                fill="currentColor"
                fillOpacity="0.3"
                stroke="none"
              />
            </g>
          </svg>
        </div>
      </section>
      <section className="flex flex-col px-6 py-8 sm:px-12 lg:min-h-svh lg:px-16">
        <Link
          href="/sign-in"
          className="flex w-fit items-center gap-2 rounded text-sm font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <MoveLeft aria-hidden className="size-4" />
          Back to sign in
        </Link>
        <div className="mx-auto my-auto w-full max-w-md py-16 lg:py-24">
          <h1 className="text-4xl font-bold tracking-tight text-brand-ink sm:text-5xl">
            Create your account.
          </h1>
          <p className="mt-4 text-base text-ink-muted">Sign up to get started with Lensistry.</p>
          <SignUpForm />
          <p className="mt-6 text-center text-sm text-brand-ink">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-semibold text-brand hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
