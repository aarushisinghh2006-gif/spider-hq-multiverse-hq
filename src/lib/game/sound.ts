import { useGame } from "./store";

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  c: AudioContext,
  freq: number,
  dur: number,
  type: OscillatorType = "square",
  vol = 0.06,
  delay = 0,
  slideTo?: number,
) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  const t0 = c.currentTime + delay;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export type SfxName =
  | "tap"
  | "hit"
  | "miss"
  | "tick"
  | "success"
  | "fail"
  | "levelup"
  | "unlock"
  | "explosion"
  | "whoosh";

export function sfx(name: SfxName) {
  if (useGame.getState().muted) return;
  const c = audio();
  if (!c) return;
  switch (name) {
    case "tap":
      tone(c, 520, 0.06, "square", 0.045);
      break;
    case "hit":
      tone(c, 660, 0.07, "square", 0.06);
      tone(c, 990, 0.09, "square", 0.05, 0.05);
      break;
    case "miss":
      tone(c, 220, 0.12, "sawtooth", 0.05, 0, 140);
      break;
    case "tick":
      tone(c, 880, 0.04, "sine", 0.04);
      break;
    case "success":
      [523, 659, 784, 1047].forEach((f, i) => tone(c, f, 0.14, "triangle", 0.07, i * 0.09));
      break;
    case "fail":
      [330, 262, 196].forEach((f, i) => tone(c, f, 0.18, "sawtooth", 0.06, i * 0.12));
      break;
    case "levelup":
      [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(c, f, 0.16, "triangle", 0.07, i * 0.07));
      break;
    case "unlock":
      tone(c, 784, 0.1, "triangle", 0.07);
      tone(c, 1175, 0.18, "triangle", 0.07, 0.09);
      break;
    case "explosion":
      tone(c, 120, 0.4, "sawtooth", 0.09, 0, 40);
      tone(c, 90, 0.5, "square", 0.07, 0.03, 30);
      break;
    case "whoosh":
      tone(c, 300, 0.18, "sine", 0.05, 0, 900);
      break;
  }
}