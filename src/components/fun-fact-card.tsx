import { useEffect } from "react";
import { speak, stopSpeaking } from "@/lib/speak";
import type { ObjectFact } from "@/lib/learning.functions";

/** Toast-style fact card. Never a modal — it must never feel like a wall. */
export function FunFactCard({
  fact,
  onDismiss,
  autoDismissMs = 4500,
  ttsEnabled = true,
  firstOfSession = false,
}: {
  fact: ObjectFact;
  onDismiss: () => void;
  autoDismissMs?: number;
  ttsEnabled?: boolean;
  firstOfSession?: boolean;
}) {
  useEffect(() => {
    speak(fact.text, ttsEnabled);
    const t = window.setTimeout(onDismiss, autoDismissMs);
    return () => {
      window.clearTimeout(t);
      stopSpeaking();
    };
  }, [fact.id, fact.text, autoDismissMs, ttsEnabled, onDismiss]);

  return (
    <div className="pointer-events-auto absolute inset-x-2 bottom-2 z-30">
      <button
        type="button"
        onClick={onDismiss}
        className="clay animate-slide-up flex w-full items-center gap-3 rounded-3xl bg-card p-3 text-left"
      >
        <span className="clay-inset flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-muted text-3xl">
          {fact.glyph}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="font-display text-sm font-extrabold">{fact.name}</span>
            {firstOfSession && (
              <span className="clay-sm rounded-full bg-success px-2 py-0.5 text-[10px] font-extrabold text-success-foreground">
                🌟 You're learning!
              </span>
            )}
          </span>
          <span className="block text-sm font-semibold text-muted-foreground">{fact.text}</span>
        </span>
        <span
          role="button"
          aria-label="replay narration"
          onClick={(e) => {
            e.stopPropagation();
            speak(fact.text, true);
          }}
          className="clay-sm flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card text-lg"
        >
          🔊
        </span>
      </button>
    </div>
  );
}
