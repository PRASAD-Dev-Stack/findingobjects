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
      { property: "og:title", content: "Connect the Dots — ObjectFinder Pro" },
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
