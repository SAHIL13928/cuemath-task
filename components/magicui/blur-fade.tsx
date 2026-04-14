"use client";

import type { ReactNode, CSSProperties } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface BlurFadeProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  duration?: number;
  yOffset?: number;
  blur?: string;
  inView?: boolean;
}

export function BlurFade({
  children,
  className,
  style,
  delay = 0,
  duration = 0.45,
  yOffset = 8,
  blur = "8px",
  inView = false,
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const isVisible = inView ? isInView : true;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y: yOffset, filter: `blur(${blur})` }}
      animate={
        isVisible
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: yOffset, filter: `blur(${blur})` }
      }
      transition={{
        delay: 0.04 + delay,
        duration,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      {children}
    </motion.div>
  );
}
