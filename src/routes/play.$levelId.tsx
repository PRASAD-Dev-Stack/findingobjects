import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ClayButton, ClayCard } from "@/components/clay";
import { SceneBackdrop } from "@/components/scene-backdrop";

import { useProfile } from "@/hooks/use-profile";
import { TOTAL_LEVELS, buildScene, getLevel } from "@/lib/game-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/play/$levelId")({
  head: ({ params }) => ({
    meta: [
      { title: `Level ${params.levelId} — Finding an Objects` },
      {
        name: "description",
        content: `Find every hidden object in level ${params.levelId} before the timer runs out.`,
      },
      { property: "og:title", content: `Level ${params.levelId} — Finding an Objects` },
      {
        property: "og:description",
        content: "Tap the hidden cartoon objects before the clock runs out.",
      },
    ],
  }),
  component: Play,
});

function vibrate(ms: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(ms);
}

function Play() {
  const { levelId } = Route.useParams();
  const id = Math.min(Math.max(Number(levelId) || 1, 1), TOTAL_LEVELS);
  // Remount on level change so all progress state resets.
  return <PlayLevel key={id} id={id} />;
}

function PlayLevel({ id }: { id: number }) {
  const navigate = useNavigate();
  const { profile, completeLevel, recordWordAttempt, addCoins } = useProfile();
  const learn = profile?.learn ?? DEFAULT_LEARN;
  const { pickFact, wordFor } = useLearning();

  const level = useMemo(() => getLevel(id), [id]);
  const scene = useMemo(() => buildScene(level), [level]);

  const [found, setFound] = useState<string[]>([]);
  const [misses, setMisses] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintFor, setHintFor] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(level.timeLimit);

  const [shake, setShake] = useState(false);
  const [burst, setBurst] = useState<{ x: number; y: number; k: number } | null>(null);
  const burstKey = useRef(0);

  const [fact, setFact] = useState<ObjectFact | null>(null);
  const [challenge, setChallenge] = useState<{ glyph: string; name: string; word: string } | null>(
    null,
  );
  const [firstFact, setFirstFact] = useState(false);
  const factsShown = useRef(0);
  const foundSinceWord = useRef(0);
  const [learned, setLearned] = useState<LearnedEntry[]>([]);

  const done = found.length === scene.targets.length;
  const failed = timeLeft <= 0 && !done;

  useEffect(() => {
    if (done || timeLeft <= 0 || challenge) return;
    const t = window.setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => window.clearInterval(t);
  }, [done, timeLeft, challenge]);

  useEffect(() => {
    if (!done) return;
    const stars = misses + hintsUsed === 0 ? 3 : misses + hintsUsed <= 3 ? 2 : 1;
    completeLevel(id, stars, 20 + stars * 15);
    setLearned(learnedToday().slice(-3));
  }, [done, id, misses, hintsUsed, completeLevel]);

  const stars = misses + hintsUsed === 0 ? 3 : misses + hintsUsed <= 3 ? 2 : 1;
  const next = scene.targets.find((t) => !found.includes(t.id));

  const wordDifficulty: WordDifficulty = id > 400 ? "hard" : id > 120 ? "medium" : "easy";

  /** Enrichment after a successful find: fun fact, then optional spelling step. */
  function enrich(glyph: string) {
    const vocabOn = learn.vocabulary && learn.ageBand === "8+";
    foundSinceWord.current += 1;

    if (vocabOn && foundSinceWord.current >= 3) {
      const entry = wordFor(glyph);
      if (entry && entry.word.length >= 3) {
        foundSinceWord.current = 0;
        setChallenge({ glyph, ...entry });
        return;
      }
    }

    if (!learn.funFacts || factsShown.current >= 2) return;
    if (Math.random() > FACT_CHANCE[learn.factFrequency]) return;
    const picked = pickFact(glyph, seenFactIds());
    if (!picked) return;
    factsShown.current += 1;
    setFirstFact(factsShown.current === 1 && seenFactIds().length === 0);
    rememberFact({ id: picked.id, glyph: picked.glyph, name: picked.name, text: picked.text });
    setFact(picked);
  }

  function hit(objId: string, x: number, y: number, isTarget: boolean) {
    if (done || failed || challenge) return;
    if (isTarget && !found.includes(objId)) {
      burstKey.current += 1;
      setBurst({ x, y, k: burstKey.current });
      setFound((f) => [...f, objId]);
      setHintFor(null);
      vibrate(12);
      const glyph = scene.targets.find((t) => t.id === objId)?.glyph;
      if (glyph) enrich(glyph);
    } else {
      setMisses((m) => m + 1);
      setTimeLeft((s) => Math.max(0, s - 2));
      setShake(true);
      vibrate([8, 40, 8]);
      window.setTimeout(() => setShake(false), 350);
    }
  }


  return (
    <div className="scene-sky min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-5 pt-5">
        <header className="mb-3 flex items-center gap-2">
          <Link to="/levels">
            <ClayButton tone="muted" size="sm">
              ✕
            </ClayButton>
          </Link>
          <ClayCard className="flex flex-1 items-center justify-between px-3 py-2">
            <span className="font-display text-sm font-extrabold">
              Lv {level.id} · {level.chapterName}
            </span>
            <span
              className={cn(
                "font-display text-sm font-extrabold",
                timeLeft <= 10 && "text-destructive",
              )}
            >
              ⏱ {Math.max(0, timeLeft)}s
            </span>
          </ClayCard>
        </header>

        <div className="clay-inset mb-2 h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-success transition-all duration-300"
            style={{ width: `${(found.length / scene.targets.length) * 100}%` }}
          />
        </div>

        <div
          className={cn(
            "clay relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-card",
            shake && "animate-shake",
          )}
        >
          <SceneBackdrop theme={level.themeKey} />


          {scene.clutter.map((o) => (
            <SceneGlyph key={o.id} o={o} onTap={(x, y) => hit(o.id, x, y, false)} />
          ))}
          {scene.targets.map((o) => (
            <SceneGlyph
              key={o.id}
              o={o}
              found={found.includes(o.id)}
              hinted={hintFor === o.id}
              onTap={(x, y) => hit(o.id, x, y, true)}
            />
          ))}

          {burst && (
            <span
              key={burst.k}
              className="animate-burst pointer-events-none absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-success/60"
              style={{ left: `${burst.x * 100}%`, top: `${burst.y * 100}%` }}
            />
          )}

          {(done || failed) && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-foreground/40 p-6 backdrop-blur-sm">
              <ClayCard className="animate-pop w-full p-6 text-center">
                <div className="mb-1 text-5xl">{done ? "🏆" : "⌛"}</div>
                <h2 className="font-display text-2xl font-extrabold">
                  {done ? "Level Cleared!" : "Time's Up"}
                </h2>
                {done && (
                  <p className="my-2 text-3xl">
                    {["⭐", "⭐", "⭐"].map((s, i) => (
                      <span key={i} className={i < stars ? "" : "opacity-25"}>
                        {s}
                      </span>
                    ))}
                  </p>
                )}
                <p className="mb-4 text-sm font-semibold text-muted-foreground">
                  {found.length}/{scene.targets.length} found · {misses} misses · {hintsUsed} hints
                </p>
                <div className="flex gap-3">
                  <ClayButton
                    tone="muted"
                    block
                    onClick={() => navigate({ to: "/levels" })}
                  >
                    Map
                  </ClayButton>
                  <ClayButton
                    block
                    onClick={() =>
                      done
                        ? navigate({
                            to: "/play/$levelId",
                            params: { levelId: String(Math.min(id + 1, TOTAL_LEVELS)) },
                          })
                        : window.location.reload()
                    }
                  >
                    {done ? "Next" : "Retry"}
                  </ClayButton>
                </div>
              </ClayCard>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <ClayCard inset className="flex-1 overflow-x-auto p-3">
            <div className="flex gap-2">
              {scene.targets.map((t) => (
                <span
                  key={t.id}
                  className={cn(
                    "clay-sm flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card text-xl transition-all",
                    found.includes(t.id) && "scale-90 opacity-35 grayscale",
                  )}
                >
                  {t.glyph}
                </span>
              ))}
            </div>
          </ClayCard>
          <ClayButton
            tone="warning"
            className="h-14 w-14 shrink-0 !px-0 text-xl"
            disabled={!next || done || failed}
            onClick={() => {
              if (!next) return;
              setHintsUsed((h) => h + 1);
              setHintFor(next.id);
              window.setTimeout(() => setHintFor(null), 1800);
            }}
          >
            💡
          </ClayButton>
        </div>
      </div>
    </div>
  );
}

function SceneGlyph({
  o,
  found,
  hinted,
  onTap,
}: {
  o: { id: string; glyph: string; x: number; y: number; scale: number; rotation: number; camouflage: number };
  found?: boolean;
  hinted?: boolean;
  onTap: (x: number, y: number) => void;
}) {
  return (
    <button
      type="button"
      aria-label={found ? "found object" : "scene object"}
      onClick={() => onTap(o.x, o.y)}
      className={cn(
        "absolute -translate-x-1/2 -translate-y-1/2 select-none leading-none transition-all duration-300 active:scale-90",
        found && "pointer-events-none scale-125 opacity-0",
        hinted && "z-10 animate-pop drop-shadow-[0_0_14px_var(--color-warning)]",
      )}
      style={{
        left: `${o.x * 100}%`,
        top: `${o.y * 100}%`,
        fontSize: `${Math.max(28, o.scale * 40)}px`,
        transform: `translate(-50%,-50%) rotate(${o.rotation}deg)`,
        opacity: found ? 0 : 1 - o.camouflage * 0.3,
        filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.25))",
      }}

    >
      {o.glyph}
    </button>
  );
}
