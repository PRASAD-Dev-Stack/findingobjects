import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ClayButton, ClayCard } from "@/components/clay";
import { useProfile } from "@/hooks/use-profile";
import { TOTAL_LEVELS, getLevel } from "@/lib/game-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ObjectFinder Pro — Hidden Object Puzzle Game" },
      {
        name: "description",
        content:
          "Play 999 hidden object levels with claymorphic cartoon scenes, daily challenges and 4-player spotlight multiplayer.",
      },
      { property: "og:title", content: "ObjectFinder Pro — Hidden Object Puzzle Game" },
      {
        property: "og:description",
        content: "999 cartoon hidden-object levels plus real-time 4-player versus matches.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { profile } = useProfile();
  const nextLevel = profile?.unlocked ?? 1;
  const level = getLevel(Math.min(nextLevel, TOTAL_LEVELS));

  return (
    <AppShell>
      <div className="animate-rise">
        <div className="mb-6 flex items-center justify-between">
          <div className="clay flex items-center gap-2 rounded-2xl bg-card px-3 py-2">
            <span className="text-xl">🪙</span>
            <span className="font-display font-bold">{profile?.coins ?? "—"}</span>
          </div>
          <div className="clay flex items-center gap-2 rounded-2xl bg-card px-3 py-2">
            <span className="text-xl">⭐</span>
            <span className="font-display font-bold">{profile?.stars ?? 0}</span>
          </div>
        </div>

        <div className="mb-7 text-center">
          <div className="animate-float mb-2 text-7xl">🔍</div>
          <h1 className="font-display text-4xl font-extrabold leading-none">ObjectFinder</h1>
          <p className="font-display text-2xl font-bold text-primary">PRO</p>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            {TOTAL_LEVELS} levels of cartoon chaos
          </p>
        </div>

        <ClayCard className="mb-4 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Continue chapter {level.chapter}
          </p>
          <p className="font-display text-xl font-extrabold">{level.chapterName}</p>
          <p className="mb-3 text-sm font-semibold text-muted-foreground">
            Level {level.id} · {level.objectCount} objects · {level.timeLimit}s
          </p>
          <Link to="/play/$levelId" params={{ levelId: String(level.id) }}>
            <ClayButton block size="lg">
              ▶ Play
            </ClayButton>
          </Link>
        </ClayCard>

        <div className="grid grid-cols-2 gap-4">
          <Link to="/levels">
            <ClayCard tone="secondary" className="h-full p-4">
              <div className="text-3xl">🗺️</div>
              <p className="font-display text-lg font-extrabold">Level Map</p>
              <p className="text-xs font-semibold opacity-80">Chapters & stars</p>
            </ClayCard>
          </Link>
          <Link to="/multiplayer">
            <ClayCard tone="accent" className="h-full p-4">
              <div className="text-3xl">⚔️</div>
              <p className="font-display text-lg font-extrabold">Versus</p>
              <p className="text-xs font-semibold opacity-80">Up to 4 players</p>
            </ClayCard>
          </Link>
        </div>

        <ClayCard tone="warning" className="mt-4 flex items-center gap-3 p-4">
          <span className="text-3xl">🎁</span>
          <div className="flex-1">
            <p className="font-display text-lg font-extrabold">Daily Challenge</p>
            <p className="text-xs font-semibold opacity-80">Fresh puzzle every 24h</p>
          </div>
          <Link to="/play/$levelId" params={{ levelId: "777" }}>
            <ClayButton tone="card" size="sm">
              Go
            </ClayButton>
          </Link>
        </ClayCard>
      </div>
    </AppShell>
  );
}
