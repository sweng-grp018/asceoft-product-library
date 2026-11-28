import type { Metadata } from "next";
import type { ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowseSearchSessionProvider } from "@/modules/catalog/features/public-search/browse-search-session";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Lensistry | Product Library",
    template: "%s | Lensistry",
  },
  description:
    "A shared grocery product library for stores in the Philippines. Find products, save photos, and keep product details in one place.",
  applicationName: "Lensistry",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="h-full font-sans antialiased">
      <body className="flex min-h-svh flex-col bg-background font-sans text-foreground">
        <TooltipProvider>
          <BrowseSearchSessionProvider>{children}</BrowseSearchSessionProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
