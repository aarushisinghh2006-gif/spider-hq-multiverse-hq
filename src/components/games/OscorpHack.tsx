import { useEffect, useRef, useState } from "react";
import { buzz } from "@/lib/game/haptics";
import { sfx } from "@/lib/game/sound";

const SIZE = 3;
const LEVELS = 3;
const TIME = 75;

function applyToggle(board: boolean[], i: number): boolean[] {
  const next = [...board];
  const flip = (j: number) => (next[j] = !next[j]);
  const r = Math.floor(i / SIZE);
  const c = i % SIZE;
  flip(i);
  if (c > 0) flip(i - 1);
  if (c < SIZE - 1) flip(i + 1);
  if (r > 0) flip(i - SIZE);
  if (r < SIZE - 1) flip(i + SIZE);
  return next;
}

function scrambled(k: number): boolean[] {
  let board = Array(SIZE * SIZE).fill(false) as boolean[];
  for (let n = 0; n < k; n++) {
    board = applyToggle(board, Math.floor(Math.random() * board.length));
  }
  if (board.every((v) => !v)) board = applyToggle(board, Math.floor(Math.random() * board.length));
  return board;
}

export default function OscorpHack({ onFinish }: { onFinish: (score: number) => void }) {
  const [level, setLevel] = useState(0);
  const [board, setBoard] = useState<boolean[]>(() => scrambled(3));
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME);
  const done = useRef(false);
  const progress = useRef({ levels: 0, moves: 0 });

  useEffect(() => {
    const iv = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(iv);
          if (!done.current) {
            done.current = true;
            sfx("fail");
            onFinish(progress.current.levels * 30);
          }
          return 0;
        }
        if (t <= 11) sfx("tick");
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [onFinish]);

  const press = (i: number) => {
    if (done.current) return;
    sfx("tap");
    buzz(10);
    const next = applyToggle(board, i);
    const totalMoves = moves + 1;
    setMoves(totalMoves);
    progress.current.moves += 1;
    if (next.every((v) => !v)) {
      progress.current.levels += 1;
      sfx("unlock");
      buzz([30, 40, 30]);
      if (level + 1 >= LEVELS) {
        done.current = true;
        setBoard(next);
        setTimeout(() => {
          setTimeLeft((t) => {
            onFinish(
              Math.min(
                150,
                90 + Math.round(t * 0.6) + Math.max(0, 40 - progress.current.moves),
              ),
            );
            return t;
          });
        }, 500);
      } else {
        setLevel(level + 1);
        setBoard(scrambled(4 + level));
      }
    } else {
      setBoard(next);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex items-center justify-between font-display text-xl tracking-wider">
        <span className="text-accent">
          FIREWALL {Math.min(level + 1, LEVELS)}/{LEVELS}
        </span>
        <span className={`text-3xl ${timeLeft <= 10 ? "text-destructive" : "text-foreground"}`}>
          {timeLeft}
        </span>
        <span className="text-muted-foreground">MOVES {moves}</span>
      </div>
      <div className="comic-panel halftone flex flex-1 flex-col items-center justify-center gap-5 bg-card p-5">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Power down every node — taps flip neighbors too
        </p>
        <div className="grid grid-cols-3 gap-3">
          {board.map((on, i) => (
            <button
              key={i}
              aria-label={on ? "Active node" : "Disabled node"}
              onPointerDown={() => press(i)}
              className={`grid h-20 w-20 place-items-center rounded-xl border-2 text-3xl transition-all active:scale-90 ${
                on
                  ? "border-accent bg-secondary glow-accent"
                  : "border-border bg-secondary/30 opacity-50"
              }`}
            >
              {on ? "⚡" : "○"}
            </button>
          ))}
        </div>
        <p className="font-display text-lg tracking-widest text-primary">
          OSCORP SECURITY GRID
        </p>
      </div>
    </div>
  );
}