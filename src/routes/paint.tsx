import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, TopBar } from "@/components/app-shell";
import { ClayButton, ClayCard } from "@/components/clay";
import { ARTWORKS, PAINT_COLORS } from "@/lib/paint-art";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/paint")({
  head: () => ({
    meta: [
      { title: "Paint Studio — 49 Colour-In Pictures" },
      {
        name: "description",
        content:
          "Tap each part of a picture — roof, door, window, wall — and fill it with colour. 49 cartoon drawings with a party animation when you finish.",
      },
      { property: "og:title", content: "Paint Studio — Finding an Objects" },
      {
        property: "og:description",
        content: "Colour 49 cartoon pictures part by part and celebrate every finished artwork.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaintPage,
});

const CONFETTI = ["🎉", "⭐", "🎈", "✨", "🏆", "🌈", "🎨", "💖"];

function PaintPage() {
  const [artIndex, setArtIndex] = useState(0);
  const [color, setColor] = useState(PAINT_COLORS[0]!);
  const [erase, setErase] = useState(false);
  const [fills, setFills] = useState<Record<string, string>>({});

  const art = ARTWORKS[artIndex]!;
  const painted = art.parts.filter((_, i) => fills[String(i)]).length;
  const done = painted === art.parts.length;

  const confetti = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        emoji: CONFETTI[i % CONFETTI.length]!,
        left: (i * 7.3) % 92,
        delay: (i % 7) * 0.12,
      })),
    [],
  );

  const pick = (index: number) => {
    setArtIndex(index);
    setFills({});
  };

  return (
    <AppShell>
      <TopBar
        title="Paint Studio"
        right={
          <Link to="/draw">
            <ClayButton tone="secondary" size="sm">
              ✏️ Trace
            </ClayButton>
          </Link>
        }
      />

      <ClayCard className="mb-3 flex items-center justify-between px-4 py-3">
        <div>
          <p className="font-display text-2xl font-extrabold leading-none">
            {art.emoji} {art.name}
          </p>
          <p className="text-xs font-semibold text-muted-foreground">
            {painted}/{art.parts.length} parts painted — tap a part to colour it
          </p>
        </div>
        <ClayButton size="sm" tone="muted" onClick={() => setFills({})}>
          🧽
        </ClayButton>
      </ClayCard>

      <div className="clay relative overflow-hidden rounded-3xl bg-card p-3">
        <svg viewBox="0 0 100 100" className="w-full" role="img" aria-label={art.name}>
          <rect x="0" y="0" width="100" height="100" fill="var(--color-muted)" opacity="0.35" />
          {art.parts.map((p, i) => (
            <path
              key={p.name}
              d={p.d}
              fill={fills[String(i)] ?? "var(--color-card)"}
              stroke="var(--color-foreground)"
              strokeWidth={1.1}
              strokeLinejoin="round"
              className="cursor-pointer"
              onClick={() =>
                setFills((f) => {
                  const next = { ...f };
                  if (erase) delete next[String(i)];
                  else next[String(i)] = color;
                  return next;
                })
              }
            >
              <title>{p.name}</title>
            </path>
          ))}
        </svg>

        {done && (
          <div className="pointer-events-none absolute inset-0">
            {confetti.map((c, i) => (
              <span
                key={i}
                className="animate-confetti absolute -top-6 text-2xl"
                style={{ left: `${c.left}%`, animationDelay: `${c.delay}s` }}
              >
                {c.emoji}
              </span>
            ))}
            <div className="animate-pop absolute inset-x-0 bottom-3 text-center">
              <div className="animate-float inline-block text-5xl">🥳</div>
              <p className="font-display text-xl font-extrabold text-foreground drop-shadow">
                Beautiful! Artwork complete!
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {PAINT_COLORS.map((c) => (
          <button
            key={c}
            aria-label={`colour ${c}`}
            onClick={() => {
              setColor(c);
              setErase(false);
            }}
            className={cn(
              "clay-sm h-9 w-9 rounded-full transition-transform active:scale-90",
              !erase && color === c && "scale-110 ring-4 ring-foreground/15",
            )}
            style={{ background: c }}
          />
        ))}
        <ClayButton
          size="sm"
          tone={erase ? "warning" : "muted"}
          className="ml-auto"
          onClick={() => setErase((e) => !e)}
        >
          {erase ? "🧼 Removing" : "🧼 Remove colour"}
        </ClayButton>
      </div>

      <div className="mt-4 flex gap-3">
        <ClayButton block tone="secondary" onClick={() => pick((artIndex + 1) % ARTWORKS.length)}>
          Next picture ➜
        </ClayButton>
      </div>

      <h2 className="mt-5 mb-2 font-display text-lg font-extrabold">
        All {ARTWORKS.length} drawings
      </h2>
      <div className="grid grid-cols-6 gap-2">
        {ARTWORKS.map((a, i) => (
          <button
            key={a.id}
            onClick={() => pick(i)}
            aria-label={a.name}
            className={cn(
              "clay-sm h-11 rounded-xl bg-card text-xl transition-transform active:scale-90",
              i === artIndex && "bg-primary",
            )}
          >
            {a.emoji}
          </button>
        ))}
      </div>
    </AppShell>
  );
}
