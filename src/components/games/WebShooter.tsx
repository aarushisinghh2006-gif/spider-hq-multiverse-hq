import { useEffect, useRef, useState } from "react";
import { buzz } from "@/lib/game/haptics";
import { sfx } from "@/lib/game/sound";

const DURATION = 30_000;
const KINDS = ["🤖", "🛸", "👾", "🦂"];

interface Foe {
  id: number;
  x: number;
  y: number;
  kind: string;
  born: number;
}

export default function WebShooter({ onFinish }: { onFinish: (score: number) => void }) {
  const [foes, setFoes] = useState<Foe[]>([]);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const start = useRef(0);
  const nextId = useRef(0);
  const stats = useRef({ hits: 0, misses: 0 });
  const done = useRef(false);

  useEffect(() => {
    start.current = Date.now();
    const iv = setInterval(() => {
      const elapsed = Date.now() - start.current;
      setTimeLeft(Math.max(0, Math.ceil((DURATION - elapsed) / 1000)));
      if (elapsed >= DURATION) {
        if (!done.current) {
          done.current = true;
          clearInterval(iv);
          onFinish(Math.max(0, stats.current.hits * 6 - stats.current.misses * 2));
        }
        return;
      }
      setFoes((prev) => {
        const now = Date.now();
        let escaped = 0;
        let next = prev.filter((f) => {
          const alive = now - f.born < 1700;
          if (!alive) escaped++;
          return alive;
        });
        if (escaped > 0) {
          stats.current.misses += escaped;
          setMisses(stats.current.misses);
        }
        const spawnChance = 0.5 + (elapsed / DURATION) * 0.4;
        if (Math.random() < spawnChance && next.length < 5) {
          next = [
            ...next,
            {
              id: nextId.current++,
              x: 6 + Math.random() * 76,
              y: 6 + Math.random() * 76,
              kind: KINDS[Math.floor(Math.random() * KINDS.length)],
              born: now,
            },
          ];
        }
        return next;
      });
    }, 320);
    return () => clearInterval(iv);
  }, [onFinish]);

  const zap = (id: number) => {
    setFoes((prev) => {
      if (!prev.some((f) => f.id === id)) return prev;
      stats.current.hits += 1;
      setHits(stats.current.hits);
      return prev.filter((f) => f.id !== id);
    });
    sfx("hit");
    buzz(20);
  };

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex items-center justify-between font-display text-xl tracking-wider">
        <span className="text-success">HITS {hits}</span>
        <span className={`text-3xl ${timeLeft <= 5 ? "text-destructive" : "text-foreground"}`}>
          {timeLeft}
        </span>
        <span className="text-destructive">MISS {misses}</span>
      </div>
      <div className="comic-panel halftone relative flex-1 overflow-hidden bg-card">
        {foes.map((f) => (
          <button
            key={f.id}
            aria-label="Enemy drone"
            onPointerDown={() => zap(f.id)}
            className="absolute grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-primary/70 bg-secondary/80 text-3xl animate-pop glow-primary"
            style={{ left: `${f.x + 8}%`, top: `${f.y + 8}%` }}
          >
            {f.kind}
          </button>
        ))}
        <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Tap the drones before they warp out!
        </p>
      </div>
    </div>
  );
}