// The Multiverse Trial — tournament config, question generators, scoring and rival simulation.

export type PowerId = "spider-sense" | "web-blast" | "dimension-shift" | "spider-vision";

export interface PowerDef {
  id: PowerId;
  name: string;
  emoji: string;
  desc: string;
}

export const POWERS: PowerDef[] = [
  { id: "spider-sense", name: "Spider-Sense", emoji: "🕸️", desc: "Reveal a hint" },
  { id: "web-blast", name: "Web Blast", emoji: "⚡", desc: "Freeze the timer 5s" },
  { id: "dimension-shift", name: "Dimension Shift", emoji: "🌀", desc: "Skip one challenge" },
  { id: "spider-vision", name: "Spider Vision", emoji: "👁️", desc: "Remove two wrong options" },
];

export type RoundKind = "pattern" | "logic" | "chaos" | "memory" | "final";

export interface RoundDef {
  n: number;
  name: string;
  subtitle: string;
  env: string;
  envEmoji: string;
  kind: RoundKind;
  duration: number;
  playersIn: number;
  playersOut: number;
  /** Score a strong rival is expected to reach — drives the live leaderboard pace. */
  pace: number;
  /** Tailwind gradient classes for the round environment. */
  bg: string;
  brief: string[];
}

export const ROUNDS: RoundDef[] = [
  {
    n: 1,
    name: "Spider-Sense",
    subtitle: "Pattern detection under pressure",
    env: "Spider HQ",
    envEmoji: "🕷️",
    kind: "pattern",
    duration: 75,
    playersIn: 100,
    playersOut: 50,
    pace: 2600,
    bg: "from-primary/20 via-background to-background",
    brief: [
      "A symbol sequence flashes up — pick the missing glyph.",
      "Speed matters: answer fast for bonus Hero Score.",
      "Patterns get longer and trickier every level.",
    ],
  },
  {
    n: 2,
    name: "Multiverse Breach",
    subtitle: "Logic puzzles at portal speed",
    env: "Multiverse Portal",
    envEmoji: "🌌",
    kind: "logic",
    duration: 80,
    playersIn: 50,
    playersOut: 20,
    pace: 2900,
    bg: "from-accent/20 via-background to-background",
    brief: [
      "Portals are destabilising — solve the breach maths.",
      "Pure logic, no fandom trivia required.",
      "Wrong calls cost a life and 50 points.",
    ],
  },
  {
    n: 3,
    name: "Web of Chaos",
    subtitle: "Reaction, accuracy, decisions",
    env: "New York Rooftops",
    envEmoji: "🏙️",
    kind: "chaos",
    duration: 40,
    playersIn: 20,
    playersOut: 5,
    pace: 3200,
    bg: "from-gold/20 via-background to-background",
    brief: [
      "🟢 Hero +100 · 🕸️ Bonus +250",
      "🔴 Villain decoy −100 · 💀 Trap costs 3 seconds",
      "Tap fast, but tap the right targets.",
    ],
  },
  {
    n: 4,
    name: "Spider-Sense Overload",
    subtitle: "Semi-final memory gauntlet",
    env: "Spider-Dimension",
    envEmoji: "🕸️",
    kind: "memory",
    duration: 90,
    playersIn: 5,
    playersOut: 2,
    pace: 3400,
    bg: "from-accent/25 via-primary/10 to-background",
    brief: [
      "A burst of symbols appears — then vanishes.",
      "Answer how many of the target symbol you saw.",
      "Sequences grow longer each level.",
    ],
  },
  {
    n: 5,
    name: "The Multiverse Collapse",
    subtitle: "Final — logic, reaction, memory",
    env: "Collapsing Multiverse",
    envEmoji: "💥",
    kind: "final",
    duration: 120,
    playersIn: 2,
    playersOut: 1,
    pace: 4200,
    bg: "from-destructive/25 via-primary/15 to-background",
    brief: [
      "Two minutes. Three challenges. One title.",
      "🧠 Logic → ⚡ Reaction → 🕸️ Memory",
      "Highest Final Hero Score becomes the Ultimate Spider-Hero.",
    ],
  },
];

export const MAX_LIVES = 3;

/* ---------------------------------- scoring --------------------------------- */

export interface ScoreDelta {
  points: number;
  base: number;
  speedBonus: number;
  comboBonus: number;
  label: string;
}

