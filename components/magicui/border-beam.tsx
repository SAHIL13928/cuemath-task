"use client";

import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
  borderWidth?: number;
}

export function BorderBeam({
  className,
  size = 300,
  duration = 8,
  colorFrom = "#6366f1",
  colorTo = "#ec4899",
  borderWidth = 1.5,
}: BorderBeamProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit]", className)}
      style={
        {
          "--size": size,
          "--duration": duration,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--border-width": borderWidth,
        } as React.CSSProperties
      }
    >
      <div
        className="absolute inset-[calc(-1*var(--border-width,1.5)px)] rounded-[inherit]"
        style={{
          background: `conic-gradient(
            from var(--beam-angle, 0deg),
            transparent 0%,
            var(--color-from) 15%,
            var(--color-to) 30%,
            transparent 45%,
            transparent 100%
          )`,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "var(--border-width, 1.5px)",
          animation: `beamRotate ${duration}s linear infinite`,
        }}
      />
    </div>
  );
}

// Import React for CSSProperties
import React from "react";
