import { GAMES, levelForXp, type GameId } from "./games";

export interface ProgressSnapshot {
  xp: number;
  coinsEarned: number;
  totalMissions: number;
  best: Partial<Record<GameId, number>>;
  plays: Partial<Record<GameId, number>>;
  unlockedThemes: string[];
  lastDaily: string;
}

export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  check: (s: ProgressSnapshot) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-mission", name: "Origin Story", desc: "Complete your first mission", emoji: "🕷️", check: (s) => s.totalMissions >= 1 },
  { id: "ten-missions", name: "Friendly Neighborhood", desc: "Complete 10 missions", emoji: "🏘️", check: (s) => s.totalMissions >= 10 },
  { id: "thirty-missions", name: "No Rest For Heroes", desc: "Complete 30 missions", emoji: "🌙", check: (s) => s.totalMissions >= 30 },
  { id: "all-games", name: "Multiverse Tourist", desc: "Play all 6 mission types", emoji: "🌀", check: (s) => GAMES.every((g) => (s.plays[g.id] ?? 0) > 0) },
  { id: "level-5", name: "Street Hero", desc: "Reach level 5", emoji: "⭐", check: (s) => levelForXp(s.xp) >= 5 },
  { id: "level-10", name: "City Guardian", desc: "Reach level 10", emoji: "🌟", check: (s) => levelForXp(s.xp) >= 10 },
  { id: "rich", name: "Coin Slinger", desc: "Earn 500 coins in total", emoji: "🪙", check: (s) => s.coinsEarned >= 500 },
  { id: "daily-hero", name: "Daily Grind", desc: "Complete a daily challenge", emoji: "📅", check: (s) => s.lastDaily !== "" },
  { id: "sharpshooter", name: "Sharpshooter", desc: "Score 100+ in Web Shooter", emoji: "🎯", check: (s) => (s.best["web-shooter"] ?? 0) >= 100 },
  { id: "lightning", name: "Lightning Reflexes", desc: "Score 90+ in Spider Sense", emoji: "⚡", check: (s) => (s.best["spider-sense"] ?? 0) >= 90 },
  { id: "skyline-king", name: "Skyline Royalty", desc: "Score 100+ in Swing Rush", emoji: "🏙️", check: (s) => (s.best["swing-rush"] ?? 0) >= 100 },
  { id: "master-hacker", name: "Ghost In The Grid", desc: "Score 110+ in Oscorp Hack", emoji: "💻", check: (s) => (s.best["oscorp-hack"] ?? 0) >= 110 },
  { id: "cool-head", name: "Nerves Of Steel", desc: "Score 110+ in Bomb Defusal", emoji: "💣", check: (s) => (s.best["bomb-defusal"] ?? 0) >= 110 },
  { id: "vortex-slayer", name: "Vortex Slayer", desc: "Score 120+ in Boss Fight", emoji: "🏆", check: (s) => (s.best["boss-fight"] ?? 0) >= 120 },
  { id: "fashionista", name: "New Threads", desc: "Unlock a theme", emoji: "🎨", check: (s) => s.unlockedThemes.length > 1 },
];