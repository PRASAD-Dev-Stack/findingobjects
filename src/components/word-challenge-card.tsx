import { useEffect, useMemo, useState } from "react";
import { ClayButton } from "@/components/clay";
import { speak } from "@/lib/speak";
import { cn } from "@/lib/utils";

export type WordDifficulty = "easy" | "medium" | "hard";

const CONFIG: Record<WordDifficulty, { blanks: number; tray: number }> = {
  easy: { blanks: 1, tray: 6 },
  medium: { blanks: 3, tray: 9 },
  hard: { blanks: 5, tray: 12 },
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** No timers, no penalties — literacy practice should never feel stressful. */
export function WordChallengeCard({
  glyph,
  name,
  word,
  difficulty,
  ttsEnabled = true,
  onComplete,
  onSkip,
}: {
  glyph: string;
  name: string;
  word: string;
  difficulty: WordDifficulty;
  ttsEnabled?: boolean;
  onComplete: (wasCorrectFirstTry: boolean) => void;
  onSkip: () => void;
}) {
  const cfg = CONFIG[difficulty];

  const { blankIdx, tray } = useMemo(() => {
    const idx: number[] = [];
    const count = Math.min(cfg.blanks, Math.max(1, word.length - 1));
    while (idx.length < count) {
      const i = Math.floor(Math.random() * word.length);
      if (!idx.includes(i)) idx.push(i);
    }
    idx.sort((a, b) => a - b);
    const letters = idx.map((i) => word[i]!);
    while (letters.length < cfg.tray) {
      letters.push(ALPHABET[Math.floor(Math.random() * 26)]!);
    }
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j]!, letters[i]!];
    }
    return { blankIdx: idx, tray: letters };
  }, [word, cfg.blanks, cfg.tray]);

  const [filled, setFilled] = useState<(string | null)[]>(() => blankIdx.map(() => null));
  const [tries, setTries] = useState(0);
  const [state, setState] = useState<"playing" | "correct" | "revealed">("playing");

  useEffect(() => {
    speak(name, ttsEnabled);
  }, [name, ttsEnabled]);

  const nextSlot = filled.findIndex((f) => f === null);
  const shown = word
    .split("")
    .map((ch, i) => {
      const b = blankIdx.indexOf(i);
      if (b === -1) return ch;
      if (state === "revealed" || state === "correct") return ch;
      return filled[b] ?? "_";
    })
    .join("");

  function tapLetter(letter: string) {
    if (state !== "playing" || nextSlot === -1) return;
    const next = [...filled];
    next[nextSlot] = letter;
    setFilled(next);
    if (next.every((n) => n !== null)) {
      const ok = blankIdx.every((wIdx, i) => next[i] === word[wIdx]);
      const attempt = tries + 1;
      setTries(attempt);
      if (ok) {
        setState("correct");
        speak("Great job!", ttsEnabled);
        window.setTimeout(() => onComplete(attempt === 1), 1400);
      } else if (attempt >= 2) {
        setState("revealed");
        speak(`So close! It's ${name}.`, ttsEnabled);
        window.setTimeout(() => onComplete(false), 2200);
      } else {
        setFilled(blankIdx.map(() => null));
      }
    }
  }

  return (
    <div className="pointer-events-auto absolute inset-x-2 bottom-2 z-30">
      <div className="clay animate-slide-up rounded-3xl bg-card p-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="clay-inset flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-2xl">
            {glyph}
          </span>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Spell the word
            </p>
            <p className="font-display text-2xl font-extrabold tracking-[0.25em]">{shown}</p>
          </div>
          <button
            aria-label="say the word"
            onClick={() => speak(name, true)}
            className="clay-sm h-10 w-10 rounded-xl bg-card text-lg"
          >
            🔊
          </button>
        </div>

        {state === "playing" ? (
          <div className="flex flex-wrap gap-2">
            {tray.map((l, i) => (
              <button
                key={`${l}-${i}`}
                onClick={() => tapLetter(l)}
                className="clay-sm h-11 w-11 rounded-xl bg-card font-display text-lg font-extrabold transition-transform active:scale-90"
              >
                {l}
              </button>
            ))}
          </div>
        ) : (
          <p
            className={cn(
              "animate-pop font-display text-lg font-extrabold",
              state === "correct" ? "text-success" : "text-warning",
            )}
          >
            {state === "correct" ? "🎉 Perfect spelling!" : `So close! It's ${word}.`}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">
            {tries > 0 && state === "playing" ? "Try once more — take your time." : "No rush 💙"}
          </p>
          <ClayButton tone="muted" size="sm" onClick={onSkip}>
            Skip
          </ClayButton>
        </div>
      </div>
    </div>
  );
}
