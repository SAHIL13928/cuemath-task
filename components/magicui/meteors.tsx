"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MeteorsProps {
  number?: number;
  className?: string;
}

interface Meteor {
  id: number;
  left: string;
  animationDelay: string;
  animationDuration: string;
  size: number;
}

export function Meteors({ number = 20, className }: MeteorsProps) {
  const [meteors, setMeteors] = useState<Meteor[]>([]);

  useEffect(() => {
    setMeteors(
      Array.from({ length: number }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${3 + Math.random() * 4}s`,
        size: 1 + Math.random() * 1.5,
      }))
    );
  }, [number]);

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {meteors.map((m) => (
        <span
          key={m.id}
          style={{
            position: "absolute",
            top: "-10%",
            left: m.left,
            width: `${m.size}px`,
            height: `${m.size * 120}px`,
            background:
              "linear-gradient(to bottom, rgba(139,92,246,0.8), transparent)",
            borderRadius: "9999px",
            transform: "rotate(35deg)",
            animation: `meteorFall ${m.animationDuration} linear ${m.animationDelay} infinite`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes meteorFall {
          0%   { transform: rotate(35deg) translateY(-10vh); opacity: 1; }
          70%  { opacity: 0.8; }
          100% { transform: rotate(35deg) translateY(110vh); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
