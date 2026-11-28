"use client";

import type { ReactNode } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PhotoPreviewContent({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <DialogContent className="max-h-[90dvh] max-w-[calc(100vw_-_2rem)] sm:max-w-5xl motion-reduce:animate-none">
      <DialogHeader className="pr-8">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="relative h-[65dvh] overflow-hidden rounded-lg bg-background">{children}</div>
    </DialogContent>
  );
}
