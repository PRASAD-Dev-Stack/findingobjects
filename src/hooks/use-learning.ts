import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { getLearningContent, type ObjectFact } from "@/lib/learning.functions";

/**
 * Learning content (fun facts + vocabulary words) is fetched from Lovable Cloud
 * once per session and cached, so gameplay never waits on the network.
 */
export function useLearning() {
  const { data, isLoading } = useQuery({
    queryKey: ["learning-content"],
    queryFn: () => getLearningContent(),
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });

  const facts = useMemo(() => data?.facts ?? [], [data]);

  const byGlyph = useMemo(() => {
    const map = new Map<string, ObjectFact[]>();
    for (const f of facts) {
      const list = map.get(f.glyph) ?? [];
      list.push(f);
      map.set(f.glyph, list);
    }
    return map;
  }, [facts]);

  /** A fact for this glyph that has not been seen yet this session. */
  const pickFact = useCallback(
    (glyph: string, seenIds: string[]): ObjectFact | null => {
      const list = byGlyph.get(glyph);
      if (!list || list.length === 0) return null;
      const fresh = list.filter((f) => !seenIds.includes(f.id));
      const pool = fresh.length > 0 ? fresh : list;
      return pool[Math.floor(Math.random() * pool.length)] ?? null;
    },
    [byGlyph],
  );

  /** Spelling word for a glyph, derived from its stored name. */
  const wordFor = useCallback(
    (glyph: string) => {
      const entry = byGlyph.get(glyph)?.[0];
      if (!entry) return null;
      return { name: entry.name, word: entry.name.replace(/[^A-Za-z]/g, "").toUpperCase() };
    },
    [byGlyph],
  );

  return { facts, byGlyph, pickFact, wordFor, isLoading, ready: facts.length > 0 };
}
