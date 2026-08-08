import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, TopBar } from "@/components/app-shell";
import { ClayButton, ClayCard } from "@/components/clay";
import { DrawBoard } from "@/components/draw-board";
import type { Stroke } from "@/lib/drawing";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/doodle")({
  head: () => ({
    meta: [
      { title: "Doodle Studio — Free Drawing for Kids" },
      {
        name: "description",
        content:
          "A colourful free-draw whiteboard with crayons, sticker stamps and a saved art gallery for little artists.",
      },
      { property: "og:title", content: "Doodle Studio — Finding an Objects" },
      {
        property: "og:description",
        content: "Paint, stamp stickers and save your artwork to your own gallery.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Doodle,
});

const PALETTE = [
  "#2b2b45",
  "#ef476f",
  "#ff7f11",
  "#ffd166",
  "#06d6a0",
  "#118ab2",
  "#8338ec",
  "#ff8fab",
];
const STICKERS = ["⭐", "🌈", "🐱", "🌸", "🚀", "🦋", "🍦", "☀️"];
const IDEAS = [
  "Draw your family 👨‍👩‍👧",
  "Draw a friendly monster 👾",
  "Draw your favourite fruit 🍓",
  "Draw a rocket to the moon 🚀",
  "Draw a rainy day ☔",
  "Draw your pet 🐶",
  "Draw a birthday cake 🎂",
  "Draw an underwater world 🐠",
];
const KEY = "ofp.gallery.v1";

type Art = { id: string; data: string; idea: string };

function Doodle() {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [color, setColor] = useState(PALETTE[0]!);
  const [width, setWidth] = useState(12);
  const [stamps, setStamps] = useState<{ x: number; y: number; e: string }[]>([]);
  const [sticker, setSticker] = useState<string | null>(null);
  const [idea, setIdea] = useState(IDEAS[0]!);
  const [gallery, setGallery] = useState<Art[]>([]);

  useEffect(() => {
    setIdea(IDEAS[Math.floor(Math.random() * IDEAS.length)]!);
    try {
      setGallery(JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as Art[]);
    } catch {
      setGallery([]);
    }
  }, []);

  function save() {
    const cv = document.querySelector<HTMLCanvasElement>("#doodle-board canvas");
    if (!cv) return;
    const out = document.createElement("canvas");
    out.width = 360;
    out.height = 360;
    const ctx = out.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 360, 360);
    ctx.drawImage(cv, 0, 0, 360, 360);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const s of stamps) {
      ctx.font = "40px system-ui";
      ctx.fillText(s.e, s.x * 360, s.y * 360);
    }
    const next = [{ id: String(Date.now()), data: out.toDataURL("image/png"), idea }, ...gallery].slice(0, 12);
    setGallery(next);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }

  return (
    <AppShell>
      <TopBar
        title="Doodle Studio"
        right={
          <Link to="/dots">
            <ClayButton tone="accent" size="sm">
              🔢 Dots
            </ClayButton>
          </Link>
        }
      />

      <ClayCard className="mb-3 flex items-center justify-between gap-3 px-4 py-3">
        <p className="font-display text-sm font-extrabold">{idea}</p>
        <ClayButton
          size="sm"
          tone="secondary"
          onClick={() => setIdea(IDEAS[Math.floor(Math.random() * IDEAS.length)]!)}
        >
          🎲
        </ClayButton>
      </ClayCard>

      <div id="doodle-board" className="relative">
        <DrawBoard color={color} width={width} strokes={strokes} onChange={setStrokes} />
        {sticker && (
          <button
            aria-label="place sticker"
            className="absolute inset-0 z-10 cursor-crosshair"
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setStamps((s) => [
                ...s,
                { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, e: sticker },
              ]);
              setSticker(null);
            }}
          />
        )}
        {stamps.map((s, i) => (
          <span
            key={i}
            className="animate-pop pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-4xl"
            style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%` }}
          >
            {s.e}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {PALETTE.map((c) => (
          <button
            key={c}
            aria-label={`colour ${c}`}
            onClick={() => setColor(c)}
            className={cn(
              "clay-sm h-9 w-9 rounded-full transition-transform active:scale-90",
              color === c && "scale-110 ring-4 ring-foreground/15",
            )}
            style={{ background: c }}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-xs font-bold text-muted-foreground">Brush</span>
        <input
          type="range"
          min={4}
          max={34}
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          className="h-2 flex-1 accent-primary"
        />
        <span className="font-display text-sm font-extrabold">{width}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {STICKERS.map((s) => (
          <button
            key={s}
            onClick={() => setSticker(s)}
            className={cn(
              "clay-sm h-11 w-11 rounded-2xl bg-card text-xl transition-transform active:scale-90",
              sticker === s && "bg-warning",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-3">
        <ClayButton
          block
          tone="muted"
          onClick={() => {
            setStrokes([]);
            setStamps([]);
          }}
        >
          🧽 Clear
        </ClayButton>
        <ClayButton block tone="warning" onClick={save}>
          💾 Save art
        </ClayButton>
      </div>

      {gallery.length > 0 && (
        <>
          <h2 className="mt-6 mb-2 font-display text-xl font-extrabold">My Gallery</h2>
          <div className="grid grid-cols-3 gap-3">
            {gallery.map((a) => (
              <img
                key={a.id}
                src={a.data}
                alt={`Kid artwork: ${a.idea}`}
                loading="lazy"
                className="clay aspect-square w-full rounded-2xl bg-card object-cover"
              />
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
