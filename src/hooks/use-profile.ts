import { useCallback, useEffect, useState } from "react";
import { makePlayerId } from "@/lib/game-data";

export type PlayerProfile = {
  playerId: string;
  name: string;
  avatar: string;
  coins: number;
  gems: number;
  stars: number;
  /** Explicitly unlocked level ids (chapter openers are always playable). */
  unlocked_levels: number[];
  stars_by_level: Record<string, number>;
};

const KEY = "ofp.profile.v1";

export const AVATARS = ["🦊", "🐼", "🐸", "🦄", "🐙", "🐯", "🦉", "🐧", "🐨", "🦁"];

function createProfile(): PlayerProfile {
  return {
    playerId: makePlayerId(),
    name: "Rookie Finder",
    avatar: "🦊",
    coins: 250,
    gems: 5,
    stars: 0,
    unlocked: 1,
    stars_by_level: {},
  };
}

/** Client-only profile store. Reads storage after hydration to avoid SSR mismatch. */
export function useProfile() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      try {
        setProfile({ ...createProfile(), ...(JSON.parse(raw) as PlayerProfile) });
        return;
      } catch {
        /* fall through to a fresh profile */
      }
    }
    const fresh = createProfile();
    window.localStorage.setItem(KEY, JSON.stringify(fresh));
    setProfile(fresh);
  }, []);

  const update = useCallback((patch: Partial<PlayerProfile>) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      window.localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const completeLevel = useCallback(
    (levelId: number, stars: number, coins: number) => {
      setProfile((prev) => {
        if (!prev) return prev;
        const best = Math.max(prev.stars_by_level[String(levelId)] ?? 0, stars);
        const byLevel = { ...prev.stars_by_level, [String(levelId)]: best };
        const next: PlayerProfile = {
          ...prev,
          stars_by_level: byLevel,
          stars: Object.values(byLevel).reduce((a, b) => a + b, 0),
          coins: prev.coins + coins,
          unlocked: Math.max(prev.unlocked, levelId + 1),
        };
        window.localStorage.setItem(KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  return { profile, update, completeLevel };
}
