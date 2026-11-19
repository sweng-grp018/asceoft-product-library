import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, Library, ScanLine, Search } from "lucide-react";
import { Brand } from "@/components/layout/brand";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="auth-shell grid h-dvh overflow-hidden bg-background lg:grid-cols-[44%_56%]">
      <aside className="relative hidden min-h-0 flex-col overflow-hidden bg-brand-strong p-9 text-white lg:flex xl:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-48 -right-40 size-[38rem] rounded-full border border-white/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -bottom-64 size-[42rem] rounded-full border border-white/10"
        />
        <div className="relative">
          <Brand href="/search" inverse />
        </div>
        <div className="relative my-auto flex min-h-0 flex-col gap-5 py-8">
          <span className="text-[10px] font-semibold tracking-[0.22em] text-white/65">
            YOUR STORE’S EVERYDAY ESSENTIALS.
          </span>
          <h2 className="max-w-md text-[clamp(2rem,3.8vw,4rem)] leading-[1.08] font-semibold tracking-tight">
            Every grocery product.
            <br />
            One shared list.
          </h2>
          <p className="max-w-xs text-sm leading-relaxed text-white/75">
            Keep rice, canned goods, drinks, and household essentials easy to find across your
            store.
          </p>
          <div className="auth-art relative my-3 flex items-center justify-center">
            <div
              aria-hidden
              className="absolute size-52 rounded-full bg-white/5 ring-1 ring-white/10 xl:size-64"
            />
            <Image
              src="/images/colorfulChips.png"
              alt="A colorful collection of product packaging"
              width={600}
              height={360}
              priority
              className="relative max-h-[26vh] w-full max-w-sm object-contain drop-shadow-2xl"
            />
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] text-white/85">
            <span className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5">
              <Library className="size-3.5" aria-hidden />
              Organize
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5">
              <Search className="size-3.5" aria-hidden />
              Discover
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5">
              <ScanLine className="size-3.5" aria-hidden />
              Recognize
            </span>
          </div>
        </div>
        <p className="relative text-xs text-white/55">See it. Search it. Know it.</p>
      </aside>
      <section className="auth-panel flex min-h-0 flex-col overflow-y-auto overscroll-contain px-6 py-6 sm:px-10 sm:py-8 lg:px-12">
        <div className="auth-mobile-header mb-6 flex items-center justify-between lg:hidden">
          <Brand href="/search" />
          <Link
            href="/search"
            aria-label="Browse grocery products"
            className="inline-flex items-center gap-2 rounded-lg p-2 text-xs font-medium text-brand"
          >
            <Library className="size-4" aria-hidden />
            Browse products
          </Link>
        </div>
        <div className="auth-content mx-auto my-auto flex w-full max-w-[400px] flex-col gap-6 py-2">
          <Link
            href="/search"
            className="hidden w-fit items-center gap-2 text-xs font-medium text-ink-muted transition-colors hover:text-brand lg:inline-flex"
          >
            <Library className="size-4" aria-hidden />
            Browse grocery products
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
          {children}
        </div>
        <p className="mt-5 shrink-0 text-center text-[11px] text-ink-muted">
          Lensistry · Your grocery products, all in one place.
        </p>
      </section>
    </main>
  );
}
