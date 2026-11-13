"use client";

import { useMemo, useState } from "react";
import { ClipboardCheckIcon, RotateCcwIcon, ShieldAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusToast, type ToastMessage } from "@/components/ui/status-toast";
import { downloadFile } from "@/lib/download";
import { DetectAndSearchCapturePanel } from "./detect-and-search-capture-panel";
import { SAMPLE_DETECTIONS } from "./detect-and-search.data";
import { buildSessionExport } from "./detect-and-search.logic";
import { DetectAndSearchMap } from "./detect-and-search-map";
import { DetectAndSearchResults } from "./detect-and-search-results";
import type { CatalogOption, Detection } from "./detect-and-search.types";
import { useDetectAndSearch } from "./use-detect-and-search";

type DetectAndSearchProps = {
  /** Committing writes SKU assignments, so the catalog role gate applies. */
  canCommit: boolean;
  catalog: CatalogOption[];
  /** Fixture override; the screen ships with the sample session. */
  detections?: Detection[];
};

/**
 * AI detection and search screen.
 *
 * Static preview: no inference runs and no photo leaves the browser. The three
 * fixture detections exercise the real review flow — accept, override, commit,
 * reset, export — and every surface that shows a score says it is simulated.
 */
export function DetectAndSearch({
  canCommit,
  catalog,
  detections = SAMPLE_DETECTIONS,
}: DetectAndSearchProps) {
  const session = useDetectAndSearch(detections);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const detectionCount = detections.length;
  const commitBlockedReason = useMemo(() => {
    if (!canCommit) return "Only an admin can commit catalog assignments.";
    if (session.committedAt) return "This session is already committed.";
    if (!session.allResolved) return `Assign all ${detectionCount} detections first.`;
    return undefined;
  }, [canCommit, detectionCount, session.allResolved, session.committedAt]);

  async function handleFile(file: File) {
    const problem = await session.addPhoto(file);

    if (problem) {
      setToast({ message: problem, tone: "danger" });
      return;
    }

    setActiveId(null);
    setToast({
      message: `"${file.name}" staged on this device. Detections are fixture data, not model output.`,
      tone: "success",
    });
  }

  function handleMapSelect(id: string) {
    setActiveId(id);
    document
      .getElementById(`detection-${id}`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function handleReset() {
    session.resetSession();
    setActiveId(null);
    setToast({ message: "Session reset. The sample frame is shown again.", tone: "success" });
  }

  function handleAcceptAll() {
    const accepted = session.acceptAllConfident();
    if (!accepted) return;

    const remaining = detectionCount - session.assigned - accepted;
    setToast({
      message:
        remaining > 0
          ? `${accepted} confident match${accepted === 1 ? "" : "es"} accepted. ${remaining} still need${
              remaining === 1 ? "s" : ""
            } a manual check.`
          : "All confident matches accepted. Every detection is assigned.",
      tone: "success",
    });
  }

  function handleAssign(id: string, sku: string) {
    session.assignFromOperator(id, sku);
    setActiveId(id);

    const detection = detections.find((candidate) => candidate.id === id);
    setToast({
      message: `${sku} assigned to detection #${detection?.index ?? "?"}.`,
      tone: "success",
    });
  }

  function handleCommit() {
    if (!session.allResolved || !canCommit || session.committedAt) return;

    session.commitSession();
    setToast({
      message: `Session committed with ${session.assigned} SKU assignment${
        session.assigned === 1 ? "" : "s"
      }. Nothing was sent to the API.`,
      tone: "success",
    });
  }

  function handleExport() {
    const payload = buildSessionExport({
      capture: session.capture,
      frame: session.frame,
      detections,
      assignments: session.assignments,
    });
    const stamp = new Date().toISOString().slice(0, 19).replaceAll(":", "-");

    downloadFile(`lensistry-detection-${stamp}.json`, JSON.stringify(payload, null, 2));
    setToast({ message: "Session JSON downloaded.", tone: "success" });
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-notice-bg px-2.5 py-1 text-[10px] font-semibold tracking-[0.06em] text-notice-fg uppercase ring-1 ring-notice-dot/30">
              <span aria-hidden className="size-1.5 rounded-full bg-notice-dot" />
              Simulated session
            </span>
            <span className="text-xs text-ink-muted">No inference has run on this data</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-brand-ink">
            AI image detection &amp; search
          </h1>
          <p className="max-w-2xl text-sm text-ink-muted">
            Stage a shelf photo, review the candidate matches, and confirm the SKUs before anything
            is recorded. Uploads stay on this device.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" size="xl" onClick={handleReset}>
            <RotateCcwIcon data-icon="inline-start" />
            Reset session
          </Button>
          <Button
            type="button"
            variant={session.committedAt ? "secondary" : "brand"}
            size="xl"
            disabled={commitBlockedReason !== undefined}
            title={commitBlockedReason}
            onClick={handleCommit}
          >
            <ClipboardCheckIcon data-icon="inline-start" />
            {session.committedAt ? "Committed" : "Commit to inventory"}
          </Button>
        </div>
      </header>

      {!canCommit ? (
        <p className="flex items-center gap-2 rounded-lg bg-brand-tint/60 px-3 py-2 text-[11px] text-brand ring-1 ring-brand/15">
          <ShieldAlertIcon aria-hidden className="size-3.5" />
          Reviewing is available to everyone signed in; committing assignments needs an admin role.
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <DetectAndSearchCapturePanel
          capture={session.capture}
          rejection={session.rejection}
          assigned={session.assigned}
          total={detectionCount}
          onFile={handleFile}
        />

        <div className="flex min-w-0 flex-col gap-6">
          <DetectAndSearchMap
            capture={session.capture}
            frame={session.frame}
            detections={detections}
            assignments={session.assignments}
            zoom={session.zoom}
            canZoomIn={session.canZoomIn}
            canZoomOut={session.canZoomOut}
            activeId={activeId}
            onSelect={handleMapSelect}
            onZoomIn={session.zoomIn}
            onZoomOut={session.zoomOut}
            onResetZoom={session.resetZoom}
          />

          <DetectAndSearchResults
            capture={session.capture}
            frame={session.frame}
            detections={detections}
            assignments={session.assignments}
            catalog={catalog}
            activeId={activeId}
            assigned={session.assigned}
            committedAt={session.committedAt}
            onSelect={setActiveId}
            onAssign={handleAssign}
            onAcceptAll={handleAcceptAll}
            onExport={handleExport}
          />
        </div>
      </div>

      <StatusToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
