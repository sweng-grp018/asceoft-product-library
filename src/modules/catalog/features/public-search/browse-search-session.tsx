"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const BrowseSearchSessionContext = createContext({ visit: 0, resetFilters: false });

function BrowseSearchNavigation({
  onLeave,
  resetFilters,
  onResetFilters,
}: {
  onLeave: () => void;
  resetFilters: boolean;
  onResetFilters: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const wasBrowsing = useRef(false);

  useLayoutEffect(() => {
    const browsing = pathname === "/search" || pathname.startsWith("/search/");
    if (wasBrowsing.current && !browsing) onLeave();
    wasBrowsing.current = browsing;
    if (pathname !== "/search" || !resetFilters) return;
    if (searchParams.get("q") || Number(searchParams.get("page")) > 1) {
      router.replace("/search");
    } else {
      onResetFilters();
    }
  }, [pathname, searchParams, router, onLeave, resetFilters, onResetFilters]);

  return null;
}

export function BrowseSearchSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState({ visit: 0, resetFilters: false });
  const endVisit = useCallback(
    () => setSession((current) => ({ visit: current.visit + 1, resetFilters: true })),
    [],
  );
  const resetFilters = useCallback(
    () => setSession((current) => ({ ...current, resetFilters: false })),
    [],
  );

  return (
    <BrowseSearchSessionContext value={session}>
      <Suspense fallback={null}>
        <BrowseSearchNavigation
          onLeave={endVisit}
          resetFilters={session.resetFilters}
          onResetFilters={resetFilters}
        />
      </Suspense>
      {children}
    </BrowseSearchSessionContext>
  );
}
