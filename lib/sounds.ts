// Web Audio API sound effects — no external files required.
// All sounds are synthesised programmatically and kept subtle.

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!_ctx) _ctx = new AudioContext();
    if (_ctx.state === "suspended") _ctx.resume().catch(() => {});
    return _ctx;
  } catch {
    return null;
  }
}

export type SoundType = "flip" | "correct" | "hard";

export function playSound(type: SoundType, muted = false): void {
  if (muted) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const t = ctx.currentTime;

    switch (type) {
      case "flip":
        // Soft paper-whoosh: quick freq sweep downward
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.08);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.start(t);
        osc.stop(t + 0.08);
        break;

      case "correct":
        // Pleasant upward tone — "ding"
        osc.type = "triangle";
        osc.frequency.setValueAtTime(520, t);
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.12);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
        break;

      case "hard":
        // Low soft thud
        osc.type = "sine";
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.1);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.start(t);
        osc.stop(t + 0.12);
        break;
    }
  } catch {
    // Silently ignore — Web Audio may be blocked by browser policy
  }
}

export function getMutedPref(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("practice_muted") === "1";
}

export function setMutedPref(muted: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("practice_muted", muted ? "1" : "0");
}
