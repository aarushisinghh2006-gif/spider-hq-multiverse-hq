import { Lock } from "lucide-react";
import hqBg from "@/assets/hq-bg.jpg";
import { HQ_SECTIONS, levelForXp } from "@/lib/game/games";
import { useGame } from "@/lib/game/store";

export default function HQStatus() {
  const xp = useGame((s) => s.xp);
  const level = levelForXp(xp);
  const restored = HQ_SECTIONS.filter((s) => level >= s.level).length;

  return (
    <section className="comic-panel relative overflow-hidden bg-card">
      <img
        src={hqBg}
        alt="Spider HQ headquarters interior"
        width={1024}
        height={1536}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-35"
      />
      <div className="relative bg-gradient-to-t from-background/95 via-background/70 to-transparent p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-display text-2xl tracking-wide text-foreground text-pop">
            HQ RESTORATION
          </h2>
          <span className="font-display text-lg text-accent">
            {restored}/{HQ_SECTIONS.length}
          </span>
        </div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Complete missions to bring HQ back online
        </p>
        <div className="grid grid-cols-3 gap-2">
          {HQ_SECTIONS.map((s) => {
            const on = level >= s.level;
            return (
              <div
                key={s.name}
                className={`rounded-lg border-2 p-2 text-center transition-all ${
                  on
                    ? "border-accent/70 bg-secondary/80 glow-accent"
                    : "border-border bg-secondary/40 opacity-60 grayscale"
                }`}
              >
                <div className="text-xl">{on ? s.emoji : <Lock className="mx-auto h-4 w-4 text-muted-foreground" />}</div>
                <p className="mt-1 text-[10px] font-bold uppercase leading-tight tracking-wide text-foreground">
                  {s.name}
                </p>
                {!on && (
                  <p className="text-[9px] font-semibold text-muted-foreground">LVL {s.level}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}