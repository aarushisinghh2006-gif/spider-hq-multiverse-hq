import { createFileRoute } from "@tanstack/react-router";
import BottomNav from "@/components/BottomNav";
import MuteButton from "@/components/MuteButton";
import SeasonTimer from "@/components/SeasonTimer";
import { useGame } from "@/lib/game/store";
import { useMounted } from "@/lib/game/useMounted";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Spider HQ" },
      {
        name: "description",
        content: "Global total-points ranking — one champion is crowned when the season clock ends.",
      },
      { property: "og:title", content: "Leaderboard — Spider HQ" },
      { property: "og:description", content: "Global total-points ranking for every Spider HQ agent." },
    ],
  }),
  component: LeaderboardPage,
});

const MEDALS = ["🥇", "🥈", "🥉"];

function LeaderboardPage() {
  const mounted = useMounted();
  const roster = useGame((s) => s.roster);
  const me = useGame((s) => s.name);

  const ranked = [...roster].sort((a, b) => b.points - a.points || b.missions - a.missions);
  const champion = ranked[0];

  return (
    <div className="mx-auto max-w-md p-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="mb-4 flex items-center justify-between gap-2">
        <h1 className="font-display text-3xl tracking-wider text-primary text-pop">LEADERBOARD</h1>
        <MuteButton />
      </header>

      {mounted && (
        <>
          <SeasonTimer />

          {champion && (
            <div className="comic-panel halftone mt-3 flex items-center gap-3 bg-card p-4 animate-slide-up">
              <span className="text-4xl">👑</span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                  Current champion
                </p>
                <p className="truncate font-display text-2xl tracking-wide text-gold text-pop">
                  {champion.name}
                </p>
                <p className="text-xs font-semibold text-muted-foreground">
                  {champion.points} total points · {champion.missions} missions
                </p>
              </div>
            </div>
          )}

          <h2 className="mb-2 mt-5 font-display text-xl tracking-wider text-foreground text-pop">
            TOTAL POINTS
          </h2>

          {ranked.length === 0 ? (
            <div className="comic-panel halftone flex flex-col items-center gap-3 bg-card p-8 text-center">
              <span className="text-4xl">🕸️</span>
              <p className="font-display text-xl tracking-wider text-foreground">NO AGENTS YET</p>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Play a mission to put your name on the board
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {ranked.map((r, i) => {
                const isMe = r.name.toLowerCase() === me.toLowerCase();
                return (
                  <div
                    key={r.name}
                    className={`flex items-center gap-3 rounded-xl border-2 p-3 animate-slide-up ${
                      i === 0
                        ? "border-gold/80 bg-gold/10"
                        : isMe
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card"
                    }`}
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <span className="w-8 text-center font-display text-xl">
                      {MEDALS[i] ?? `#${i + 1}`}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-lg tracking-wide text-foreground">
                        {r.name}
                        {isMe && (
                          <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                            you
                          </span>
                        )}
                      </p>
                      <p className="text-xs font-semibold text-muted-foreground">
                        {r.missions} missions played
                      </p>
                    </div>
                    <span className="font-display text-2xl text-accent">{r.points}</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
      <BottomNav />
    </div>
  );
}
