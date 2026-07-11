export type GameId =
  | "web-shooter"
  | "spider-sense"
  | "swing-rush"
  | "oscorp-hack"
  | "bomb-defusal"
  | "boss-fight";

export interface GameMeta {
  id: GameId;
  name: string;
  tagline: string;
  emoji: string;
  howTo: string;
  xpMult: number;
  coinMult: number;
}

export const GAMES: GameMeta[] = [
  {
    id: "web-shooter",
    name: "Web Shooter",
    tagline: "Tag every drone before it warps out",
    emoji: "🕸️",
    howTo: "Rogue drones warp into the arena. Tap them before they vanish! 30 seconds on the clock — misses cost you points.",
    xpMult: 1,
    coinMult: 0.5,
  },
  {
    id: "spider-sense",
    name: "Spider Sense",
    tagline: "Ultra-fast reaction test",
    emoji: "⚡",
    howTo: "Wait for your senses to tingle... then tap the instant the screen flashes. 5 rounds. Tap too early and you eat a penalty.",
    xpMult: 1,
    coinMult: 0.5,
  },
  {
    id: "swing-rush",
    name: "Swing Rush",
    tagline: "Chain perfect web swings across the city",
    emoji: "🏙️",
    howTo: "Tap RELEASE when the swing marker hits the glowing zone. Perfect timing builds momentum and multiplies your distance. 12 swings — make them count.",
    xpMult: 1,
    coinMult: 0.5,
  },
  {
    id: "oscorp-hack",
    name: "Oscorp Hack",
    tagline: "Crack the circuit lockdown",
    emoji: "🔌",
    howTo: "Tapping a node flips it AND its neighbors. Power down every node to breach each firewall. 3 circuits, 75 seconds, fewer moves = bigger score.",
    xpMult: 1.2,
    coinMult: 0.6,
  },
  {
    id: "bomb-defusal",
    name: "Bomb Defusal",
    tagline: "Read the rule. Cut the wire. Don't blink.",
    emoji: "💣",
    howTo: "Each bomb shows a defusal rule. Work out which wire it points to and cut it before the timer hits zero. 3 bombs — wrong wire goes BOOM.",
    xpMult: 1.2,
    coinMult: 0.6,
  },
  {
    id: "boss-fight",
    name: "Boss Fight",
    tagline: "Dodge Dr. Vortex, then strike back",
    emoji: "🌀",
    howTo: "Dr. Vortex telegraphs which lane he'll smash — tap a SAFE lane to dodge, then hammer STRIKE during the opening. Drain his core before you run out of hearts.",
    xpMult: 1.4,
    coinMult: 0.7,
  },
];

export interface ThemeMeta {
  id: string;
  name: string;
  desc: string;
  cost: number;
  swatch: [string, string];
}

export const THEMES: ThemeMeta[] = [
  { id: "classic", name: "Classic Crimson", desc: "The original HQ look", cost: 0, swatch: ["oklch(0.58 0.22 27)", "oklch(0.8 0.13 205)"] },
  { id: "symbiote", name: "Symbiote Noir", desc: "Toxic green on living black", cost: 150, swatch: ["oklch(0.78 0.2 145)", "oklch(0.72 0.19 310)"] },
  { id: "gold", name: "Golden Age", desc: "Vintage hero gold", cost: 300, swatch: ["oklch(0.83 0.14 85)", "oklch(0.9 0.06 90)"] },
  { id: "stealth", name: "Stealth Ops", desc: "Midnight recon cyan", cost: 500, swatch: ["oklch(0.75 0.13 210)", "oklch(0.62 0.18 265)"] },
];

export const RANKS = [
  { level: 1, name: "Rookie" },
  { level: 3, name: "Web Cadet" },
  { level: 5, name: "Street Hero" },
  { level: 8, name: "Vigilante" },
  { level: 11, name: "City Guardian" },
  { level: 15, name: "Multiverse Agent" },
  { level: 20, name: "Living Legend" },
];

export function levelForXp(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1;
}

export function xpForLevel(level: number): number {
  return 100 * (level - 1) * (level - 1);
}

export function rankForLevel(level: number): string {
  let rank = RANKS[0].name;
  for (const r of RANKS) if (level >= r.level) rank = r.name;
  return rank;
}

export interface HqSection {
  name: string;
  emoji: string;
  level: number;
}

export const HQ_SECTIONS: HqSection[] = [
  { name: "Command Deck", emoji: "🖥️", level: 1 },
  { name: "Training Sim", emoji: "🥊", level: 2 },
  { name: "Web Fluid Lab", emoji: "🧪", level: 4 },
  { name: "Suit Armory", emoji: "🦺", level: 6 },
  { name: "Multiverse Vault", emoji: "🌌", level: 9 },
  { name: "Skyline Perch", emoji: "🌃", level: 12 },
];

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function dailyGame(): GameMeta {
  const now = new Date();
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const day = Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - start) / 86400000);
  return GAMES[day % GAMES.length];
}