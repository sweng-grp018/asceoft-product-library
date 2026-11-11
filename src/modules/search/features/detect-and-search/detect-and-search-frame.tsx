"use client";

import Image from "next/image";
import { cn } from "cn";
import { cropStyle, squareCrop } from "./detect-and-search.logic";
import type { CaptureState, DetectionBox, FrameSize } from "./detect-and-search.types";

/**
 * Paints the captured frame. Uploads render the operator's own photo; the
 * sample session draws a schematic shelf instead of shipping a fabricated
 * warehouse photograph.
 */
export function CaptureSurface({
  capture,
  decorative = false,
}: {
  capture: CaptureState;
  /** Crop thumbnails are explained by the card copy, so their image is decorative. */
  decorative?: boolean;
}) {
  if (capture.kind === "upload") {
    return (
      <Image
        src={capture.url}
        alt={decorative ? "" : `Staged shelf capture: ${capture.name}`}
        fill
        unoptimized
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="object-cover"
      />
    );
  }

  return <SampleShelf />;
}

function SampleShelf() {
  return (
    <div aria-hidden className="relative size-full overflow-hidden bg-[#f5f2e9]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 35%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 65%)",
        }}
      />

      <div className="absolute inset-y-0 left-[6%] w-[1.6%] bg-[#ded7c7]" />
      <div className="absolute inset-y-0 right-[6%] w-[1.6%] bg-[#ded7c7]" />

      {[20, 45, 70].map((top) => (
        <div
          key={top}
          className="absolute inset-x-0 h-[2%] bg-[#cfc6b3] shadow-[0_1px_0_rgba(255,255,255,0.6)_inset]"
          style={{ top: `${top}%` }}
        />
      ))}

      <div className="absolute top-[9%] left-[11%] h-[10%] w-[14%] rounded-[2px] bg-[#e9b94f]" />
      <div className="absolute top-[9%] left-[27%] h-[10%] w-[10%] rounded-[2px] bg-[#d98e58]" />
      <div className="absolute top-[9%] left-[39%] h-[10%] w-[16%] rounded-[2px] bg-[#c9d3dc]" />

      <div className="absolute top-[52%] left-[12%] h-[16%] w-[18%] rounded-[2px] bg-[#d7a04a]" />
      <div className="absolute top-[52%] left-[33%] h-[16%] w-[13%] rounded-[2px] bg-[#c96a54]" />
      <div className="absolute top-[52%] left-[49%] h-[16%] w-[11%] rounded-[2px] bg-[#9fb9c6]" />

      <div className="absolute top-[26%] left-[70%] h-[16%] w-[9%] rounded-[2px] bg-[#c4ad86]" />
      <div className="absolute top-[26%] left-[81%] h-[16%] w-[12%] rounded-[2px] bg-[#cbb898]" />
    </div>
  );
}

/** Square crop of the frame around a detection, used for the card thumbnail. */
export function DetectionCrop({
  capture,
  frame,
  box,
  className,
}: {
  capture: CaptureState;
  frame: FrameSize;
  box: DetectionBox;
  className?: string;
}) {
  const rect = squareCrop(box, frame);

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg bg-page ring-1 ring-line",
        className,
      )}
    >
      <div style={cropStyle(rect, frame)}>
        <CaptureSurface capture={capture} decorative />
      </div>
    </div>
  );
}
