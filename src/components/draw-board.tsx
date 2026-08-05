import { useCallback, useEffect, useRef, useState } from "react";
import type { Stroke } from "@/lib/drawing";
import { cn } from "@/lib/utils";

export type DrawBoardHandle = {
  clear: () => void;
  undo: () => void;
  strokes: Stroke[];
};

/**
 * Claymorphic whiteboard. Captures pointer strokes in normalized 0..1 coords so
 * scoring is resolution independent.
 */
export function DrawBoard({
  color = "#2b2b45",
  width = 12,
  strokes,
  onChange,
  guide,
  disabled,
  className,
}: {
  color?: string;
  width?: number;
  strokes: Stroke[];
  onChange: (s: Stroke[]) => void;
  /** optional painter for a faint reference behind the user's ink */
  guide?: ((ctx: CanvasRenderingContext2D, size: number) => void) | undefined;
  disabled?: boolean | undefined;
  className?: string | undefined;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(320);
  const drawing = useRef(false);
  const colorsRef = useRef<string[]>([]);
  const widthsRef = useRef<number[]>([]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize(e!.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // keep a per-stroke style history so colour changes don't repaint old ink
  while (colorsRef.current.length < strokes.length) {
    colorsRef.current.push(color);
    widthsRef.current.push(width);
  }
  colorsRef.current.length = strokes.length;
  widthsRef.current.length = strokes.length;

  const repaint = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = size * dpr;
    cv.height = size * dpr;
    const ctx = cv.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);
    if (guide) {
      ctx.save();
      guide(ctx, size);
      ctx.restore();
    }
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    strokes.forEach((s, i) => {
      if (!s.length) return;
      ctx.strokeStyle = colorsRef.current[i] ?? color;
      ctx.lineWidth = widthsRef.current[i] ?? width;
      ctx.beginPath();
      ctx.moveTo(s[0]!.x * size, s[0]!.y * size);
      for (const p of s) ctx.lineTo(p.x * size, p.y * size);
      if (s.length === 1) ctx.lineTo(s[0]!.x * size + 0.5, s[0]!.y * size);
      ctx.stroke();
    });
  }, [size, strokes, guide, color, width]);

  useEffect(repaint, [repaint]);

  const pos = (e: React.PointerEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };

  return (
    <div ref={wrapRef} className={cn("clay-inset relative aspect-square w-full overflow-hidden rounded-3xl bg-card", className)}>
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size, touchAction: "none" }}
        className="absolute inset-0"
        onPointerDown={(e) => {
          if (disabled) return;
          (e.target as Element).setPointerCapture(e.pointerId);
          drawing.current = true;
          colorsRef.current.push(color);
          widthsRef.current.push(width);
          onChange([...strokes, [pos(e)]]);
        }}
        onPointerMove={(e) => {
          if (!drawing.current || disabled) return;
          const next = strokes.slice();
          const last = next[next.length - 1];
          if (!last) return;
          next[next.length - 1] = [...last, pos(e)];
          onChange(next);
        }}
        onPointerUp={() => (drawing.current = false)}
        onPointerCancel={() => (drawing.current = false)}
      />
    </div>
  );
}
