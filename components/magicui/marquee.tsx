"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  vertical?: boolean;
  repeat?: number;
}

export function Marquee({
  children,
  className,
  reverse = false,
  pauseOnHover = false,
  vertical = false,
  repeat = 4,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        "group flex overflow-hidden [--duration:40s] [--gap:1rem]",
        vertical ? "flex-col" : "flex-row",
        className
      )}
      style={{ gap: "var(--gap)" }}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          className={cn("flex shrink-0 justify-around", vertical ? "flex-col" : "flex-row")}
          style={{
            gap: "var(--gap)",
            animation: `marquee${vertical ? "Y" : "X"} var(--duration) linear infinite`,
            animationDirection: reverse ? "reverse" : "normal",
            animationPlayState: pauseOnHover ? undefined : "running",
          }}
          aria-hidden={i > 0}
        >
          {children}
        </div>
      ))}

      <style>{`
        @keyframes marqueeX {
          0%   { transform: translateX(0); }
          100% { transform: translateX(calc(-100% - var(--gap))); }
        }
        @keyframes marqueeY {
          0%   { transform: translateY(0); }
          100% { transform: translateY(calc(-100% - var(--gap))); }
        }
        .group:hover > div {
          animation-play-state: ${pauseOnHover ? "paused" : "running"};
        }
      `}</style>
    </div>
  );
}
