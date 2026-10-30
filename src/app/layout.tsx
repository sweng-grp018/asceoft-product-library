import type { Metadata } from "next";
import type { ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Product Library",
    template: "%s | Product Library",
  },
  description:
    "An AI-powered product library for intelligent product search, image recognition, product detection, and catalog management.",
  applicationName: "Product Library",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="h-full font-sans antialiased">
      <body className="flex min-h-svh flex-col bg-background font-sans text-foreground">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