export function scoreCorrect(ms: number, streak: number): ScoreDelta {
  const base = 100;
  const speedBonus = ms < 1500 ? 100 : ms < 3000 ? 50 : 0;
  const comboBonus = streak >= 10 ? 500 : streak >= 5 ? 250 : streak >= 3 ? 100 : 0;
  const label =
    streak >= 10
      ? "SPIDER-SENSE MAXIMUM!"
      : streak >= 5
        ? `🔥 ${streak} HIT COMBO`
        : streak >= 3
          ? `🔥 ${streak} HIT COMBO`
          : speedBonus === 100
            ? "LIGHTNING FAST!"
            : "CORRECT";
  return { points: base + speedBonus + comboBonus, base, speedBonus, comboBonus, label };
}

export const WRONG_PENALTY = 50;

export function timeBonus(secondsLeft: number): number {
  return Math.max(0, Math.floor(secondsLeft / 5)) * 20;
}

/* ---------------------------------- rivals ---------------------------------- */

const RIVAL_NAMES = [
  "Rahul", "Ananya", "Riya", "Karan", "Meera", "Dev", "Ishaan", "Tara", "Kabir", "Naina",
  "Arjun", "Sara", "Vivaan", "Zoya", "Aditya", "Kiara", "Rohan", "Diya", "Yash", "Anika",
  "Nikhil", "Pari", "Aryan", "Mira", "Veer", "Sana", "Rudra", "Aisha", "Om", "Nita",
];

export interface Rival {
  name: string;
  skill: number;
}

export function makeRivals(count: number, seedBase: number): Rival[] {
  const out: Rival[] = [];
  for (let i = 0; i < count; i++) {
    const seed = Math.sin((i + 1) * 12.9898 + seedBase * 78.233) * 43758.5453;
    const frac = seed - Math.floor(seed);
    out.push({
      name: `${RIVAL_NAMES[i % RIVAL_NAMES.length]}${i >= RIVAL_NAMES.length ? ` ${Math.floor(i / RIVAL_NAMES.length) + 1}` : ""}`,
      skill: 0.45 + frac * 0.95,
    });
  }
  return out.sort((a, b) => b.skill - a.skill);
}

/** Rival score at a given round progress (0..1). */
export function rivalScore(r: Rival, progress: number, pace: number): number {
  const wobble = 1 + 0.06 * Math.sin(progress * 9 + r.skill * 20);
  return Math.round(pace * r.skill * Math.min(1, progress) * wobble);
}

export interface Standing {
  name: string;
  score: number;
  you: boolean;
}

export function standings(
  rivals: Rival[],
  progress: number,
  pace: number,
  you: { name: string; score: number },
): { board: Standing[]; rank: number; cutoffScore: number; qualified: boolean } {
  const board: Standing[] = rivals.map((r) => ({
    name: r.name,
    score: rivalScore(r, progress, pace),
    you: false,
  }));
  board.push({ name: you.name, score: you.score, you: true });
  board.sort((a, b) => b.score - a.score);
  const rank = board.findIndex((b) => b.you) + 1;
  return { board, rank, cutoffScore: 0, qualified: false };
}

/* ------------------------------- generators -------------------------------- */

export interface ChoiceChallenge {
  kind: "choice";
  prompt: string;
  display?: string[];
  options: string[];
  answer: number;
  hint: string;
}

