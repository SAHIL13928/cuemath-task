"use client";

import { motion } from "framer-motion";

const COLORS = ["#6C5CE7", "#00CEC9", "#00B894", "#FDCB6E", "#FF7675", "#A29BFE"];

function Piece({ index }: { index: number }) {
  const size = 6 + Math.random() * 10;
  const left = Math.random() * 100;
  const delay = Math.random() * 0.6;
  const duration = 2 + Math.random() * 2;
  const rotation = Math.random() * 360;
  const isCircle = Math.random() > 0.5;

  return (
    <motion.div
      style={{
        position: "absolute",
        width: size,
        height: size,
        left: `${left}%`,
        top: -20,
        borderRadius: isCircle ? "50%" : "2px",
        backgroundColor: COLORS[index % COLORS.length],
      }}
      initial={{ y: -20, opacity: 1 }}
      animate={{
        y: [0, 500 + Math.random() * 200],
        x: [0, (Math.random() - 0.5) * 200],
        rotate: [rotation, rotation + 720 * (Math.random() > 0.5 ? 1 : -1)],
        opacity: [1, 1, 0],
      }}
      transition={{ duration, delay, ease: "easeOut" }}
    />
  );
}

export default function Confetti({ count = 40 }: { count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <Piece key={i} index={i} />
      ))}
    </div>
  );
}
