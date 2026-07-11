import { Coins } from "lucide-react";
import { levelForXp, rankForLevel, xpForLevel } from "@/lib/game/games";
import { useGame } from "@/lib/game/store";

export default function PlayerCard() {
  const name = useGame((s) => s.name);
  const xp = useGame((s) => s.xp);
  const coins = useGame((s) => s.coins);
  const level = levelForXp(xp);
  const cur = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const pct = Math.min(100, Math.round(((xp - cur) / (next - cur)) * 100));

  return (
    <div className="comic-panel halftone bg-card p-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-primary bg-secondary text-2xl glow-primary">
            🕷️
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-xl tracking-wide text-foreground text-pop">
              {name}
            </p>
            <p className="text-xs font-bold uppercase tracking-widest text-accent">
              {rankForLevel(level)} · LVL {level}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 rounded-full border-2 border-gold/60 bg-secondary px-3 py-1">
          <Coins className="h-4 w-4 text-gold" />
          <span className="font-display text-lg text-gold">{coins}</span>
        </div>
      </div>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <span>XP {xp}</span>
          <span>Next: {next}</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full border border-border bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}