import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, TopBar } from "@/components/app-shell";
import { ClayButton, ClayCard } from "@/components/clay";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dots")({
  head: () => ({
    meta: [
      { title: "Connect the Dots — Counting & Drawing Game" },
      {
        name: "description",
        content:
          "Tap the numbered dots in order to reveal a hidden picture — a playful way for kids to practise counting and drawing.",
      },
      { property: "og:title", content: "Connect the Dots — Finding an Objects" },
      {
        property: "og:description",
        content: "Count from 1 upward and watch a picture appear line by line.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dots,
});

type Puzzle = { name: string; emoji: string; pts: [number, number][] };

const PUZZLES: Puzzle[] = [
  {
    name: "Star",
    emoji: "⭐",
    pts: Array.from({ length: 10 }, (_, i) => {
      const r = i % 2 === 0 ? 0.4 : 0.17;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      return [0.5 + Math.cos(a) * r, 0.5 + Math.sin(a) * r] as [number, number];
    }),
  },
  {
    name: "House",
    emoji: "🏠",
    pts: [
      [0.5, 0.14],
      [0.87, 0.44],
      [0.8, 0.44],
      [0.8, 0.85],
      [0.2, 0.85],
      [0.2, 0.44],
      [0.13, 0.44],
    ],
  },
  {
    name: "Boat",
    emoji: "⛵",
    pts: [
      [0.5, 0.12],
      [0.5, 0.6],
      [0.16, 0.6],
      [0.5, 0.16],
      [0.5, 0.6],
      [0.86, 0.6],
      [0.76, 0.82],
      [0.24, 0.82],
      [0.14, 0.6],
    ],
  },
  {
    name: "Cat",
    emoji: "🐱",
    pts: [
      [0.3, 0.32],
      [0.24, 0.14],
      [0.42, 0.22],
      [0.6, 0.22],
      [0.78, 0.14],
      [0.72, 0.32],
      [0.8, 0.5],
      [0.7, 0.68],
      [0.5, 0.74],
      [0.3, 0.68],
      [0.2, 0.5],
    ],
  },
  {
    name: "Flower",
    emoji: "🌸",
    pts: [
      [0.5, 0.14],
      [0.68, 0.26],
      [0.74, 0.46],
      [0.62, 0.6],
      [0.55, 0.86],
      [0.45, 0.86],
      [0.38, 0.6],
      [0.26, 0.46],
      [0.32, 0.26],
    ],
  },
  {
    name: "Fish",
    emoji: "🐠",
    pts: [
      [0.66, 0.5],
      [0.5, 0.26],
      [0.24, 0.34],
      [0.14, 0.5],
      [0.24, 0.66],
      [0.5, 0.74],
      [0.66, 0.5],
      [0.88, 0.3],
      [0.88, 0.7],
    ],
  },
  {
    name: "Heart",
    emoji: "❤️",
    pts: [
      [0.5, 0.3],
      [0.62, 0.16],
      [0.78, 0.2],
      [0.84, 0.36],
      [0.72, 0.58],
      [0.5, 0.84],
      [0.28, 0.58],
      [0.16, 0.36],
      [0.22, 0.2],
      [0.38, 0.16],
    ],
  },
  {
    name: "Moon",
    emoji: "🌙",
    pts: [
      [0.62, 0.12],
      [0.4, 0.2],
      [0.28, 0.4],
      [0.3, 0.64],
      [0.46, 0.82],
      [0.68, 0.86],
      [0.52, 0.7],
      [0.46, 0.5],
      [0.5, 0.3],
    ],
  },
  {
    name: "Tree",
    emoji: "🌳",
    pts: [
      [0.5, 0.1],
      [0.66, 0.34],
      [0.58, 0.34],
      [0.74, 0.56],
      [0.56, 0.56],
      [0.56, 0.86],
      [0.44, 0.86],
      [0.44, 0.56],
      [0.26, 0.56],
      [0.42, 0.34],
      [0.34, 0.34],
    ],
  },
  {
    name: "Car",
    emoji: "🚗",
    pts: [
      [0.14, 0.66],
      [0.2, 0.48],
      [0.36, 0.32],
      [0.64, 0.32],
      [0.78, 0.48],
      [0.88, 0.52],
      [0.9, 0.66],
      [0.74, 0.66],
      [0.62, 0.66],
      [0.38, 0.66],
      [0.26, 0.66],
    ],
  },
  {
    name: "Rocket",
    emoji: "🚀",
    pts: [
      [0.5, 0.08],
      [0.64, 0.3],
      [0.64, 0.6],
      [0.8, 0.78],
      [0.6, 0.74],
      [0.5, 0.9],
      [0.4, 0.74],
      [0.2, 0.78],
      [0.36, 0.6],
      [0.36, 0.3],
    ],
  },
  {
    name: "Umbrella",
    emoji: "☂️",
    pts: [
      [0.5, 0.14],
      [0.74, 0.28],
      [0.88, 0.46],
      [0.62, 0.46],
      [0.54, 0.46],
      [0.54, 0.78],
      [0.42, 0.86],
      [0.36, 0.74],
      [0.46, 0.72],
      [0.46, 0.46],
      [0.12, 0.46],
      [0.26, 0.28],
    ],
  },
  {
    name: "Butterfly",
    emoji: "🦋",
    pts: [
      [0.5, 0.24],
      [0.24, 0.12],
      [0.14, 0.36],
      [0.34, 0.46],
      [0.18, 0.7],
      [0.4, 0.78],
      [0.5, 0.6],
      [0.6, 0.78],
      [0.82, 0.7],
      [0.66, 0.46],
      [0.86, 0.36],
      [0.76, 0.12],
    ],
  },
  {
    name: "Apple",
    emoji: "🍎",
    pts: [
      [0.5, 0.22],
      [0.68, 0.2],
      [0.82, 0.36],
      [0.8, 0.62],
      [0.64, 0.84],
      [0.5, 0.8],
      [0.36, 0.84],
      [0.2, 0.62],
      [0.18, 0.36],
      [0.32, 0.2],
    ],
  },
  {
    name: "Ice Cream",
    emoji: "🍦",
    pts: [
      [0.5, 0.14],
      [0.68, 0.24],
      [0.72, 0.42],
      [0.62, 0.5],
      [0.5, 0.9],
      [0.38, 0.5],
      [0.28, 0.42],
      [0.32, 0.24],
    ],
  },
  {
    name: "Balloon",
    emoji: "🎈",
    pts: [
      [0.5, 0.1],
      [0.68, 0.2],
      [0.72, 0.4],
      [0.58, 0.58],
      [0.54, 0.64],
      [0.6, 0.8],
      [0.46, 0.9],
      [0.46, 0.64],
      [0.42, 0.58],
      [0.28, 0.4],
      [0.32, 0.2],
    ],
  },
  {
    name: "Crown",
    emoji: "👑",
    pts: [
      [0.16, 0.72],
      [0.18, 0.28],
      [0.34, 0.48],
      [0.5, 0.22],
      [0.66, 0.48],
      [0.82, 0.28],
      [0.84, 0.72],
    ],
  },
  {
    name: "Kite",
    emoji: "🪁",
    pts: [
      [0.5, 0.1],
      [0.78, 0.38],
      [0.5, 0.66],
      [0.22, 0.38],
      [0.5, 0.1],
      [0.5, 0.66],
      [0.44, 0.8],
      [0.56, 0.9],
    ],
  },
  {
    name: "Duck",
    emoji: "🦆",
    pts: [
      [0.62, 0.2],
      [0.78, 0.26],
      [0.9, 0.3],
      [0.76, 0.36],
      [0.68, 0.46],
      [0.82, 0.62],
      [0.66, 0.78],
      [0.36, 0.78],
      [0.2, 0.62],
      [0.28, 0.44],
      [0.5, 0.36],
      [0.56, 0.24],
    ],
  },
  {
    name: "Sun",
    emoji: "☀️",
    pts: Array.from({ length: 16 }, (_, i) => {
      const r = i % 2 === 0 ? 0.42 : 0.22;
      const a = -Math.PI / 2 + (i * Math.PI) / 8;
      return [0.5 + Math.cos(a) * r, 0.5 + Math.sin(a) * r] as [number, number];
    }),
  },
  {
    name: "Train",
    emoji: "🚂",
    pts: [
      [0.12, 0.72],
      [0.12, 0.34],
      [0.4, 0.34],
      [0.4, 0.48],
      [0.66, 0.48],
      [0.66, 0.3],
      [0.76, 0.3],
      [0.76, 0.48],
      [0.88, 0.48],
      [0.88, 0.72],
      [0.5, 0.72],
    ],
  },
  {
    name: "Rainbow",
    emoji: "🌈",
    pts: Array.from({ length: 11 }, (_, i) => {
      const a = Math.PI + (i * Math.PI) / 10;
      return [0.5 + Math.cos(a) * 0.4, 0.78 + Math.sin(a) * 0.5] as [number, number];
    }),
  },
  {
    name: "Pencil",
    emoji: "✏️",
    pts: [
      [0.16, 0.86],
      [0.22, 0.68],
      [0.66, 0.16],
      [0.8, 0.28],
      [0.36, 0.8],
      [0.16, 0.86],
      [0.22, 0.68],
      [0.36, 0.8],
    ],
  },
  {
    name: "Envelope",
    emoji: "✉️",
    pts: [
      [0.12, 0.28],
      [0.88, 0.28],
      [0.88, 0.74],
      [0.12, 0.74],
      [0.12, 0.28],
      [0.5, 0.56],
      [0.88, 0.28],
    ],
  },
  {
    name: "Diamond",
    emoji: "💎",
    pts: [
      [0.3, 0.26],
      [0.7, 0.26],
      [0.88, 0.44],
      [0.5, 0.84],
      [0.12, 0.44],
      [0.3, 0.26],
      [0.42, 0.44],
      [0.88, 0.44],
      [0.5, 0.84],
      [0.12, 0.44],
    ],
  },
  {
    name: "Cup",
    emoji: "☕",
    pts: [
      [0.22, 0.3],
      [0.7, 0.3],
      [0.7, 0.4],
      [0.84, 0.42],
      [0.86, 0.56],
      [0.7, 0.6],
      [0.66, 0.76],
      [0.28, 0.76],
    ],
  },
  {
    name: "Ghost",
    emoji: "👻",
    pts: [
      [0.5, 0.12],
      [0.72, 0.22],
      [0.78, 0.5],
      [0.78, 0.84],
      [0.66, 0.72],
      [0.5, 0.86],
      [0.34, 0.72],
      [0.22, 0.84],
      [0.22, 0.5],
      [0.28, 0.22],
    ],
  },
  {
    name: "Robot",
    emoji: "🤖",
    pts: [
      [0.32, 0.24],
      [0.68, 0.24],
      [0.68, 0.46],
      [0.82, 0.46],
      [0.82, 0.76],
      [0.62, 0.76],
      [0.62, 0.9],
      [0.38, 0.9],
      [0.38, 0.76],
      [0.18, 0.76],
      [0.18, 0.46],
      [0.32, 0.46],
    ],
  },
  {
    name: "Snail",
    emoji: "🐌",
    pts: [
      [0.5, 0.44],
      [0.62, 0.36],
      [0.66, 0.52],
      [0.54, 0.62],
      [0.4, 0.56],
      [0.38, 0.38],
      [0.54, 0.28],
      [0.72, 0.4],
      [0.74, 0.66],
      [0.34, 0.76],
      [0.16, 0.7],
      [0.2, 0.56],
    ],
  },
];


function Dots() {
  const [pi, setPi] = useState(0);
  const [step, setStep] = useState(0);
  const [wrong, setWrong] = useState(false);
  const puzzle = PUZZLES[pi]!;
  const done = step >= puzzle.pts.length;

  const path = useMemo(
    () =>
      puzzle.pts
        .slice(0, step)
        .map((p, i) => `${i === 0 ? "M" : "L"}${p[0] * 100},${p[1] * 100}`)
        .join(" "),
    [puzzle, step],
  );

  return (
    <AppShell>
      <TopBar
        title="Connect Dots"
        right={
          <Link to="/draw">
            <ClayButton tone="accent" size="sm">
              ✏️ Trace
            </ClayButton>
          </Link>
        }
      />

      <ClayCard className="mb-3 flex items-center justify-between px-4 py-3">
        <p className="font-display text-sm font-extrabold">
          Tap dot {Math.min(step + 1, puzzle.pts.length)} of {puzzle.pts.length}
        </p>
        <span className="text-2xl">{done ? puzzle.emoji : "❓"}</span>
      </ClayCard>

      <div
        className={cn(
          "clay-inset relative aspect-square w-full overflow-hidden rounded-3xl bg-card",
          wrong && "animate-shake",
        )}
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          <path
            d={done ? `${path} Z` : path}
            fill={done ? "var(--color-secondary)" : "none"}
            stroke="var(--color-primary)"
            strokeWidth={1.6}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
        {puzzle.pts.map((p, i) => (
          <button
            key={i}
            aria-label={`dot ${i + 1}`}
            onClick={() => {
              if (i === step) {
                setStep(i + 1);
              } else if (!done) {
                setWrong(true);
                window.setTimeout(() => setWrong(false), 350);
              }
            }}
            className={cn(
              "clay-sm absolute h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-card font-display text-xs font-extrabold transition-transform active:scale-90",
              i < step && "bg-success text-success-foreground",
              i === step && !done && "animate-pop bg-warning text-warning-foreground",
            )}
            style={{ left: `${p[0] * 100}%`, top: `${p[1] * 100}%` }}
          >
            {i + 1}
          </button>
        ))}
        {done && (
          <div className="absolute inset-x-0 bottom-4 text-center">
            <span className="clay animate-pop inline-block rounded-2xl bg-card px-4 py-2 font-display font-extrabold">
              🎉 It's a {puzzle.name}!
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <ClayButton block tone="muted" onClick={() => setStep(0)}>
          🔄 Restart
        </ClayButton>
        <ClayButton
          block
          tone="warning"
          onClick={() => {
            setPi((p) => (p + 1) % PUZZLES.length);
            setStep(0);
          }}
        >
          Next picture ➜
        </ClayButton>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {PUZZLES.map((p, i) => (
          <button
            key={p.name}
            onClick={() => {
              setPi(i);
              setStep(0);
            }}
            className={cn(
              "clay-sm h-11 w-11 rounded-2xl bg-card text-xl transition-transform active:scale-90",
              i === pi && "bg-primary",
            )}
          >
            {p.emoji}
          </button>
        ))}
      </div>
    </AppShell>
  );
}
