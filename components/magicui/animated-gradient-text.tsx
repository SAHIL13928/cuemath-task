"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedGradientTextProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedGradientText({ children, className }: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-full px-4 py-1.5 text-sm font-medium",
        className
      )}
      style={{
        background:
          "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15), rgba(236,72,153,0.15))",
        border: "1px solid rgba(139,92,246,0.3)",
        color: "#fff",
      }}
    >
      <span
        style={{
          background:
            "linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899, #8b5cf6, #6366f1)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "gradientShift 4s linear infinite",
        }}
      >
        {children}
      </span>
    </span>
  );
}
