import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buzz } from "@/lib/game/haptics";
import { sfx } from "@/lib/game/sound";
import { MAX_LIVES, POWERS, WRONG_PENALTY, scoreCorrect, type PowerId, type RoundDef } from "@/lib/game/trial";

export interface Toast {
  id: number;
  text: string;
  tone: "good" | "bad";
}

export interface Engine {
  round: RoundDef;
  score: number;
  lives: number;
  streak: number;
  bestStreak: number;
  correct: number;
  wrong: number;
  fastestMs: number;
  level: number;
  timeLeft: number;
  frozen: boolean;
  toast: Toast | null;
  hintOn: boolean;
  revealOn: boolean;
  skipToken: number;
  powerUsed: Partial<Record<PowerId, boolean>>;
  ended: "time" | "lives" | null;
  usePower: (id: PowerId) => void;
  clearAssist: () => void;
  answerCorrect: (ms: number) => void;
  answerWrong: () => void;
  addPoints: (points: number, label: string) => void;
  penalize: (points: number, loseLife: boolean, label: string) => void;
  addTime: (seconds: number) => void;
  bumpLevel: () => void;
  progress: number;
}

export function useRoundEngine(round: RoundDef, hint: string, ownedPower: PowerId): Engine {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [fastestMs, setFastestMs] = useState(9999);
  const [level, setLevel] = useState(1);
  const [ms, setMs] = useState(round.duration * 1000);
  const [frozenUntil, setFrozenUntil] = useState(0);
  const [toast, setToast] = useState<Toast | null>(null);
  const [hintOn, setHintOn] = useState(false);
  const [revealOn, setRevealOn] = useState(false);
  const [skipToken, setSkipToken] = useState(0);
  const [powerUsed, setPowerUsed] = useState<Partial<Record<PowerId, boolean>>>({});
  const [ended, setEnded] = useState<"time" | "lives" | null>(null);
  const streakForLife = useRef(0);
  const toastId = useRef(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setMs((prev) => {
        if (Date.now() < frozenUntil) return prev;
        const next = prev - 100;
        if (next <= 0) {
          setEnded((e) => e ?? "time");
          return 0;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(iv);
  }, [frozenUntil]);

  const say = useCallback((text: string, tone: "good" | "bad") => {
    toastId.current += 1;
    setToast({ id: toastId.current, text, tone });
  }, []);

  const answerCorrect = useCallback(
    (reactionMs: number) => {
      const nextStreak = streak + 1;
      const delta = scoreCorrect(reactionMs, nextStreak);
      setScore((s) => s + delta.points);
      setStreak(nextStreak);
      setBestStreak((b) => Math.max(b, nextStreak));
      setCorrect((c) => c + 1);
      setFastestMs((f) => Math.min(f, reactionMs));
      streakForLife.current += 1;
      let text = `${delta.label} +${delta.points}`;
      if (streakForLife.current >= 3) {
        streakForLife.current = 0;
        setLives((l) => {
          if (l < MAX_LIVES) {
            text += " · ❤️ +1 LIFE";
            return l + 1;
          }
          return l;
        });
      }
      say(text, "good");
      sfx(delta.comboBonus > 0 ? "levelup" : "hit");
      buzz(delta.comboBonus > 0 ? [20, 30, 20] : 12);
    },
    [say, streak],
  );

  const penalize = useCallback(
    (points: number, loseLife: boolean, label: string) => {
      setScore((s) => s - points);
      setStreak(0);
      streakForLife.current = 0;
      if (loseLife) {
        setLives((l) => {
          const next = l - 1;
          if (next <= 0) setEnded((e) => e ?? "lives");
          return Math.max(0, next);
        });
      }
      say(`${label} −${points}`, "bad");
      sfx("miss");
      buzz([40, 30, 40]);
    },
    [say],
  );

  const answerWrong = useCallback(() => {
    setWrong((w) => w + 1);
    penalize(WRONG_PENALTY, true, "WRONG!");
  }, [penalize]);

  const addPoints = useCallback(
    (points: number, label: string) => {
      setScore((s) => s + points);
      say(`${label} +${points}`, "good");
    },
    [say],
  );

  const addTime = useCallback((seconds: number) => {
    setMs((prev) => Math.max(0, prev + seconds * 1000));
  }, []);

  const usePower = useCallback(
    (id: PowerId) => {
      if (powerUsed[id] || id !== ownedPower) return;
      setPowerUsed((p) => ({ ...p, [id]: true }));
      sfx("unlock");
      buzz(25);
      const def = POWERS.find((p) => p.id === id)!;
      if (id === "spider-sense") {
        setHintOn(true);
        say(`${def.emoji} ${hint}`, "good");
      } else if (id === "spider-vision") {
        setRevealOn(true);
        say("👁️ Two wrong options webbed up", "good");
      } else if (id === "web-blast") {
        setFrozenUntil(Date.now() + 5000);
        say("⚡ Timer frozen 5s", "good");
      } else {
        setSkipToken((t) => t + 1);
        say("🌀 Challenge skipped", "good");
      }
    },
    [hint, ownedPower, powerUsed, say],
  );

  const clearAssist = useCallback(() => {
    setHintOn(false);
    setRevealOn(false);
  }, []);

  const frozen = Date.now() < frozenUntil;
  const timeLeft = ms / 1000;
  const progress = useMemo(
    () => 1 - Math.max(0, Math.min(1, ms / (round.duration * 1000))),
    [ms, round.duration],
  );

  return {
    round,
    score,
    lives,
    streak,
    bestStreak,
    correct,
    wrong,
    fastestMs,
    level,
    timeLeft,
    frozen,
    toast,
    hintOn,
    revealOn,
    skipToken,
    powerUsed,
    ended,
    usePower,
    clearAssist,
    answerCorrect,
    answerWrong,
    addPoints,
    penalize,
    addTime,
    bumpLevel: () => setLevel((l) => l + 1),
    progress,
  };
}
