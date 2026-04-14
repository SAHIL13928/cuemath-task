"use client";

import { useEffect, useRef, useState } from "react";

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

function getColor(pct: number): string {
  if (pct <= 33) return "#f43f5e";
  if (pct <= 66) return "#f59e0b";
  return "#10b981";
}

export default function ProgressRing({
  percentage,
  size = 60,
  strokeWidth = 6,
}: ProgressRingProps) {
  const [animatedPct, setAnimatedPct] = useState(0);
  const id1 = useRef<number>(0);
  const id2 = useRef<number>(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedPct / 100) * circumference;
  const color = getColor(percentage);

  useEffect(() => {
    // Double RAF: ensures the initial 0 value is committed to the DOM
    // before the browser sees the new value, triggering the CSS transition.
    id1.current = requestAnimationFrame(() => {
      id2.current = requestAnimationFrame(() => {
        setAnimatedPct(percentage);
      });
    });
    return () => {
      cancelAnimationFrame(id1.current);
      cancelAnimationFrame(id2.current);
    };
  }, [percentage]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-slate-700">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}
