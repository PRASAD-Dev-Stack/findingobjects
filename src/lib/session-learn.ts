// Local-first learning journal. Nothing here ever leaves the device (COPPA-safe).

export type LearnedEntry = { id: string; glyph: string; name: string; text: string };

const KEY = "ofp.learned";

function today() {
  return new Date().toISOString().slice(0, 10);
}

type Store = { date: string; entries: LearnedEntry[] };

function read(): Store {
  if (typeof window === "undefined") return { date: today(), entries: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Store) : null;
    if (!parsed || parsed.date !== today()) return { date: today(), entries: [] };
    return parsed;
  } catch {
    return { date: today(), entries: [] };
  }
}

export function learnedToday(): LearnedEntry[] {
  return read().entries;
}

export function seenFactIds(): string[] {
  return read().entries.map((e) => e.id);
}

export function rememberFact(entry: LearnedEntry) {
  if (typeof window === "undefined") return;
  const store = read();
  if (store.entries.some((e) => e.id === entry.id)) return;
  store.entries.push(entry);
  window.localStorage.setItem(KEY, JSON.stringify(store));
}
