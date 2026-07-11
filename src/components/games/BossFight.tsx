import { useEffect, useRef, useState } from "react";
import { buzz } from "@/lib/game/haptics";
import { sfx } from "@/lib/game/sound";

const BOSS_HP = 12;
const PLAYER_HP = 3;

type Phase = "intro" | "telegraph" | "attack" | "over";

export default function BossFight({ onFinish }: { onFinish: (score: number) => void }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [bossHp, setBossHp] = useState(BOSS_HP);
  const [playerHp, setPlayerHp] = useState(PLAYER_HP);
  const [lane, setLane] = useState(1);
  const [attackLane, setAttackLane] = useState<number | null>(null);
  const [banner, setBanner] = useState("");
  const laneRef = useRef(1);
  const hpRef = useRef({ boss: BOSS_HP, player: PLAYER_HP, round: 0, strikes: 0 });
  const windowHits = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const finish = (won: boolean) => {
    setPhase("over");
    setBanner(won ? "VORTEX DEFEATED!" : "YOU'RE WEBBED OUT…");
    sfx(won ? "levelup" : "fail");
    buzz(won ? [40, 60, 40, 60, 120] : [200]);
    const h = hpRef.current;
    const score = won ? 90 + h.player * 15 + Math.max(0, 20 - h.round) : h.strikes * 5;
    later(() => onFinish(score), 1400);
  };

  const startTelegraph = () => {
    const h = hpRef.current;
    h.round += 1;
    const target = Math.floor(Math.random() * 3);
    setAttackLane(target);
    setBanner("INCOMING! PICK A SAFE LANE!");
    setPhase("telegraph");
    sfx("tick");
    later(
      () => {
        if (laneRef.current === target) {
          h.player -= 1;
          setPlayerHp(h.player);
          sfx("miss");
          buzz([70, 40, 70]);
          setBanner("SMASHED! 💢");
        } else {
          sfx("whoosh");
          setBanner("DODGED! NOW STRIKE!");
        }
        setAttackLane(null);
        if (h.player <= 0) {
          finish(false);
          return;
        }
        windowHits.current = 0;
        setPhase("attack");
        later(() => {
          if (hpRef.current.boss > 0) startTelegraph();
        }, 1400);
      },
      Math.max(650, 1050 - h.round * 35),
    );
  };

  const strike = () => {
    if (phase !== "attack" || windowHits.current >= 3) return;
    const h = hpRef.current;
    windowHits.current += 1;
    h.strikes += 1;
    h.boss -= 1;
    setBossHp(h.boss);
    sfx("hit");
    buzz(20);
    if (h.boss <= 0) {
      timers.current.forEach(clearTimeout);
      finish(true);
    }
  };

  const pickLane = (i: number) => {
    laneRef.current = i;
    setLane(i);
    sfx("tap");
    buzz(10);
  };

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="comic-panel halftone bg-card p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-3xl animate-hq-float">🌀</span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg tracking-wider text-foreground">DR. VORTEX</p>
            <div className="h-3 overflow-hidden rounded-full border border-border bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(bossHp / BOSS_HP) * 100}%` }}
              />
            </div>
          </div>
          <span className="shrink-0 text-lg">
            {"❤️".repeat(playerHp)}
            {"🖤".repeat(PLAYER_HP - playerHp)}
          </span>
        </div>
      </div>

      <div className="comic-panel halftone relative flex flex-1 flex-col bg-card p-4">
        <p className="mb-3 text-center font-display text-xl tracking-wider text-accent text-pop min-h-7">
          {banner}
        </p>
        <div className="grid flex-1 grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onPointerDown={() => pickLane(i)}
              className={`relative flex flex-col items-center justify-end rounded-xl border-2 pb-4 transition-all ${
                attackLane === i
                  ? "border-destructive bg-destructive/25 animate-flash-danger"
                  : "border-border bg-secondary/40"
              }`}
            >
              {attackLane === i && <span className="absolute top-3 text-3xl">⚠️</span>}
              {lane === i && <span className="text-4xl animate-pop">🕷️</span>}
            </button>
          ))}
        </div>
        {phase === "intro" ? (
          <button
            onPointerDown={() => {
              sfx("tap");
              startTelegraph();
            }}
            className="mt-3 w-full rounded-xl border-2 border-primary bg-primary py-4 font-display text-2xl tracking-widest text-primary-foreground text-pop active:scale-95"
          >
            FIGHT!
          </button>
        ) : (
          <button
            onPointerDown={strike}
            disabled={phase !== "attack"}
            className="mt-3 w-full rounded-xl border-2 border-accent bg-accent py-4 font-display text-2xl tracking-widest text-accent-foreground text-pop transition-all active:scale-95 disabled:opacity-40"
          >
            {phase === "attack" ? "STRIKE! 👊" : "DODGE…"}
          </button>
        )}
      </div>
    </div>
  );
}