import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";
import BombDefusal from "@/components/games/BombDefusal";
import BossFight from "@/components/games/BossFight";
import OscorpHack from "@/components/games/OscorpHack";
import SpiderSense from "@/components/games/SpiderSense";
import SwingRush from "@/components/games/SwingRush";
import WebShooter from "@/components/games/WebShooter";
import MuteButton from "@/components/MuteButton";
import { dailyGame, todayKey, type GameId, type GameMeta } from "@/lib/game/games";
import { buzz } from "@/lib/game/haptics";
import { sfx } from "@/lib/game/sound";
import { useGame, type MissionResult } from "@/lib/game/store";
import { useMounted } from "@/lib/game/useMounted";

const COMPONENTS: Record<GameId, ComponentType<{ onFinish: (score: number) => void }>> = {
  "web-shooter": WebShooter,
  "spider-sense": SpiderSense,
  "swing-rush": SwingRush,
  "oscorp-hack": OscorpHack,
  "bomb-defusal": BombDefusal,
  "boss-fight": BossFight,
};

export default function GameShell({ meta }: { meta: GameMeta }) {
  const mounted = useMounted();
  const [phase, setPhase] = useState<"brief" | "play" | "done">("brief");
  const [runKey, setRunKey] = useState(0);
  const [result, setResult] = useState<MissionResult | null>(null);
  const completeMission = useGame((s) => s.completeMission);
  const best = useGame((s) => s.best[meta.id] ?? 0);
  const lastDaily = useGame((s) => s.lastDaily);
  const isDaily = dailyGame().id === meta.id && lastDaily !== todayKey();
  const Game = COMPONENTS[meta.id];

  const onFinish = (score: number) => {
    setResult(completeMission(meta.id, score));
    setPhase("done");
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col p-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="mb-3 flex items-center justify-between gap-2">
        <Link
          to="/"
          aria-label="Back to HQ"
          className="grid h-10 w-10 place-items-center rounded-full border-2 border-border bg-card active:scale-90"
        >
          <X className="h-5 w-5" />
        </Link>
        <h1 className="min-w-0 truncate font-display text-2xl tracking-wider text-foreground text-pop">
          {meta.emoji} {meta.name}
        </h1>
        <MuteButton />
      </header>

      {!mounted ? null : phase === "brief" ? (
        <div className="comic-panel halftone flex flex-1 flex-col items-center justify-center gap-4 bg-card p-6 text-center animate-slide-up">
          {isDaily && (
            <span className="rounded-full border-2 border-gold bg-gold/15 px-3 py-1 font-display text-sm tracking-widest text-gold animate-pop">
              📅 DAILY CHALLENGE · 2X REWARDS
            </span>
          )}
          <span className="text-7xl animate-hq-float">{meta.emoji}</span>
          <div>
            <h2 className="font-display text-4xl tracking-wider text-primary text-pop">
              {meta.name.toUpperCase()}
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest text-accent">
              {meta.tagline}
            </p>
          </div>
          <p className="max-w-xs text-sm font-medium text-muted-foreground">{meta.howTo}</p>
          {best > 0 && (
            <p className="font-display text-lg tracking-wider text-gold">BEST: {best}</p>
          )}
          <button
            onPointerDown={() => {
              sfx("tap");
              buzz(15);
              setPhase("play");
            }}
            className="w-full rounded-xl border-2 border-primary bg-primary py-4 font-display text-2xl tracking-widest text-primary-foreground text-pop glow-primary active:scale-95"
          >
            START MISSION
          </button>
        </div>
      ) : phase === "play" ? (
        <Game key={runKey} onFinish={onFinish} />
      ) : result ? (
        <ResultScreen
          result={result}
          onRetry={() => {
            sfx("tap");
            setResult(null);
            setRunKey((k) => k + 1);
            setPhase("play");
          }}
        />
      ) : null}
    </div>
  );
}

function ResultScreen({ result, onRetry }: { result: MissionResult; onRetry: () => void }) {
  useEffect(() => {
    sfx(result.leveledUp ? "levelup" : "success");
    buzz([30, 50, 30]);
  }, [result]);

  return (
    <div className="comic-panel halftone flex flex-1 flex-col items-center justify-center gap-4 bg-card p-6 text-center animate-slide-up">
      <h2 className="font-display text-4xl tracking-wider text-primary text-pop animate-pop">
        MISSION COMPLETE!
      </h2>
      <p className="font-display text-7xl text-foreground text-pop">{result.score}</p>
      {result.newBest && (
        <span className="font-display text-xl tracking-widest text-gold animate-pop">
          ★ NEW BEST! ★
        </span>
      )}
      <div className="flex gap-3">
        <span className="rounded-full border-2 border-accent/60 bg-secondary px-4 py-1.5 font-display text-lg text-accent">
          +{result.xpGain} XP
        </span>
        <span className="rounded-full border-2 border-gold/60 bg-secondary px-4 py-1.5 font-display text-lg text-gold">
          +{result.coinGain} 🪙
        </span>
      </div>
      {result.isDaily && (
        <span className="text-xs font-bold uppercase tracking-widest text-gold">
          Daily challenge bonus applied — 2x rewards!
        </span>
      )}
      {result.leveledUp && (
        <div className="w-full rounded-xl border-2 border-accent bg-accent/15 p-3 animate-pop">
          <p className="font-display text-2xl tracking-wider text-accent text-pop">
            LEVEL UP! → LVL {result.level}
          </p>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            New HQ sections may be back online
          </p>
        </div>
      )}
      {result.newAchievements.map((a) => (
        <div
          key={a.id}
          className="flex w-full items-center gap-3 rounded-xl border-2 border-gold/70 bg-gold/10 p-3 animate-pop"
        >
          <span className="text-2xl">{a.emoji}</span>
          <div className="min-w-0 text-left">
            <p className="font-display text-lg tracking-wide text-gold">{a.name}</p>
            <p className="truncate text-xs font-semibold text-muted-foreground">{a.desc}</p>
          </div>
        </div>
      ))}
      <div className="mt-2 flex w-full gap-3">
        <button
          onPointerDown={onRetry}
          className="flex-1 rounded-xl border-2 border-primary bg-primary py-3.5 font-display text-xl tracking-widest text-primary-foreground text-pop active:scale-95"
        >
          RETRY
        </button>
        <Link
          to="/"
          className="flex-1 rounded-xl border-2 border-border bg-secondary py-3.5 text-center font-display text-xl tracking-widest text-foreground active:scale-95"
        >
          BACK TO HQ
        </Link>
      </div>
    </div>
  );
}