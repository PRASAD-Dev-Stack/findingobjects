// Client-only drawing helpers: rasterize a reference shape and score a user's
// drawing against it. All functions expect to run in the browser.

export type Stroke = { x: number; y: number }[];

export type DrawPrompt = {
  id: string;
  label: string;
  /** text glyph to trace, e.g. "A" or "7" */
  glyph?: string;
  /** or a vector path drawn on a 100x100 box */
  path?: (ctx: CanvasRenderingContext2D, s: number) => void;
  hint: string;
};

export const LETTERS: DrawPrompt[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c) => ({
  id: `L${c}`,
  label: c,
  glyph: c,
  hint: `Trace the capital letter ${c}`,
}));

export const SMALL_LETTERS: DrawPrompt[] = "abcdefghijklmnopqrstuvwxyz".split("").map((c) => ({
  id: `S${c}`,
  label: c,
  glyph: c,
  hint: `Trace the small letter ${c}`,
}));

/** 0 … 999 */
export const NUMBERS: DrawPrompt[] = Array.from({ length: 1000 }, (_, n) => ({
  id: `N${n}`,
  label: String(n),
  glyph: String(n),
  hint: `Trace the number ${n}`,
}));

const ROMAN_MAP: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

export function toRoman(n: number) {
  let out = "";
  let left = n;
  for (const [v, s] of ROMAN_MAP) {
    while (left >= v) {
      out += s;
      left -= v;
    }
  }
  return out;
}

/** Roman numerals I … C */
export const ROMAN: DrawPrompt[] = Array.from({ length: 100 }, (_, i) => {
  const n = i + 1;
  const g = toRoman(n);
  return { id: `R${n}`, label: g, glyph: g, hint: `Trace ${g} — that means ${n}` };
});


export const SHAPES: DrawPrompt[] = [
  {
    id: "S-circle",
    label: "Circle",
    hint: "Draw a big round circle",
    path: (c, s) => {
      c.arc(0.5 * s, 0.5 * s, 0.34 * s, 0, Math.PI * 2);
    },
  },
  {
    id: "S-square",
    label: "Square",
    hint: "Four straight sides",
    path: (c, s) => {
      c.rect(0.18 * s, 0.18 * s, 0.64 * s, 0.64 * s);
    },
  },
  {
    id: "S-triangle",
    label: "Triangle",
    hint: "Three corners",
    path: (c, s) => {
      c.moveTo(0.5 * s, 0.15 * s);
      c.lineTo(0.86 * s, 0.82 * s);
      c.lineTo(0.14 * s, 0.82 * s);
      c.closePath();
    },
  },
  {
    id: "S-heart",
    label: "Heart",
    hint: "Two bumps and a point",
    path: (c, s) => {
      c.moveTo(0.5 * s, 0.85 * s);
      c.bezierCurveTo(-0.05 * s, 0.5 * s, 0.2 * s, 0.08 * s, 0.5 * s, 0.32 * s);
      c.bezierCurveTo(0.8 * s, 0.08 * s, 1.05 * s, 0.5 * s, 0.5 * s, 0.85 * s);
    },
  },
  {
    id: "S-star",
    label: "Star",
    hint: "Five sparkly points",
    path: (c, s) => {
      for (let i = 0; i < 10; i++) {
        const r = (i % 2 === 0 ? 0.38 : 0.16) * s;
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const x = 0.5 * s + Math.cos(a) * r;
        const y = 0.5 * s + Math.sin(a) * r;
        i === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
      }
      c.closePath();
    },
  },
  {
    id: "S-house",
    label: "House",
    hint: "A roof on a box",
    path: (c, s) => {
      c.moveTo(0.15 * s, 0.5 * s);
      c.lineTo(0.5 * s, 0.18 * s);
      c.lineTo(0.85 * s, 0.5 * s);
      c.lineTo(0.85 * s, 0.85 * s);
      c.lineTo(0.15 * s, 0.85 * s);
      c.closePath();
      c.moveTo(0.42 * s, 0.85 * s);
      c.lineTo(0.42 * s, 0.6 * s);
      c.lineTo(0.6 * s, 0.6 * s);
      c.lineTo(0.6 * s, 0.85 * s);
    },
  },
  {
    id: "S-fish",
    label: "Fish",
    hint: "A body and a tail",
    path: (c, s) => {
      c.moveTo(0.68 * s, 0.5 * s);
      c.bezierCurveTo(0.55 * s, 0.22 * s, 0.2 * s, 0.26 * s, 0.14 * s, 0.5 * s);
      c.bezierCurveTo(0.2 * s, 0.74 * s, 0.55 * s, 0.78 * s, 0.68 * s, 0.5 * s);
      c.moveTo(0.68 * s, 0.5 * s);
      c.lineTo(0.9 * s, 0.3 * s);
      c.lineTo(0.9 * s, 0.7 * s);
      c.closePath();
    },
  },
  {
    id: "S-flower",
    label: "Flower",
    hint: "Petals around a middle",
    path: (c, s) => {
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        c.moveTo(0.5 * s + Math.cos(a) * 0.3 * s + 0.13 * s, 0.5 * s + Math.sin(a) * 0.3 * s);
        c.arc(0.5 * s + Math.cos(a) * 0.3 * s, 0.5 * s + Math.sin(a) * 0.3 * s, 0.13 * s, 0, Math.PI * 2);
      }
      c.moveTo(0.63 * s, 0.5 * s);
      c.arc(0.5 * s, 0.5 * s, 0.13 * s, 0, Math.PI * 2);
    },
  },
];

