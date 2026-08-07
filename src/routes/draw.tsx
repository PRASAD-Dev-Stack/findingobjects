import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, TopBar } from "@/components/app-shell";
import { ClayButton, ClayCard } from "@/components/clay";
import { DrawBoard } from "@/components/draw-board";
import {
  LETTERS,
  NUMBERS,
  ROMAN,
  SHAPES,
  SMALL_LETTERS,
  drawPrompt,
  scoreDrawing,
  scoreMessage,
  type Stroke,
} from "@/lib/drawing";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/draw")({
  head: () => ({
    meta: [
      { title: "Trace & Learn — Letters, Numbers, Roman & Shapes" },
      {
        name: "description",
        content:
          "A kids whiteboard for tracing capital and small letters, numbers up to 999, Roman numerals and shapes — scored from 10% to 100%.",
      },
      { property: "og:title", content: "Trace & Learn — ObjectFinder Pro" },
      {
        property: "og:description",
        content: "Trace A-Z, a-z, 0-999, Roman numerals and pictures with instant accuracy scoring.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DrawPage,
});

const TABS = [
  { key: "letters", label: "A-Z", list: LETTERS, emoji: "🔤" },
  { key: "small", label: "a-z", list: SMALL_LETTERS, emoji: "🔡" },
  { key: "numbers", label: "0-999", list: NUMBERS, emoji: "🔢" },
  { key: "roman", label: "Roman", list: ROMAN, emoji: "🏛️" },
  { key: "shapes", label: "Draw", list: SHAPES, emoji: "🎨" },
] as const;

const INK = ["#2b2b45", "#ef476f", "#118ab2", "#06d6a0", "#ffb703", "#8338ec"];
const PAGE = 50;

function DrawPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("letters");
  const [index, setIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [ghost, setGhost] = useState(true);
  const [color, setColor] = useState(INK[0]!);

  const list = TABS.find((t) => t.key === tab)!.list;
  const prompt = list[index % list.length]!;
  const pages = Math.ceil(list.length / PAGE);
  const pageItems = list.slice(page * PAGE, page * PAGE + PAGE);


  const guide = useMemo(
    () =>
      ghost
        ? (ctx: CanvasRenderingContext2D, size: number) => {
            ctx.strokeStyle = "rgba(120,120,160,0.28)";
            ctx.setLineDash([10, 12]);
            drawPrompt(ctx, prompt, size, size * 0.05);
          }
        : undefined,
    [ghost, prompt],
  );

  const reset = (nextIndex?: number) => {
    if (nextIndex !== undefined) setIndex(nextIndex);
    setStrokes([]);
    setScore(null);
  };

  const msg = score !== null ? scoreMessage(score) : null;

  return (
    <AppShell>
      <TopBar
        title="Trace & Learn"
        right={
          <div className="flex gap-2">
            <Link to="/paint">
              <ClayButton tone="secondary" size="sm">
                🎨 Paint
              </ClayButton>
            </Link>
            <Link to="/doodle">
              <ClayButton tone="accent" size="sm">
                🖍️
              </ClayButton>
            </Link>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <ClayButton
            key={t.key}
            size="sm"
            tone={tab === t.key ? "primary" : "muted"}
            className="flex-1"
            onClick={() => {
              setTab(t.key);
              setPage(0);
              reset(0);
            }}
          >
            {t.emoji} {t.label}
          </ClayButton>
        ))}
      </div>


      <ClayCard className="mb-3 flex items-center justify-between px-4 py-3">
        <div>
          <p className="font-display text-2xl font-extrabold leading-none">{prompt.label}</p>
          <p className="text-xs font-semibold text-muted-foreground">{prompt.hint}</p>
        </div>
        <ClayButton size="sm" tone={ghost ? "secondary" : "muted"} onClick={() => setGhost((g) => !g)}>
          {ghost ? "👀 Guide on" : "🙈 Guide off"}
        </ClayButton>
      </ClayCard>

      <DrawBoard
        color={color}
        width={14}
        strokes={strokes}
        onChange={(s) => {
          setStrokes(s);
          setScore(null);
        }}
        guide={guide}
      />

      <div className="mt-3 flex items-center gap-2">
        {INK.map((c) => (
          <button
            key={c}
            aria-label={`ink ${c}`}
            onClick={() => setColor(c)}
            className={cn(
              "clay-sm h-9 w-9 rounded-full transition-transform active:scale-90",
              color === c && "scale-110 ring-4 ring-foreground/15",
            )}
            style={{ background: c }}
          />
        ))}
        <ClayButton
          size="sm"
          tone="muted"
          className="ml-auto"
          onClick={() => setStrokes((s) => s.slice(0, -1))}
        >
          ↩︎
        </ClayButton>
        <ClayButton size="sm" tone="muted" onClick={() => reset()}>
          🧽
        </ClayButton>
      </div>

      <div className="mt-3 flex gap-3">
        <ClayButton
          block
          tone="warning"
          onClick={() => setScore(scoreDrawing(prompt, strokes))}
          disabled={!strokes.length}
        >
          ✅ Check my drawing
        </ClayButton>
        <ClayButton
          tone="secondary"
          onClick={() => reset((index + 1) % list.length)}
          className="shrink-0"
        >
          Next ➜
        </ClayButton>
      </div>

      {msg && (
        <ClayCard className="animate-pop mt-4 p-5 text-center">
          <div className="text-4xl">{msg.emoji}</div>
          <p className="font-display text-4xl font-extrabold">{score}% accurate</p>
          <div className="clay-inset my-3 h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-success transition-all duration-500"
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">{msg.text}</p>
        </ClayCard>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {list.map((p, i) => (
          <button
            key={p.id}
            onClick={() => reset(i)}
            className={cn(
              "clay-sm h-10 w-10 rounded-xl bg-card font-display text-sm font-extrabold transition-transform active:scale-90",
              i === index && "bg-primary text-primary-foreground",
            )}
          >
            {p.glyph ?? p.label.slice(0, 2)}
          </button>
        ))}
      </div>
    </AppShell>
  );
}
