import { useEffect, useRef, useState } from "react";
import { buzz } from "@/lib/game/haptics";
import { sfx } from "@/lib/game/sound";

const SWINGS = 12;

export default function SwingRush({ onFinish }: { onFinish: (score: number) => void }) {
  const [marker, setMarker] = useState(0.5);
  const [dist, setDist] = useState(0);
  const [swings, setSwings] = useState(0);
  const [streak, setStreak] = useState(0);
  const [flash, setFlash] = useState<"perfect" | "good" | "miss" | null>(null);
  const t = useRef(0);
  const dir = useRef(1);
  const speed = useRef(1.1);
  const zone = useRef(0.26);
  const raf = useRef(0);
  const state = useRef({ dist: 0, swings: 0, streak: 0, done: false });

  useEffect(() => {
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      t.current += dir.current * speed.current * dt;
      if (t.current > 1) {
        t.current = 1;
        dir.current = -1;
      } else if (t.current < 0) {
        t.current = 0;
        dir.current = 1;
      }
      setMarker(t.current);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const release = () => {
    const s = state.current;
    if (s.done) return;
    const diff = Math.abs(t.current - 0.5);
    const half = zone.current / 2;
    const mult = 1 + s.streak * 0.15;
    if (diff < half * 0.4) {
      s.dist += Math.round(42 * mult);
      s.streak += 1;
      speed.current += 0.09;
      zone.current = Math.max(0.13, zone.current * 0.94);
      sfx("hit");
      buzz(25);
      setFlash("perfect");
    } else if (diff < half) {
      s.dist += Math.round(24 * mult);
      s.streak += 1;
      sfx("tap");
      buzz(12);
      setFlash("good");
    } else {
      s.dist += 4;
      s.streak = 0;
      sfx("miss");
      buzz([40, 30, 40]);
      setFlash("miss");
    }
    s.swings += 1;
    setDist(s.dist);
    setStreak(s.streak);
    setSwings(s.swings);
    setTimeout(() => setFlash(null), 350);
    if (s.swings >= SWINGS) {
      s.done = true;
      setTimeout(() => onFinish(Math.round(s.dist / 4)), 700);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex items-center justify-between font-display text-xl tracking-wider">
        <span className="text-accent">{dist} m</span>
        <span className="text-foreground">
          SWING {Math.min(swings + 1, SWINGS)}/{SWINGS}
        </span>
        <span className="text-gold">x{(1 + streak * 0.15).toFixed(2)}</span>
      </div>
      <div className="comic-panel halftone relative flex flex-1 flex-col justify-between overflow-hidden bg-card p-4">
        <div
          className="pointer-events-none whitespace-nowrap text-4xl opacity-60 transition-transform duration-500"
          style={{ transform: `translateX(-${(dist * 2) % 400}px)` }}
        >
          {"🏢🏬🏙️🌆🏢🗼🏬🏢🌃🏙️🏢🏬🏙️🌆🏢🗼🏬🏢🌃🏙️"}
        </div>
        <div className="flex flex-col items-center gap-2">
          <span
            className={`text-6xl transition-transform ${flash === "miss" ? "animate-shake" : "animate-hq-float"}`}
          >
            🕷️
          </span>
          {flash && (
            <span
              className={`font-display text-2xl tracking-wider animate-pop ${
                flash === "perfect"
                  ? "text-success"
                  : flash === "good"
                    ? "text-accent"
                    : "text-destructive"
              }`}
            >
              {flash === "perfect" ? "PERFECT!" : flash === "good" ? "NICE!" : "SLIPPED!"}
            </span>
          )}
        </div>
        <div>
          <div className="relative h-8 overflow-hidden rounded-full border-2 border-border bg-secondary">
            <div
              className="absolute top-0 h-full bg-success/40"
              style={{
                left: `${(0.5 - zone.current / 2) * 100}%`,
                width: `${zone.current * 100}%`,
              }}
            />
            <div
              className="absolute top-0 h-full w-1.5 rounded-full bg-primary glow-primary"
              style={{ left: `${marker * 100}%` }}
            />
          </div>
          <button
            onPointerDown={release}
            className="mt-3 w-full rounded-xl border-2 border-primary bg-primary py-4 font-display text-2xl tracking-widest text-primary-foreground text-pop transition-transform active:scale-95"
          >
            RELEASE WEB!
          </button>
        </div>
      </div>
    </div>
  );
}