import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, TopBar } from "@/components/app-shell";
import { ClayButton, ClayCard } from "@/components/clay";
import { AVATARS, useProfile } from "@/hooks/use-profile";
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
  const { profile, update } = useProfile();
  const [copied, setCopied] = useState(false);

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
