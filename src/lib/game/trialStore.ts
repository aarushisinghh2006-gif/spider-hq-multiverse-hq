import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { randomDimension, rollStats, type HeroProfile, type PowerId } from "./trial";

export interface RoundRecord {
  round: number;
  score: number;
  rank: number;
  accuracy: number;
  qualified: boolean;
}

interface TrialStore {
  hero: HeroProfile | null;
  /** Highest round the hero has qualified from (0 = none). */
  cleared: number;
  bestFinal: number;
  champion: boolean;
  history: RoundRecord[];
  createHero: (name: string, alias: string, power: PowerId) => void;
  resetTrial: () => void;
  recordRound: (rec: RoundRecord, stats: { fastestMs: number }) => void;
  setChampion: (score: number) => void;
}

const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const useTrial = create<TrialStore>()(
  persist(
    (set, get) => ({
      hero: null,
      cleared: 0,
      bestFinal: 0,
      champion: false,
      history: [],

      createHero: (name, alias, power) =>
        set({
          hero: {
            name: name.slice(0, 18) || "Recruit",
            alias: alias.slice(0, 18) || "Spider-Hero",
            dimension: randomDimension(),
            power,
            ...rollStats(),
          },
          cleared: 0,
          champion: false,
          history: [],
        }),

      resetTrial: () => set({ cleared: 0, champion: false, history: [] }),

      recordRound: (rec, stats) => {
        const s = get();
        const hero = s.hero;
        set({
          cleared: rec.qualified ? Math.max(s.cleared, rec.round) : s.cleared,
          history: [...s.history, rec].slice(-40),
          hero: hero
            ? {
                ...hero,
                accuracy: Math.round(hero.accuracy * 0.7 + rec.accuracy * 0.3),
                speed: Math.min(
                  99,
                  Math.round(
                    hero.speed * 0.8 + Math.max(40, 100 - stats.fastestMs / 30) * 0.2,
                  ),
                ),
                intelligence: Math.min(
                  99,
                  Math.round(hero.intelligence * 0.85 + (rec.qualified ? 99 : 70) * 0.15),
                ),
              }
            : hero,
        });
      },

      setChampion: (score) =>
        set((s) => ({ champion: true, bestFinal: Math.max(s.bestFinal, score) })),
    }),
    {
      name: "spider-hq-trial",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? (noopStorage as unknown as Storage) : window.localStorage,
      ),
    },
  ),
);
