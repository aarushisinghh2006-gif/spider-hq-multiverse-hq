import { useEffect, useRef, useState } from "react";
import { buzz } from "@/lib/game/haptics";
import { sfx } from "@/lib/game/sound";

const BOMBS = 3;
const TIME = 15;
const COLORS = ["red", "blue", "yellow", "green", "white"] as const;
type WireColor = (typeof COLORS)[number];

const WIRE_STYLE: Record<WireColor, string> = {
  red: "oklch(0.6 0.22 27)",
  blue: "oklch(0.6 0.18 255)",
  yellow: "oklch(0.85 0.15 95)",
  green: "oklch(0.72 0.19 150)",
  white: "oklch(0.95 0.01 250)",
};

interface Bomb {
  wires: WireColor[];
  rule: string;
  correct: number;
}

function makeBomb(): Bomb {
  const wires = [...COLORS].sort(() => Math.random() - 0.5).slice(0, 4);
  const target = wires[Math.floor(Math.random() * 4)];
  const idx = wires.indexOf(target);
  const kind = Math.floor(Math.random() * 3);
  if (kind === 0) {
    return {
      wires,
      rule: `Cut the wire directly BELOW the ${target.toUpperCase()} wire. (Bottom wraps to top.)`,
      correct: (idx + 1) % 4,
    };
  }
  if (kind === 1) {
    return {
      wires,
      rule: `Cut the wire in the MIRROR position of the ${target.toUpperCase()} wire.`,
      correct: 3 - idx,
    };
  }
  return {
    wires,
    rule: `Count the letters in "${target.toUpperCase()}". Cut that wire number (1–4, wrapping around).`,
    correct: (target.length - 1) % 4,
  };
}

export default function BombDefusal({ onFinish }: { onFinish: (score: number) => void }) {
  const [bombIdx, setBombIdx] = useState(0);
  const [bomb, setBomb] = useState<Bomb>(() => makeBomb());
  const [timeLeft, setTimeLeft] = useState(TIME);
  const [phase, setPhase] = useState<"play" | "safe" | "boom">("play");
  const stats = useRef({ defused: 0, bonus: 0, finished: false });

  useEffect(() => {
    if (phase !== "play") return;
    const iv = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(iv);
          explode();
          return 0;
        }
        if (t <= 5) {
          sfx("tick");
          buzz(8);
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, bombIdx]);

  const advance = () => {
    setTimeout(() => {
      if (bombIdx + 1 >= BOMBS) {
        if (!stats.current.finished) {
          stats.current.finished = true;
          onFinish(stats.current.defused * 35 + stats.current.bonus);
        }
      } else {
        setBombIdx(bombIdx + 1);
        setBomb(makeBomb());
        setTimeLeft(TIME);
        setPhase("play");
      }
    }, 1100);
  };

  const explode = () => {
    sfx("explosion");
    buzz([80, 50, 120]);
    setPhase("boom");
    advance();
  };

  const cut = (i: number) => {
    if (phase !== "play") return;
    if (i === bomb.correct) {
      stats.current.defused += 1;
      stats.current.bonus += timeLeft;
      sfx("success");
      buzz([20, 30, 20]);
      setPhase("safe");
      advance();
    } else {
      explode();
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex items-center justify-between font-display text-xl tracking-wider">
        <span className="text-accent">
          BOMB {bombIdx + 1}/{BOMBS}
        </span>
        <span className={`text-3xl ${timeLeft <= 5 ? "text-destructive" : "text-foreground"}`}>
          {phase === "play" ? timeLeft : phase === "safe" ? "✔" : "✖"}
        </span>
        <span className="text-success">SAFE {stats.current.defused}</span>
      </div>
      <div
        className={`comic-panel halftone flex flex-1 flex-col justify-center gap-4 bg-card p-5 ${
          phase === "boom" ? "animate-flash-danger" : ""
        }`}
      >
        <div className="text-center text-5xl">
          {phase === "boom" ? "💥" : phase === "safe" ? "😮‍💨" : "💣"}
        </div>
        <div className="rounded-lg border-2 border-gold/60 bg-secondary p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gold">
            Defusal protocol
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">{bomb.rule}</p>
        </div>
        <div className="flex flex-col gap-2.5">
          {bomb.wires.map((color, i) => (
            <button
              key={`${bombIdx}-${i}`}
              onPointerDown={() => cut(i)}
              disabled={phase !== "play"}
              className="group flex items-center gap-3 rounded-lg border-2 border-border bg-secondary/60 px-3 py-2.5 transition-transform active:scale-95 disabled:opacity-60"
            >
              <span className="font-display text-lg text-muted-foreground">{i + 1}</span>
              <span
                className="h-3 flex-1 rounded-full"
                style={{ backgroundColor: WIRE_STYLE[color] }}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {color}
              </span>
              <span className="text-lg">✂️</span>
            </button>
          ))}
        </div>
        {phase === "safe" && (
          <p className="text-center font-display text-2xl tracking-wider text-success animate-pop">
            DEFUSED!
          </p>
        )}
        {phase === "boom" && (
          <p className="text-center font-display text-2xl tracking-wider text-destructive animate-pop">
            KA-BOOM!
          </p>
        )}
      </div>
    </div>
  );
}