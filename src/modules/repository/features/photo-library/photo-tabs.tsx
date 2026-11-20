"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PhotoTabs({
  active,
  children,
}: {
  active: "products" | "shelf";
  children: ReactNode;
}) {
  const router = useRouter();
  return (
    <Tabs
      value={active}
      activationMode="manual"
      className="gap-5"
      onValueChange={(tab) =>
        router.push(tab === "products" ? "/repository?tab=products" : "/repository", {
          scroll: false,
        })
      }
    >
      <TabsList aria-label="Photo library" className="h-10">
        <TabsTrigger value="shelf" className="px-3">
          Shelf photos
        </TabsTrigger>
        <TabsTrigger value="products" className="px-3">
          Product photos
        </TabsTrigger>
      </TabsList>
      <TabsContent value={active}>{children}</TabsContent>
    </Tabs>
  );
}