const SYMBOLS = ["🕷️", "🕸️", "⚡", "🌀", "🔴", "🟢", "👁️", "💀"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function makePattern(level: number): ChoiceChallenge {
  const period = Math.min(5, 2 + Math.floor(level / 2));
  const pool = shuffle(SYMBOLS);
  const base = pool.slice(0, period);
  const len = period * 2 + 1 + (level > 4 ? period : 0);
  const seq = Array.from({ length: len }, (_, i) => base[i % period]);
  const blankAt = level > 3 && Math.random() < 0.5 ? Math.floor(len / 2) : len - 1;
  const answer = seq[blankAt];
  const display = seq.map((s, i) => (i === blankAt ? "❓" : s));
  const wrong = shuffle(pool.filter((s) => s !== answer)).slice(0, 3);
  const options = shuffle([answer, ...wrong]);
  return {
    kind: "choice",
    prompt: "Which symbol completes the sequence?",
    display,
    options,
    answer: options.indexOf(answer),
    hint: `The sequence repeats every ${period} symbols.`,
  };
}

export function makeLogic(level: number): ChoiceChallenge {
  const scale = 1 + Math.floor(level / 2);
  const type = Math.floor(Math.random() * 4);
  let prompt = "";
  let value = 0;
  let hint = "";

  if (type === 0) {
    const every = 4 + Math.floor(Math.random() * 5) * scale;
    const after = 2 + Math.floor(Math.random() * 4);
    prompt = `A portal opens every ${every} seconds. The warning system activates after ${after} portals. How many seconds until the warning?`;
    value = every * after;
    hint = `Multiply ${every} by ${after}.`;
  } else if (type === 1) {
    const per = 2 + Math.floor(Math.random() * 4);
    const heroes = per * (2 + Math.floor(Math.random() * 5)) + Math.floor(Math.random() * per);
    prompt = `Each breach needs ${per} heroes to seal. You have ${heroes} heroes on deck. How many breaches can you seal?`;
    value = Math.floor(heroes / per);
    hint = `Divide ${heroes} by ${per} and drop the remainder.`;
  } else if (type === 2) {
    const start = 2 + Math.floor(Math.random() * 9);
    const step = 2 + Math.floor(Math.random() * 5) * scale;
    const terms = [start, start + step, start + 2 * step, start + 3 * step];
    prompt = `Dimension codes read ${terms.join(", ")}, … What is the next code?`;
    value = start + 4 * step;
    hint = `Each code rises by ${step}.`;
  } else {
    const start = 1 + Math.floor(Math.random() * 4);
    const secs = 3 + Math.floor(Math.random() * 4);
    const k = 2 + Math.floor(Math.random() * 3);
    prompt = `A glitch counter starts at ${start} and doubles every ${secs} seconds. What is it after ${secs * k} seconds?`;
    value = start * 2 ** k;
    hint = `It doubles ${k} times.`;
  }

  const decoySet = new Set<number>([value]);
  while (decoySet.size < 4) {
    const off = (1 + Math.floor(Math.random() * 4)) * (Math.random() < 0.5 ? -1 : 1);
    const cand = value + off * Math.max(1, Math.round(value * 0.12));
    if (cand > 0 && cand !== value) decoySet.add(cand);
  }
  const options = shuffle([...decoySet]).map(String);
  return {
    kind: "choice",
    prompt,
    options,
    answer: options.indexOf(String(value)),
    hint,
  };
}

export interface MemoryChallenge {
  kind: "memory";
  sequence: string[];
  target: string;
  options: string[];
  answer: number;
  hint: string;
  flashMs: number;
}

export function makeMemory(level: number): MemoryChallenge {
  const kinds = shuffle(SYMBOLS).slice(0, Math.min(4, 3 + Math.floor(level / 3)));
  const len = 6 + level * 2;
  const sequence = Array.from({ length: len }, () => pick(kinds));
  const target = pick(kinds);
  const count = sequence.filter((s) => s === target).length;
  const set = new Set<number>([count]);
  while (set.size < 4) {
    const cand = count + (Math.floor(Math.random() * 7) - 3);
    if (cand >= 0) set.add(cand);
  }
  const options = shuffle([...set]).map(String);
  return {
    kind: "memory",
    sequence,
    target,
    options,
    answer: options.indexOf(String(count)),
    hint: `It is ${count > 0 ? "more than " + Math.max(0, count - 2) : "zero or close to it"}.`,
    flashMs: Math.max(2200, 5000 - level * 350),
  };
}

/* ------------------------------ hero profile ------------------------------- */

export interface HeroProfile {
  name: string;
  alias: string;
  dimension: string;
  power: PowerId;
  speed: number;
  intelligence: number;
  accuracy: number;
}

export function randomDimension(): string {
  return `EARTH-${100 + Math.floor(Math.random() * 900)}`;
}

export function rollStats(): { speed: number; intelligence: number; accuracy: number } {
  const r = () => 74 + Math.floor(Math.random() * 20);
  return { speed: r(), intelligence: r(), accuracy: r() };
}

export function trialRankTitle(round: number): string {
  return ["Recruit", "Verified Spider", "Breach Runner", "Rooftop Ace", "Dimension Elite", "Ultimate Spider-Hero"][
    Math.min(5, Math.max(0, round))
  ];
}
