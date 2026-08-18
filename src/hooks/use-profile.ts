import { useCallback, useEffect, useState } from "react";
import { makePlayerId } from "@/lib/game-data";

export type FactFrequency = "low" | "medium" | "high";
export type AgeBand = "3-5" | "6-7" | "8+";

export type LearnSettings = {
  funFacts: boolean;
  vocabulary: boolean;
  factFrequency: FactFrequency;
  narration: boolean;
  ageBand: AgeBand;
};

export type WordMastery = { attempts: number; correctFirstTry: number; masteryScore: number };

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
  learn: LearnSettings;
  /** glyph -> local-only mastery record (never leaves the device). */
  word_mastery: Record<string, WordMastery>;
};

const KEY = "ofp.profile.v1";

export const AVATARS = ["🦊", "🐼", "🐸", "🦄", "🐙", "🐯", "🦉", "🐧", "🐨", "🦁"];

export const DEFAULT_LEARN: LearnSettings = {
  funFacts: true,
  vocabulary: false,
  factFrequency: "medium",
  narration: true,
  ageBand: "6-7",
};

/** Chance a found object shows a fun fact. */
export const FACT_CHANCE: Record<FactFrequency, number> = { low: 0.15, medium: 0.3, high: 0.5 };

function createProfile(): PlayerProfile {
  return {
    playerId: makePlayerId(),
    name: "Rookie Finder",
    avatar: "🦊",
    coins: 250,
    gems: 5,
    stars: 0,
    unlocked_levels: [1],
    stars_by_level: {},
    learn: { ...DEFAULT_LEARN },
    word_mastery: {},
  };
}

/** Client-only profile store. Reads storage after hydration to avoid SSR mismatch. */
export function useProfile() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<PlayerProfile>;
        setProfile({
          ...createProfile(),
          ...parsed,
          learn: { ...DEFAULT_LEARN, ...(parsed.learn ?? {}) },
          word_mastery: parsed.word_mastery ?? {},
        });
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

  const updateLearn = useCallback((patch: Partial<LearnSettings>) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const next = { ...prev, learn: { ...prev.learn, ...patch } };
      window.localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  /** Spaced-repetition-lite: track spelling attempts locally, never on a server. */
  const recordWordAttempt = useCallback((glyph: string, correctFirstTry: boolean) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const cur = prev.word_mastery[glyph] ?? { attempts: 0, correctFirstTry: 0, masteryScore: 0 };
      const attempts = cur.attempts + 1;
      const correct = cur.correctFirstTry + (correctFirstTry ? 1 : 0);
      const next: PlayerProfile = {
        ...prev,
        word_mastery: {
          ...prev.word_mastery,
          [glyph]: {
            attempts,
            correctFirstTry: correct,
            masteryScore: Math.round((correct / attempts) * 100) / 100,
          },
        },
      };
      window.localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const completeLevel = useCallback((levelId: number, stars: number, coins: number) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const best = Math.max(prev.stars_by_level[String(levelId)] ?? 0, stars);
      const byLevel = { ...prev.stars_by_level, [String(levelId)]: best };
      const next: PlayerProfile = {
        ...prev,
        stars_by_level: byLevel,
        stars: Object.values(byLevel).reduce((a, b) => a + b, 0),
        coins: prev.coins + coins,
        unlocked_levels: prev.unlocked_levels.includes(levelId + 1)
          ? prev.unlocked_levels
          : [...prev.unlocked_levels, levelId + 1],
      };
      window.localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addCoins = useCallback((coins: number) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const next = { ...prev, coins: prev.coins + coins };
      window.localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { profile, update, updateLearn, completeLevel, recordWordAttempt, addCoins };
}
