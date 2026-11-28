"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function ProductDetailsBackLink({
  publicView,
  fromImageSearch,
}: {
  publicView: boolean;
  fromImageSearch: boolean;
}) {
  const router = useRouter();

  return (
    <Link
      href={fromImageSearch ? "/search?mode=image" : publicView ? "/search" : "/products"}
      onNavigate={(event) => {
        if (fromImageSearch && window.history.length > 1) {
          event.preventDefault();
          router.back();
        }
      }}
      className="flex w-fit items-center gap-2 text-sm text-brand hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <ArrowLeft className="size-4" aria-hidden />
      {fromImageSearch ? "Back to search results" : "Back to products"}
    </Link>
  );
}
