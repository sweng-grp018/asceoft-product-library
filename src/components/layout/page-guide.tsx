"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { accountPages, appPurpose, visibleStorePages } from "./navigation";

export function PageGuide({ role, onVisit }: { role: string; onVisit: () => void }) {
  const [open, setOpen] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const pages = [...visibleStorePages(role), ...accountPages];
  async function copyTable() {
    const markdown = [
      appPurpose,
      "",
      "| Page | What it does | Example |",
      "| --- | --- | --- |",
      ...pages.map((page) => `| ${page.label} | ${page.purpose} | ${page.example} |`),
      "| Sign out | End your sign-in on this device. | I sign out before another person uses the store computer. |",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(markdown);
      setCopyMessage("Table copied.");
    } catch {
      setCopyMessage("Could not copy. You can select the table text instead.");
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        setCopyMessage("");
      }}
    >
      <DialogTrigger asChild>
        <SidebarMenuButton>
          <BookOpen aria-hidden />
          <span>Page guide</span>
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader className="pr-7">
          <DialogTitle>Your grocery library</DialogTitle>
          <DialogDescription>{appPurpose}</DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Use this guide to review each page. The table follows the pages available to your account.
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead>What it does</TableHead>
              <TableHead>Example</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => (
              <TableRow key={page.href}>
                <TableCell className="align-top">
                  <Link
                    className="font-medium text-brand hover:underline"
                    href={page.href}
                    onClick={() => {
                      setOpen(false);
                      onVisit();
                    }}
                  >
                    {page.label}
                  </Link>
                </TableCell>
                <TableCell className="min-w-48 align-top whitespace-normal">
                  {page.purpose}
                </TableCell>
                <TableCell className="min-w-64 align-top whitespace-normal">
                  {page.example}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell className="align-top font-medium">Sign out</TableCell>
              <TableCell className="align-top whitespace-normal">
                End your sign-in on this device.
              </TableCell>
              <TableCell className="align-top whitespace-normal">
                I sign out before another person uses the store computer.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={copyTable}>
            <Copy data-icon="inline-start" />
            Copy as Markdown
          </Button>
          <p role="status" className="text-xs text-muted-foreground">
            {copyMessage}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
