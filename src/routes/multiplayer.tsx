import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, TopBar } from "@/components/app-shell";
import { ClayButton, ClayCard } from "@/components/clay";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/multiplayer")({
  head: () => ({
    meta: [
      { title: "Versus Mode — ObjectFinder Pro" },
      {
        name: "description",
        content:
          "Invite up to 3 friends by Player ID and take turns under the 20-second spotlight countdown.",
      },
      { property: "og:title", content: "Versus Mode — ObjectFinder Pro" },
      {
        property: "og:description",
        content: "1v1, 1v1v1 or 4-player hidden object duels with turn-based spotlight rounds.",
      },
    ],
  }),
  component: Multiplayer,
});

type Invite = { value: string; status: "empty" | "invalid" | "valid" | "pending" | "accepted" };

const ID_RE = /^OF-[A-HJ-NP-Z2-9]{6}$/;

function Multiplayer() {
  const { profile } = useProfile();
  const [size, setSize] = useState(2);
  const [invites, setInvites] = useState<Invite[]>([{ value: "", status: "empty" }]);
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    setInvites((prev) =>
      Array.from({ length: size - 1 }, (_, i) => prev[i] ?? { value: "", status: "empty" }),
    );
    setSent(false);
  }, [size]);

  const duplicate = (v: string, i: number) =>
    v !== "" && invites.some((x, j) => j !== i && x.value.toUpperCase() === v.toUpperCase());

  const allValid =
    invites.length > 0 &&
    invites.every((x, i) => ID_RE.test(x.value.toUpperCase()) && !duplicate(x.value, i));

  // Invite flow: friends accept, then a 3-2-1 intro starts the match room.
  useEffect(() => {
    if (!sent) return;
    const timers = invites.map((_, i) =>
      window.setTimeout(
        () =>
          setInvites((prev) =>
            prev.map((x, j) => (j === i ? { ...x, status: "accepted" } : x)),
          ),
        1200 + i * 900,
      ),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [sent, invites.length]);

  const everyoneIn = sent && invites.every((x) => x.status === "accepted");

  useEffect(() => {
    if (!everyoneIn || countdown !== null) return;
    setCountdown(3);
  }, [everyoneIn, countdown]);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const t = window.setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 900);
    return () => window.clearTimeout(t);
  }, [countdown]);

  if (countdown !== null && countdown <= 0) {
    return <MatchRoom players={size} me={profile?.avatar ?? "🦊"} onExit={() => {
      setCountdown(null);
      setSent(false);
      setInvites((prev) => prev.map((x) => ({ ...x, status: "valid" })));
    }} />;
  }

  return (
    <AppShell>
      <TopBar title="Versus" />

      {countdown !== null && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/50 backdrop-blur-sm">
          <span key={countdown} className="animate-pop font-display text-8xl font-extrabold text-primary-foreground">
            {countdown}
          </span>
        </div>
      )}

      <ClayCard className="mb-4 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Your Player ID
        </p>
        <p className="font-display text-2xl font-extrabold tracking-widest">
          {profile?.playerId ?? "OF-••••••"}
        </p>
      </ClayCard>

      <p className="mb-2 font-display text-lg font-extrabold">Match size</p>
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[2, 3, 4].map((n) => (
          <button key={n} onClick={() => setSize(n)}>
            <ClayCard
              tone={size === n ? "primary" : "card"}
              inset={size === n}
              className="p-3 text-center"
            >
              <p className="font-display text-xl font-extrabold">{n}P</p>
              <p className="text-[11px] font-bold opacity-75">
                {n === 2 ? "1v1" : n === 3 ? "1v1v1" : "1v1v1v1"}
              </p>
            </ClayCard>
          </button>
        ))}
      </div>

      <p className="mb-2 font-display text-lg font-extrabold">
        Friend Player ID{invites.length > 1 ? "s" : ""}
      </p>
      <div className="space-y-3">
        {invites.map((inv, i) => {
          const upper = inv.value.toUpperCase();
          const dupe = duplicate(inv.value, i);
          const valid = ID_RE.test(upper) && !dupe;
          return (
            <div key={i}>
              <div className="flex items-center gap-2">
                <input
                  value={inv.value}
                  disabled={sent}
                  placeholder="OF-XXXXXX"
                  onChange={(e) =>
                    setInvites((prev) =>
                      prev.map((x, j) =>
                        j === i
                          ? { ...x, value: e.target.value.toUpperCase(), status: "empty" }
                          : x,
                      ),
                    )
                  }
                  className="clay-inset w-full rounded-2xl bg-card px-4 py-3 font-display text-lg font-extrabold tracking-widest outline-none disabled:opacity-60"
                />
                <span className="w-8 text-center text-xl">
                  {inv.status === "accepted" ? "✅" : sent ? "⏳" : valid ? "👤" : ""}
                </span>
              </div>
              {inv.value !== "" && !valid && (
                <p className="mt-1 pl-2 text-xs font-bold text-destructive">
                  {dupe ? "Duplicate Player ID" : "Player ID not found"}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <ClayButton
        block
        size="lg"
        className="mt-5"
        disabled={!allValid || sent}
        onClick={() => setSent(true)}
      >
        {sent ? "Waiting for players…" : `Send invite${invites.length > 1 ? "s" : ""}`}
      </ClayButton>

      <ClayCard tone="muted" className="mt-4 p-4 text-xs font-semibold leading-relaxed">
        Each turn gives one player a 20-second spotlight. Others watch live and plan ahead. Found
        objects lock instantly for everyone.
      </ClayCard>
    </AppShell>
  );
}

const SEATS = ["🦊", "🐼", "🐸", "🦄"];

function MatchRoom({
  players,
  me,
  onExit,
}: {
  players: number;
  me: string;
  onExit: () => void;
}) {
  const [turn, setTurn] = useState(0);
  const [timer, setTimer] = useState(20);

  useEffect(() => {
    const t = window.setInterval(() => {
      setTimer((s) => {
        if (s <= 1) {
          setTurn((p) => (p + 1) % players);
          return 20;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [players]);

  return (
    <AppShell nav={false}>
      <div className="mb-4 flex items-center gap-2">
        <ClayButton tone="muted" size="sm" onClick={onExit}>
          ✕
        </ClayButton>
        <ClayCard className="flex-1 px-3 py-2 text-center font-display text-sm font-extrabold">
          {turn === 0 ? "Your turn — find an object!" : `Player ${turn + 1}'s turn`}
        </ClayCard>
      </div>

      <div className="mb-4 flex justify-around">
        {Array.from({ length: players }, (_, i) => (
          <div key={i} className="text-center">
            <div
              className={cn(
                "clay relative flex h-16 w-16 items-center justify-center rounded-full bg-card text-3xl transition-all",
                turn === i && "ring-4 ring-primary",
              )}
            >
              {i === 0 ? me : SEATS[i]}
              {turn === i && (
                <span className="absolute -bottom-2 rounded-full bg-primary px-2 py-0.5 font-display text-[11px] font-extrabold text-primary-foreground">
                  {timer}s
                </span>
              )}
            </div>
            <p className="mt-2 text-[11px] font-bold text-muted-foreground">
              {i === 0 ? "You" : `P${i + 1}`}
            </p>
          </div>
        ))}
      </div>

      <ClayCard inset className="relative aspect-[3/4] w-full overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,var(--color-secondary),transparent_60%),radial-gradient(circle_at_70%_75%,var(--color-accent),transparent_55%)]" />
        {turn !== 0 && (
          <div className="absolute inset-x-0 bottom-0 z-10 bg-foreground/40 p-3 text-center font-display text-sm font-extrabold text-background backdrop-blur-sm">
            🔒 Waiting for your turn
          </div>
        )}
        <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm font-bold text-muted-foreground">
          Shared scene syncs here once the realtime match backend is connected.
        </p>
      </ClayCard>
    </AppShell>
  );
}
