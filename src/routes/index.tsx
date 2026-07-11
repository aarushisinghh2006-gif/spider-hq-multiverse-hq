import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import HQStatus from "@/components/HQStatus";
import LoadingScreen from "@/components/LoadingScreen";
import MuteButton from "@/components/MuteButton";
import PlayerCard from "@/components/PlayerCard";
import { GAMES, dailyGame, todayKey } from "@/lib/game/games";
import { buzz } from "@/lib/game/haptics";
import { sfx } from "@/lib/game/sound";
import { useGame } from "@/lib/game/store";

// No og:image here: hosting injects the project's social preview at serve time.
export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("spider-hq-booted");
    const t = setTimeout(
      () => {
        sessionStorage.setItem("spider-hq-booted", "1");
        setReady(true);
      },
      seen ? 150 : 2300,
    );
    return () => clearTimeout(t);
  }, []);

  if (!ready) return <LoadingScreen />;

  return (
    <div className="mx-auto max-w-md p-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 animate-slide-up">
        <div className="flex min-w-0 items-center gap-2.5">
          <img
            src="/icons/icon-192.png"
            alt="Spider HQ emblem"
            width={40}
            height={40}
            className="h-10 w-10 shrink-0"
          />
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl leading-none tracking-wider text-primary text-pop">
              SPIDER HQ
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent">
              Mission Control
            </p>
          </div>
        </div>
        <MuteButton />
      </header>

      <div className="animate-slide-up" style={{ animationDelay: "60ms" }}>
        <PlayerCard />
      </div>

      <DailyBanner />

      <h2 className="mb-2 mt-5 font-display text-2xl tracking-wider text-foreground text-pop">
        MISSIONS
      </h2>
      <MissionGrid />

      <div className="mt-5 animate-slide-up" style={{ animationDelay: "180ms" }}>
        <HQStatus />
      </div>

      <BottomNav />
    </div>
  );
}

function DailyBanner() {
  const lastDaily = useGame((s) => s.lastDaily);
  const daily = dailyGame();
  const done = lastDaily === todayKey();

  return (
    <Link
      to="/play/$gameId"
      params={{ gameId: daily.id }}
      onClick={() => sfx("tap")}
      className={`mt-3 flex items-center gap-3 rounded-xl border-2 p-3 transition-transform active:scale-[0.98] animate-slide-up ${
        done ? "border-border bg-card opacity-80" : "border-gold bg-gold/10 glow-accent"
      }`}
      style={{ animationDelay: "120ms" }}
    >
      <span className="text-3xl">{done ? "✅" : "📅"}</span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg leading-tight tracking-wide text-gold">
          DAILY CHALLENGE {done ? "COMPLETE" : "· 2X REWARDS"}
        </p>
        <p className="truncate text-xs font-semibold text-muted-foreground">
          {daily.emoji} {daily.name} — {done ? "come back tomorrow!" : daily.tagline}
        </p>
      </div>
    </Link>
  );
}

function MissionGrid() {
  const best = useGame((s) => s.best);
  return (
    <div className="grid grid-cols-2 gap-3">
      {GAMES.map((g, i) => (
        <Link
          key={g.id}
          to="/play/$gameId"
          params={{ gameId: g.id }}
          onClick={() => {
            sfx("tap");
            buzz(10);
          }}
          className="comic-panel halftone group flex flex-col gap-1.5 bg-card p-3.5 transition-transform active:scale-95 animate-slide-up"
          style={{ animationDelay: `${i * 45}ms` }}
        >
          <span className="text-3xl transition-transform group-active:scale-110">{g.emoji}</span>
          <p className="font-display text-lg leading-tight tracking-wide text-foreground text-pop">
            {g.name.toUpperCase()}
          </p>
          <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-muted-foreground">
            {g.tagline}
          </p>
          <p className="mt-auto font-display text-sm tracking-wider text-gold">
            {best[g.id] ? `BEST ${best[g.id]}` : "NEW!"}
          </p>
        </Link>
      ))}
    </div>
  );
}
