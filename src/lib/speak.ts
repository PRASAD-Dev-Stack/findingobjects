/** Tiny browser text-to-speech helper. No network, no data leaves the device. */
export function speak(text: string, enabled = true) {
  if (!enabled || typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  try {
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.9;
    utter.pitch = 1.15;
    synth.speak(utter);
  } catch {
    /* speech is a nice-to-have; never break gameplay */
  }
}

export function stopSpeaking() {
  if (typeof window === "undefined") return;
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
}
