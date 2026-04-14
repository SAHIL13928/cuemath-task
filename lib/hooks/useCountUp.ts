"use client";
import { useEffect, useState } from "react";

/** Animates a number from 0 to `target` over `duration` ms with ease-out. */
export function useCountUp(target: number, duration = 600): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = performance.now();
    let raf: number;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
