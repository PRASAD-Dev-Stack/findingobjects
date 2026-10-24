import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, TopBar } from "@/components/app-shell";
import { ClayButton, ClayCard } from "@/components/clay";
import {
  AVATARS,
  DEFAULT_LEARN,
  useProfile,
  type AgeBand,
  type FactFrequency,
} from "@/hooks/use-profile";
import { learnedToday } from "@/lib/session-learn";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — Finding an Objects" },
      {
        name: "description",
        content: "Your Player ID, avatar, coins and star collection in Finding an Objects.",
      },
      { property: "og:title", content: "Your Profile — Finding an Objects" },
      {
        property: "og:description",
        content: "Share your Player ID and invite friends to a versus match.",
      },
    ],
  }),
  component: Profile,
});

const BADGES = [
  { icon: "👁️", name: "Eagle Eye" },
  { icon: "🚫", name: "No Hints" },
  { icon: "⚔️", name: "MP Champ" },
  { icon: "🔥", name: "7-Day Streak" },
];

function Profile() {
  const { profile, update, updateLearn } = useProfile();
  const [copied, setCopied] = useState(false);
  const learn = profile?.learn ?? DEFAULT_LEARN;
  const [learnedList, setLearnedList] = useState(() =>
    typeof window === "undefined" ? [] : learnedToday(),
  );

  useEffect(() => {
    setLearnedList(learnedToday());
  }, [profile?.playerId]);

  return (
    <AppShell>
      <TopBar title="Profile" />

      <ClayCard className="mb-4 p-5 text-center">
        <div className="clay-inset mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-muted text-5xl">
          {profile?.avatar ?? "🦊"}
        </div>
        <input
          value={profile?.name ?? ""}
          onChange={(e) => update({ name: e.target.value })}
          className="clay-inset w-full rounded-2xl bg-muted px-4 py-2 text-center font-display text-lg font-extrabold outline-none"
          placeholder="Your name"
        />
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => update({ avatar: a })}
              className={cn(
                "clay-sm h-10 w-10 rounded-xl bg-card text-xl transition-transform active:scale-90",
                profile?.avatar === a && "clay-inset bg-primary",
              )}
            >
              {a}
            </button>
          ))}
        </div>
      </ClayCard>

      <ClayCard tone="secondary" className="mb-4 p-4">
        <p className="text-xs font-bold uppercase tracking-wide opacity-70">Your Player ID</p>
        <p className="font-display text-3xl font-extrabold tracking-widest">
          {profile?.playerId ?? "OF-••••••"}
        </p>
        <div className="mt-3 flex gap-3">
          <ClayButton
            tone="card"
            size="sm"
            block
            onClick={() => {
              if (!profile) return;
              void navigator.clipboard.writeText(profile.playerId);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? "Copied ✓" : "Copy"}
          </ClayButton>
          <ClayButton
            tone="card"
            size="sm"
            block
            onClick={() => {
              if (!profile) return;
              const text = `Play Finding an Objects with me! My Player ID: ${profile.playerId}`;
              if (navigator.share) void navigator.share({ text });
              else void navigator.clipboard.writeText(text);
            }}
          >
            Share
          </ClayButton>
        </div>
      </ClayCard>

      <div className="mb-4 grid grid-cols-3 gap-3">
        {[
          { icon: "⭐", value: profile?.stars ?? 0, label: "Stars" },
          { icon: "🪙", value: profile?.coins ?? 0, label: "Coins" },
          { icon: "💎", value: profile?.gems ?? 0, label: "Gems" },
        ].map((s) => (
          <ClayCard key={s.label} className="p-3 text-center">
            <div className="text-2xl">{s.icon}</div>
            <p className="font-display text-lg font-extrabold">{s.value}</p>
            <p className="text-[11px] font-bold text-muted-foreground">{s.label}</p>
          </ClayCard>
        ))}
      </div>

      <ClayCard className="mb-4 p-4">
        <p className="font-display text-lg font-extrabold">🧑‍🍼 Grown-up settings</p>
        <p className="mb-3 text-xs font-semibold text-muted-foreground">
          Learning extras stay on this device. Nothing about your child is ever sent anywhere.
        </p>

        <Row label="Age band" hint="Vocabulary Mode is suggested for 8+">
          <div className="flex gap-2">
            {(["3-5", "6-7", "8+"] as AgeBand[]).map((b) => (
              <button
                key={b}
                onClick={() => updateLearn({ ageBand: b })}
                className={cn(
                  "clay-sm rounded-xl bg-card px-3 py-1.5 text-xs font-extrabold",
                  learn.ageBand === b && "clay-inset bg-primary",
                )}
              >
                {b}
              </button>
            ))}
          </div>
        </Row>

        <Row label="Fun Facts" hint="A short fact pops up after some finds">
          <Toggle on={learn.funFacts} onClick={() => updateLearn({ funFacts: !learn.funFacts })} />
        </Row>

        <Row label="Fact frequency">
          <div className="flex gap-2">
            {(["low", "medium", "high"] as FactFrequency[]).map((f) => (
              <button
                key={f}
                onClick={() => updateLearn({ factFrequency: f })}
                className={cn(
                  "clay-sm rounded-xl bg-card px-3 py-1.5 text-xs font-extrabold capitalize",
                  learn.factFrequency === f && "clay-inset bg-secondary",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </Row>

        <Row label="Vocabulary Mode" hint="Spelling mini-step, age 8+ only">
          <Toggle
            on={learn.vocabulary}
            disabled={learn.ageBand !== "8+"}
            onClick={() => updateLearn({ vocabulary: !learn.vocabulary })}
          />
        </Row>

        <Row label="Read aloud" hint="Narrates facts and words">
          <Toggle
            on={learn.narration}
            onClick={() => updateLearn({ narration: !learn.narration })}
          />
        </Row>
      </ClayCard>

      {learnedList.length > 0 && (
        <ClayCard tone="muted" className="mb-4 p-4">
          <p className="mb-2 font-display text-lg font-extrabold">📚 What we learned today</p>
          <ul className="space-y-1">
            {learnedList.map((l) => (
              <li key={l.id} className="text-xs font-semibold text-muted-foreground">
                {l.glyph} <span className="text-foreground">{l.name}:</span> {l.text}
              </li>
            ))}
          </ul>
        </ClayCard>
      )}

      <p className="mb-2 font-display text-lg font-extrabold">Badges</p>
      <div className="grid grid-cols-4 gap-3">
        {BADGES.map((b) => (
          <ClayCard key={b.name} tone="muted" className="p-2 text-center">
            <div className="text-2xl opacity-40">{b.icon}</div>
            <p className="text-[10px] font-bold leading-tight">{b.name}</p>
          </ClayCard>
        ))}
      </div>
    </AppShell>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-foreground/5 py-3 first:border-0">
      <div className="min-w-0">
        <p className="font-display text-sm font-extrabold">{label}</p>
        {hint && <p className="text-[11px] font-semibold text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Toggle({
  on,
  onClick,
  disabled,
}: {
  on: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "clay-inset h-8 w-14 shrink-0 rounded-full p-1 transition-colors",
        on ? "bg-success" : "bg-muted",
        disabled && "opacity-40",
      )}
    >
      <span
        className={cn(
          "clay-sm block h-6 w-6 rounded-full bg-card transition-transform",
          on && "translate-x-6",
        )}
      />
    </button>
  );
}

