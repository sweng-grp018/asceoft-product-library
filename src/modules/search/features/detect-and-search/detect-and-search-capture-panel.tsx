"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import {
  CameraIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  CloudUploadIcon,
  ImageUpIcon,
  LightbulbIcon,
  ScanEyeIcon,
} from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { IMAGE_MAX_BYTES, IMAGE_MIME_TYPES, describeBytes } from "@/lib/image";
import { CAPTURE_GUIDELINES } from "./detect-and-search.data";
import { frameSize } from "./detect-and-search.logic";
import type { CaptureState } from "./detect-and-search.types";

type CapturePanelProps = {
  capture: CaptureState;
  rejection: string | null;
  assigned: number;
  total: number;
  onFile: (file: File) => void;
};

/**
 * Staging panel for the shelf photo. One frame at a time: a new capture
 * replaces the previous one, and the route never uploads it.
 */
export function DetectAndSearchCapturePanel({
  capture,
  rejection,
  assigned,
  total,
  onFile,
}: CapturePanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);

  const frame = frameSize(capture);

  function accept(files: FileList | null) {
    const file = files?.[0];
    if (file) onFile(file);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    accept(event.dataTransfer.files);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    accept(event.target.files);
    event.target.value = "";
  }

  return (
    <section className="flex h-fit flex-col gap-4 rounded-xl bg-card p-5 shadow-sm ring-1 ring-line">
      <header className="flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-brand-ink">
          <ImageUpIcon aria-hidden className="size-4 text-brand" />
          Input shelf capture
        </h2>
        <span className="rounded-md bg-page px-2 py-0.5 text-[10px] font-semibold tracking-[0.06em] text-ink-muted uppercase ring-1 ring-line">
          JPG · PNG · WEBP
        </span>
      </header>

      <label
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2.5 rounded-xl border border-dashed bg-page px-4 py-7 text-center transition-colors focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15",
          isDragging ? "border-brand bg-brand-tint" : "border-line hover:border-brand/40",
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-brand-tint text-brand">
          <CloudUploadIcon aria-hidden className="size-5" />
        </span>
        <span className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-brand-ink">
            Drop a shelf photo here, or browse
          </span>
          <span className="text-xs text-ink-muted">
            One frame · {describeBytes(IMAGE_MAX_BYTES)} max · stays on this device
          </span>
        </span>
        <span className="rounded-md bg-card px-2.5 py-1 text-[11px] font-semibold text-brand ring-1 ring-brand/20">
          Browse files
        </span>
        <input
          type="file"
          accept={IMAGE_MIME_TYPES.join(",")}
          className="sr-only"
          onChange={handleChange}
        />
      </label>

      <Button
        type="button"
        variant="brand"
        size="xl"
        className="w-full"
        onClick={() => cameraRef.current?.click()}
      >
        <CameraIcon data-icon="inline-start" />
        Take photo
      </Button>
      <input
        ref={cameraRef}
        type="file"
        accept={IMAGE_MIME_TYPES.join(",")}
        capture="environment"
        className="sr-only"
        onChange={handleChange}
      />

      {rejection ? (
        <p
          role="alert"
          className="rounded-lg bg-destructive/5 px-3 py-2 text-[11px] font-medium text-destructive ring-1 ring-destructive/15"
        >
          {rejection}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 rounded-xl bg-brand-tint/60 px-4 py-3.5 ring-1 ring-brand/10">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.06em] text-brand uppercase">
          <LightbulbIcon aria-hidden className="size-3.5" />
          Capture guidelines
        </p>
        <ul className="flex flex-col gap-1.5">
          {CAPTURE_GUIDELINES.map((guideline) => (
            <li key={guideline} className="flex gap-2 text-[11px] leading-relaxed text-ink-muted">
              <span aria-hidden className="mt-1 size-1 shrink-0 rounded-full bg-brand/60" />
              {guideline}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-page px-3 py-2 text-[11px] text-ink-muted ring-1 ring-line">
        <span className="flex items-center gap-1.5">
          <ScanEyeIcon aria-hidden className="size-3.5 text-brand" />
          YOLO11 proposals · OpenCLIP similarity
        </span>
        <span className="font-mono">Latency: not measured</span>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold tracking-[0.06em] text-ink-muted uppercase">
          Session details
        </p>
        <div className="grid grid-cols-2 gap-2">
          <SessionTile
            label="Capture source"
            value={capture.kind === "upload" ? capture.name : "Sample frame"}
            hint={capture.kind === "upload" ? describeBytes(capture.size) : "Not model output"}
          />
          <SessionTile
            label="Frame size"
            value={`${frame.width} × ${frame.height} px`}
            hint={capture.kind === "upload" ? "Read from the file" : "Schematic"}
          />
        </div>
        <p className="flex items-center gap-1.5 pt-1 text-[11px] text-ink-muted">
          {assigned === total ? (
            <CircleCheckIcon aria-hidden className="size-3.5 text-status-ready-fg" />
          ) : (
            <CircleDashedIcon aria-hidden className="size-3.5 text-brand" />
          )}
          {assigned} of {total} detections assigned
        </p>
      </div>
    </section>
  );
}

function SessionTile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-lg bg-page px-2.5 py-2 ring-1 ring-line">
      <span className="text-[10px] font-semibold tracking-[0.06em] text-ink-muted uppercase">
        {label}
      </span>
      <span className="truncate text-xs font-semibold text-brand-ink" title={value}>
        {value}
      </span>
      <span className="truncate text-[10px] text-ink-muted">{hint}</span>
    </div>
  );
}
