import { useEffect, useRef, useState } from "react";
import { buzz } from "@/lib/game/haptics";
import { sfx } from "@/lib/game/sound";

const ROUNDS = 5;

type Phase = "idle" | "wait" | "go" | "early" | "shown";

export default function SpiderSense({ onFinish }: { onFinish: (score: number) => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [lastMs, setLastMs] = useState<number | null>(null);
  const times = useRef<number[]>([]);
  const goAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const startRound = () => {
    setPhase("wait");
    setLastMs(null);
    timer.current = setTimeout(
      () => {
        goAt.current = performance.now();
        setPhase("go");
        sfx("tick");
        buzz(30);
      },
      1100 + Math.random() * 2300,
    );
  };

  const record = (ms: number) => {
    times.current.push(ms);
    setLastMs(ms);
    const nextRound = times.current.length;
    setRound(nextRound);
    timer.current = setTimeout(() => {
      if (nextRound >= ROUNDS) {
        const avg = times.current.reduce((a, b) => a + b, 0) / times.current.length;
        onFinish(Math.min(130, Math.max(5, Math.round(160 - avg / 3))));
      } else {
        startRound();
      }
    }, 1000);
  };

  const handleTap = () => {
    if (phase === "idle") {
      sfx("tap");
      startRound();
    } else if (phase === "wait") {
      clearTimeout(timer.current);
      sfx("fail");
      buzz([50, 40, 50]);
      setPhase("early");
      record(600);
    } else if (phase === "go") {
      const ms = Math.round(performance.now() - goAt.current);
      sfx("hit");
      buzz(15);
      setPhase("shown");
      record(ms);
    }
  };

  const bg =
    phase === "go"
      ? "bg-primary glow-primary"
      : phase === "early"
        ? "bg-destructive/40"
        : "bg-card";

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex justify-between font-display text-xl tracking-wider text-foreground">
        <span>
          ROUND {Math.min(round + 1, ROUNDS)}/{ROUNDS}
        </span>
        <span className="text-accent">{lastMs !== null ? `${lastMs} ms` : "—"}</span>
      </div>
      <button
        onPointerDown={handleTap}
        className={`comic-panel halftone flex flex-1 flex-col items-center justify-center gap-3 p-6 transition-colors duration-100 ${bg}`}
      >
        <span className="text-6xl">{phase === "go" ? "⚡" : phase === "early" ? "💥" : "🕷️"}</span>
        <span className="font-display text-3xl tracking-wider text-foreground text-pop">
          {phase === "idle" && "TAP TO START"}
          {phase === "wait" && "WAIT FOR IT…"}
          {phase === "go" && "NOW! TAP!"}
          {phase === "early" && "TOO EARLY! +600ms"}
          {phase === "shown" && `${lastMs} ms`}
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {phase === "wait" ? "Don't tap until the flash" : "Fastest senses in the multiverse?"}
        </span>
      </button>
    </div>
  );
}