const MASK = 96;

function makeCtx(size: number) {
  const cv = document.createElement("canvas");
  cv.width = size;
  cv.height = size;
  const ctx = cv.getContext("2d", { willReadFrequently: true })!;
  return ctx;
}

/** Draw the reference prompt onto any 2D context sized `size`. */
export function drawPrompt(
  ctx: CanvasRenderingContext2D,
  prompt: DrawPrompt,
  size: number,
  lineWidth: number,
) {
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = lineWidth;
  if (prompt.glyph) {
    const n = prompt.glyph.length;
    const fs = size * (n <= 1 ? 0.78 : n === 2 ? 0.6 : n === 3 ? 0.45 : 0.34);
    ctx.font = `700 ${fs}px "Trebuchet MS", system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText(prompt.glyph, size / 2, size * 0.54);

  } else if (prompt.path) {
    ctx.beginPath();
    prompt.path(ctx, size);
    ctx.stroke();
  }
  ctx.restore();
}

function maskFrom(render: (ctx: CanvasRenderingContext2D) => void) {
  const ctx = makeCtx(MASK);
  ctx.strokeStyle = "#000";
  ctx.fillStyle = "#000";
  render(ctx);
  const data = ctx.getImageData(0, 0, MASK, MASK).data;
  const out = new Uint8Array(MASK * MASK);
  for (let i = 0; i < out.length; i++) out[i] = data[i * 4 + 3]! > 40 ? 1 : 0;
  return out;
}

/** Grow a mask by `r` pixels (chebyshev) so near-misses still count. */
function dilate(mask: Uint8Array, r: number) {
  let cur = mask;
  for (let step = 0; step < r; step++) {
    const next = new Uint8Array(cur.length);
    for (let y = 0; y < MASK; y++) {
      for (let x = 0; x < MASK; x++) {
        const i = y * MASK + x;
        if (cur[i]) {
          next[i] = 1;
          continue;
        }
        if (
          (x > 0 && cur[i - 1]) ||
          (x < MASK - 1 && cur[i + 1]) ||
          (y > 0 && cur[i - MASK]) ||
          (y < MASK - 1 && cur[i + MASK])
        )
          next[i] = 1;
      }
    }
    cur = next;
  }
  return cur;
}

function count(m: Uint8Array) {
  let n = 0;
  for (let i = 0; i < m.length; i++) n += m[i]!;
  return n;
}

function overlap(a: Uint8Array, b: Uint8Array) {
  let n = 0;
  for (let i = 0; i < a.length; i++) if (a[i] && b[i]) n++;
  return n;
}

/**
 * Compares user strokes (normalized 0..1 coords) with the reference prompt.
 * Returns an accuracy percentage clamped to 10..100.
 */
export function scoreDrawing(prompt: DrawPrompt, strokes: Stroke[]): number {
  const inked = strokes.reduce((n, s) => n + s.length, 0);
  if (inked < 3) return 0;

  const ref = maskFrom((ctx) => drawPrompt(ctx, prompt, MASK, MASK * 0.075));
  const user = maskFrom((ctx) => {
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = MASK * 0.075;
    for (const s of strokes) {
      if (!s.length) continue;
      ctx.beginPath();
      ctx.moveTo(s[0]!.x * MASK, s[0]!.y * MASK);
      for (const p of s) ctx.lineTo(p.x * MASK, p.y * MASK);
      if (s.length === 1) ctx.lineTo(s[0]!.x * MASK + 0.1, s[0]!.y * MASK);
      ctx.stroke();
    }
  });

  const refN = count(ref);
  const userN = count(user);
  if (!refN || !userN) return 0;

  const tol = Math.round(MASK * 0.055);
  const refWide = dilate(ref, tol);
  const userWide = dilate(user, tol);

  const recall = overlap(ref, userWide) / refN; // how much of the shape was covered
  const precision = overlap(user, refWide) / userN; // how little was scribbled outside
  const f = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);

  return Math.max(10, Math.min(100, Math.round(f * 108)));
}

export function scoreMessage(score: number) {
  if (score >= 90) return { emoji: "🏆", text: "Perfect! Amazing work!" };
  if (score >= 75) return { emoji: "🌟", text: "Great job! So close to perfect." };
  if (score >= 55) return { emoji: "😃", text: "Nice try! Keep the lines steady." };
  if (score >= 35) return { emoji: "🙂", text: "Good start — trace slower." };
  return { emoji: "✏️", text: "Let's try again together!" };
}
