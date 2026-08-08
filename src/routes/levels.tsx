import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, TopBar } from "@/components/app-shell";
import { ClayButton, ClayCard } from "@/components/clay";
import { useProfile } from "@/hooks/use-profile";
import { CHAPTER_THEMES, TOTAL_LEVELS, getLevel } from "@/lib/game-data";

export const Route = createFileRoute("/levels")({
  head: () => ({
    meta: [
      { title: "Level Map — Finding an Objects" },
      {
        name: "description",
        content: "Browse 999 hidden object levels across themed chapters and track your stars.",
      },
      { property: "og:title", content: "Level Map — Finding an Objects" },
      {
        property: "og:description",
        content: "999 levels across themed chapters, from Cozy House to the Master Vault.",
      },
    ],
  }),
  component: Levels,
});

const CHAPTER_COUNT = Math.ceil(TOTAL_LEVELS / 10);

function Levels() {
  const { profile } = useProfile();
  const [chapter, setChapter] = useState(1);
  const unlocked = profile?.unlocked ?? 1;
  const theme = CHAPTER_THEMES[(chapter - 1) % CHAPTER_THEMES.length]!;

  const levels = Array.from({ length: 10 }, (_, i) => (chapter - 1) * 10 + i + 1).filter(
    (id) => id <= TOTAL_LEVELS,
  );

  return (
    <AppShell>
      <TopBar title="Level Map" />

      <ClayCard className="mb-5 flex items-center gap-3 p-4">
        <ClayButton
          tone="muted"
          size="sm"
          disabled={chapter === 1}
          onClick={() => setChapter((c) => Math.max(1, c - 1))}
        >
          ◀
        </ClayButton>
        <div className="flex-1 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Chapter {chapter} / {CHAPTER_COUNT}
          </p>
          <p className="font-display text-xl font-extrabold">
            {theme.emoji} {theme.name}
          </p>
          <p className="text-xs font-semibold text-muted-foreground">{theme.mechanic}</p>
        </div>
        <ClayButton
          tone="muted"
          size="sm"
          disabled={chapter === CHAPTER_COUNT}
          onClick={() => setChapter((c) => Math.min(CHAPTER_COUNT, c + 1))}
        >
          ▶
        </ClayButton>
      </ClayCard>

      <div className="space-y-3">
        {levels.map((id, i) => {
          const level = getLevel(id);
          const locked = id > unlocked;
          const stars = profile?.stars_by_level[String(id)] ?? 0;
          return (
            <div
              key={id}
              className={i % 2 === 0 ? "pr-8" : "pl-8"}
              style={{ animation: `rise 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.03}s both` }}
            >
              <Link
                to="/play/$levelId"
                params={{ levelId: String(id) }}
                disabled={locked}
                className={locked ? "pointer-events-none" : ""}
              >
                <ClayCard
                  tone={locked ? "muted" : level.boss ? "primary" : "card"}
                  className="flex items-center gap-3 p-3"
                >
                  <div className="clay-inset flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background/40 font-display text-lg font-extrabold">
                    {locked ? "🔒" : level.boss ? "👑" : id}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base font-extrabold">
                      Level {id}
                      {level.boss ? " · Boss" : ""}
                    </p>
                    <p className="truncate text-xs font-semibold opacity-75">
                      {level.objectCount} objects · {level.timeLimit}s · diff{" "}
                      {level.difficultyScore}
                    </p>
                  </div>
                  <div className="text-sm">
                    {["⭐", "⭐", "⭐"].map((s, si) => (
                      <span key={si} className={si < stars ? "" : "opacity-25"}>
                        {s}
                      </span>
                    ))}
                  </div>
                </ClayCard>
              </Link>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
