import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ACHIEVEMENTS, type AchievementDef } from "./achievements";
import { GAMES, THEMES, dailyGame, levelForXp, todayKey, type GameId } from "./games";

export interface RunEntry {
  game: GameId;
  score: number;
  date: string;
}

export interface MissionResult {
  score: number;
  xpGain: number;
  coinGain: number;
  newBest: boolean;
  isDaily: boolean;
  leveledUp: boolean;
  level: number;
  newAchievements: AchievementDef[];
}

interface GameStore {
  name: string;
  xp: number;
  coins: number;
  coinsEarned: number;
  totalMissions: number;
  muted: boolean;
  theme: string;
  unlockedThemes: string[];
  best: Partial<Record<GameId, number>>;
  plays: Partial<Record<GameId, number>>;
  achievements: string[];
  lastDaily: string;
  runs: RunEntry[];
  setName: (name: string) => void;
  toggleMute: () => void;
  setTheme: (id: string) => void;
  buyTheme: (id: string) => boolean;
  completeMission: (game: GameId, score: number) => MissionResult;
}

const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const useGame = create<GameStore>()(
  persist(
    (set, get) => ({
      name: "Web-Slinger",
      xp: 0,
      coins: 0,
      coinsEarned: 0,
      totalMissions: 0,
      muted: false,
      theme: "classic",
      unlockedThemes: ["classic"],
      best: {},
      plays: {},
      achievements: [],
      lastDaily: "",
      runs: [],

      setName: (name) => set({ name: name.slice(0, 18) || "Web-Slinger" }),
      toggleMute: () => set((s) => ({ muted: !s.muted })),
      setTheme: (id) => {
        if (get().unlockedThemes.includes(id)) set({ theme: id });
      },
      buyTheme: (id) => {
        const s = get();
        const theme = THEMES.find((t) => t.id === id);
        if (!theme || s.unlockedThemes.includes(id) || s.coins < theme.cost) return false;
        set({
          coins: s.coins - theme.cost,
          unlockedThemes: [...s.unlockedThemes, id],
          theme: id,
        });
        return true;
      },

      completeMission: (game, score) => {
        const s = get();
        const meta = GAMES.find((g) => g.id === game)!;
        const today = todayKey();
        const isDaily = dailyGame().id === game && s.lastDaily !== today;
        const mult = isDaily ? 2 : 1;
        const xpGain = Math.max(1, Math.round(score * meta.xpMult)) * mult;
        const coinGain = Math.max(1, Math.round(score * meta.coinMult)) * mult;
        const prevLevel = levelForXp(s.xp);

        const best = { ...s.best };
        const newBest = score > (best[game] ?? 0);
        if (newBest) best[game] = score;

        const next = {
          xp: s.xp + xpGain,
          coins: s.coins + coinGain,
          coinsEarned: s.coinsEarned + coinGain,
          totalMissions: s.totalMissions + 1,
          best,
          plays: { ...s.plays, [game]: (s.plays[game] ?? 0) + 1 },
          lastDaily: isDaily ? today : s.lastDaily,
          runs: [...s.runs, { game, score, date: today }].slice(-120),
        };

        const snapshot = { ...s, ...next };
        const newAchievements = ACHIEVEMENTS.filter(
          (a) => !s.achievements.includes(a.id) && a.check(snapshot),
        );

        set({
          ...next,
          achievements: [...s.achievements, ...newAchievements.map((a) => a.id)],
        });

        return {
          score,
          xpGain,
          coinGain,
          newBest,
          isDaily,
          leveledUp: levelForXp(next.xp) > prevLevel,
          level: levelForXp(next.xp),
          newAchievements,
        };
      },
    }),
    {
      name: "spider-hq-save",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? (noopStorage as Storage) : window.localStorage,
      ),
    },
  ),
);