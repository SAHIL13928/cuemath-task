"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedBeamProps {
  containerRef: React.RefObject<HTMLElement | null>;
  fromRef: React.RefObject<HTMLElement | null>;
  toRef: React.RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  className?: string;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
}

export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 2,
  delay = 0,
  pathColor = "rgba(255,255,255,0.1)",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#6366f1",
  gradientStopColor = "#8b5cf6",
  className,
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}: AnimatedBeamProps) {
  const id = useRef(`beam-${Math.random().toString(36).slice(2)}`).current;
  const [path, setPath] = useState("");
  const [svgDims, setSvgDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => {
      if (!containerRef.current || !fromRef.current || !toRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const fromRect = fromRef.current.getBoundingClientRect();
      const toRect = toRef.current.getBoundingClientRect();

      const w = containerRect.width;
      const h = containerRect.height;
      setSvgDims({ width: w, height: h });

      const sx = fromRect.left - containerRect.left + fromRect.width / 2 + startXOffset;
      const sy = fromRect.top - containerRect.top + fromRect.height / 2 + startYOffset;
      const ex = toRect.left - containerRect.left + toRect.width / 2 + endXOffset;
      const ey = toRect.top - containerRect.top + toRect.height / 2 + endYOffset;

      const mx = (sx + ex) / 2;
      const my = (sy + ey) / 2 - curvature;

      setPath(`M ${sx},${sy} Q ${mx},${my} ${ex},${ey}`);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [containerRef, fromRef, toRef, curvature, startXOffset, startYOffset, endXOffset, endYOffset]);

  return (
    <svg
      fill="none"
      className={cn("pointer-events-none absolute left-0 top-0 overflow-visible", className)}
      width={svgDims.width}
      height={svgDims.height}
    >
      <defs>
        <linearGradient
          id={`${id}-grad`}
          gradientUnits="userSpaceOnUse"
          x1={reverse ? "100%" : "0%"}
          x2={reverse ? "0%" : "100%"}
        >
          <stop stopColor={gradientStartColor} stopOpacity="0" offset="0%" />
          <stop stopColor={gradientStartColor} offset="30%" />
          <stop stopColor={gradientStopColor} offset="70%" />
          <stop stopColor={gradientStopColor} stopOpacity="0" offset="100%" />
        </linearGradient>
      </defs>
      {/* Static path */}
      <path d={path} stroke={pathColor} strokeWidth={pathWidth} strokeOpacity={pathOpacity} fill="none" />
      {/* Animated beam */}
      {path && (
        <motion.path
          d={path}
          stroke={`url(#${id}-grad)`}
          strokeWidth={pathWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration, delay, ease: "easeInOut", repeat: Infinity, repeatType: "loop", repeatDelay: 1 },
            opacity: { duration: 0.3, delay },
          }}
        />
      )}
    </svg>
  );
}
