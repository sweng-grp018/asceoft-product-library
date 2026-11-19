import { Skeleton } from "@/components/ui/skeleton";

export function PageLoading() {
  return (
    <div role="status" aria-label="Loading page" className="flex flex-col gap-6">
      <span className="sr-only">Loading page…</span>
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-72 max-w-full" />
      <div className="grid gap-5 md:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}
