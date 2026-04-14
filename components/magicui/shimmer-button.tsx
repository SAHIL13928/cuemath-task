"use client";

import type { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps {
  children: ReactNode;
  className?: string;
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  onClick?: () => void;
  style?: CSSProperties;
}

export function ShimmerButton({
  children,
  className,
  shimmerColor = "#a5b4fc",
  shimmerSize = "0.1em",
  borderRadius = "12px",
  shimmerDuration = "2s",
  background = "rgba(99,102,241,1)",
  onClick,
  style,
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        "relative cursor-pointer overflow-hidden whitespace-nowrap px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
      style={{
        borderRadius,
        background,
        ...style,
      }}
      onClick={onClick}
    >
      {/* Shimmer layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(
            110deg,
            transparent 20%,
            ${shimmerColor}60 40%,
            ${shimmerColor}80 50%,
            ${shimmerColor}60 60%,
            transparent 80%
          )`,
          backgroundSize: "200% 100%",
          animation: `shimmerSlide ${shimmerDuration} linear infinite`,
        }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
