import { useEffect, useState } from "react";
import { seasonEnd } from "@/lib/game/store";

function fmt(ms: number) {
  const t = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(t / 3600)).padStart(2, "0");
  const m = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
  const s = String(t % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function SeasonTimer({ compact = false }: { compact?: boolean }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(seasonEnd() - Date.now());
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  if (left === null) return null;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border-2 border-gold bg-gold/10 p-3 ${
        compact ? "" : "animate-slide-up"
      }`}
    >
      <span className="text-2xl">⏳</span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg leading-tight tracking-wide text-gold">
          SEASON ENDS IN {fmt(left)}
        </p>
        <p className="truncate text-[11px] font-semibold text-muted-foreground">
          Highest total points when the clock hits zero is crowned champion.
        </p>
      </div>
    </div>
  );
}
