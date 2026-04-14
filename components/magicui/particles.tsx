"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ParticleProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  size?: number;
  color?: string;
  vx?: number;
  vy?: number;
}

interface Circle {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [99, 102, 241];
}

export function Particles({
  className,
  quantity = 100,
  staticity = 50,
  ease = 50,
  size = 0.4,
  color = "#6366f1",
  vx = 0,
  vy = 0,
}: ParticleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<Circle[]>([]);
  const mousePosition = useRef({ x: 0, y: 0 });
  const mouse = useRef({ x: 0, y: 0 });
  const canvasSize = useRef({ w: 0, h: 0 });
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
  const animationRef = useRef<number>(0);
  const [rgb] = useState(() => hexToRgb(color));

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;
    if (!canvas || !container) return;
    circles.current = [];
    canvasSize.current.w = container.offsetWidth;
    canvasSize.current.h = container.offsetHeight;
    canvas.width = canvasSize.current.w * dpr;
    canvas.height = canvasSize.current.h * dpr;
    canvas.style.width = `${canvasSize.current.w}px`;
    canvas.style.height = `${canvasSize.current.h}px`;
    context.current = canvas.getContext("2d");
    if (context.current) context.current.scale(dpr, dpr);
    for (let i = 0; i < quantity; i++) {
      const circle: Circle = {
        x: Math.random() * canvasSize.current.w,
        y: Math.random() * canvasSize.current.h,
        translateX: 0,
        translateY: 0,
        size: Math.random() * 2 + size,
        alpha: 0,
        targetAlpha: parseFloat((Math.random() * 0.6 + 0.1).toFixed(1)),
        dx: (Math.random() - 0.5) * 0.2,
        dy: (Math.random() - 0.5) * 0.2,
        magnetism: 0.1 + Math.random() * 4,
      };
      circles.current.push(circle);
    }
  }, [quantity, size, dpr]);

  const drawCircle = useCallback(
    (circle: Circle) => {
      if (!context.current) return;
      const { x, y, translateX, translateY, size: s, alpha } = circle;
      context.current.translate(translateX, translateY);
      context.current.beginPath();
      context.current.arc(x, y, s, 0, 2 * Math.PI);
      context.current.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
      context.current.fill();
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
    },
    [rgb, dpr]
  );

  const animate = useCallback(() => {
    if (!context.current) return;
    context.current.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
    mouse.current.x += (mousePosition.current.x - mouse.current.x) / ease;
    mouse.current.y += (mousePosition.current.y - mouse.current.y) / ease;
    circles.current.forEach((circle) => {
      const edge = [
        circle.x + circle.translateX - circle.size,
        canvasSize.current.w - circle.x - circle.translateX - circle.size,
        circle.y + circle.translateY - circle.size,
        canvasSize.current.h - circle.y - circle.translateY - circle.size,
      ];
      const closestEdge = edge.reduce((a, b) => Math.min(a, b));
      const remapClosestEdge = Math.min(closestEdge / 20, 1);
      circle.alpha = Math.min(circle.alpha + 0.02, circle.targetAlpha * remapClosestEdge);
      circle.x += circle.dx + vx;
      circle.y += circle.dy + vy;
      circle.translateX += (mouse.current.x / (staticity / circle.magnetism) - circle.translateX) / ease;
      circle.translateY += (mouse.current.y / (staticity / circle.magnetism) - circle.translateY) / ease;
      if (
        circle.x < -circle.size ||
        circle.x > canvasSize.current.w + circle.size ||
        circle.y < -circle.size ||
        circle.y > canvasSize.current.h + circle.size
      ) {
        circle.x = Math.random() * canvasSize.current.w;
        circle.y = Math.random() * canvasSize.current.h;
        circle.alpha = 0;
      }
      drawCircle(circle);
    });
    animationRef.current = requestAnimationFrame(animate);
  }, [ease, staticity, vx, vy, drawCircle]);

  useEffect(() => {
    initCanvas();
    animate();
    const handleResize = () => initCanvas();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [initCanvas, animate]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mousePosition.current.x = e.clientX - rect.left - canvasSize.current.w / 2;
      mousePosition.current.y = e.clientY - rect.top - canvasSize.current.h / 2;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={canvasContainerRef} className={cn("pointer-events-none absolute inset-0", className)}>
      <canvas ref={canvasRef} />
    </div>
  );
}
