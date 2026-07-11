import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import MuteButton from "@/components/MuteButton";
import { GAMES, type GameId } from "@/lib/game/games";
import { sfx } from "@/lib/game/sound";
import { useGame } from "@/lib/game/store";
import { useMounted } from "@/lib/game/useMounted";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Spider HQ" },
      { name: "description", content: "Top mission runs across all six Spider HQ microgames." },
      { property: "og:title", content: "Leaderboard — Spider HQ" },
      { property: "og:description", content: "Top mission runs across all six microgames." },
    ],
  }),
  component: LeaderboardPage,
});

const MEDALS = ["🥇", "🥈", "🥉"];

function LeaderboardPage() {
  const mounted = useMounted();
  const [selected, setSelected] = useState<GameId>("web-shooter");
  const runs = useGame((s) => s.runs);
  const name = useGame((s) => s.name);

  const top = runs
    .filter((r) => r.game === selected)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-md p-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="mb-4 flex items-center justify-between gap-2">
        <h1 className="font-display text-3xl tracking-wider text-primary text-pop">LEADERBOARD</h1>
        <MuteButton />
      </header>

      {mounted && (
        <>
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {GAMES.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  setSelected(g.id);
                  sfx("tap");
                }}
                className={`shrink-0 rounded-full border-2 px-3.5 py-1.5 font-display text-sm tracking-wider transition-colors ${
                  selected === g.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {g.emoji} {g.name.toUpperCase()}
              </button>
            ))}
          </div>

          {top.length === 0 ? (
            <div className="comic-panel halftone flex flex-col items-center gap-3 bg-card p-8 text-center">
              <span className="text-4xl">🕸️</span>
              <p className="font-display text-xl tracking-wider text-foreground">NO RUNS YET</p>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Complete this mission to claim the top spot
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {top.map((r, i) => (
                <div
                  key={`${r.date}-${i}`}
                  className={`flex items-center gap-3 rounded-xl border-2 p-3 animate-slide-up ${
                    i === 0 ? "border-gold/80 bg-gold/10" : "border-border bg-card"
                  }`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <span className="w-8 text-center font-display text-xl">
                    {MEDALS[i] ?? `#${i + 1}`}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-lg tracking-wide text-foreground">
                      {name}
                    </p>
                    <p className="text-xs font-semibold text-muted-foreground">{r.date}</p>
                  </div>
                  <span className="font-display text-2xl text-accent">{r.score}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      <BottomNav />
    </div>
  );
}