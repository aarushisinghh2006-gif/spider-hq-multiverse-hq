import { MAX_LIVES, POWERS, type PowerId } from "@/lib/game/trial";
import type { Engine } from "./engine";

export function TrialHud({
  engine,
  rank,
  totalPlayers,
  gap,
  ownedPower,
}: {
  engine: Engine;
  rank: number;
  totalPlayers: number;
  gap: number;
  ownedPower: PowerId;
}) {
  const power = POWERS.find((p) => p.id === ownedPower)!;
  const used = !!engine.powerUsed[ownedPower];
  const urgent = engine.timeLeft <= 10;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-lg leading-none">
          {Array.from({ length: MAX_LIVES }, (_, i) => (
            <span key={i} className={i < engine.lives ? "" : "opacity-25 grayscale"}>
              ❤️
            </span>
          ))}
        </div>
        <span
          className={`font-display text-2xl tracking-wider text-pop ${
            urgent ? "text-destructive animate-pop" : engine.frozen ? "text-accent" : "text-foreground"
          }`}
        >
          {engine.frozen ? "⚡" : ""}
          {Math.ceil(engine.timeLeft)}s
        </span>
        <span className="font-display text-2xl tracking-wider text-gold text-pop">
          {engine.score}
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full border-2 border-border bg-secondary">
        <div
          className="h-full bg-primary transition-[width] duration-100"
          style={{ width: `${Math.max(0, Math.min(100, (1 - engine.progress) * 100))}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-widest">
        <span className="text-muted-foreground">
          YOU ARE #{rank}
          <span className="text-muted-foreground/60"> / {totalPlayers}</span>
        </span>
        {engine.streak >= 2 && (
          <span className="text-primary">🔥 {engine.streak} STREAK</span>
        )}
        <span className={gap > 0 ? "text-destructive" : "text-accent"}>
          {gap > 0 ? `⚡ ${gap} PTS FROM QUALIFYING` : "✅ IN QUALIFYING ZONE"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={used}
          onPointerDown={() => engine.usePower(ownedPower)}
          className={`flex flex-1 items-center gap-2 rounded-xl border-2 px-3 py-2 text-left active:scale-[0.98] ${
            used
              ? "border-border bg-secondary opacity-50"
              : "border-accent bg-accent/10 glow-accent"
          }`}
        >
          <span className="text-xl">{power.emoji}</span>
          <span className="min-w-0">
            <span className="block truncate font-display text-base tracking-wide text-accent">
              {power.name.toUpperCase()}
            </span>
            <span className="block truncate text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {used ? "Used this round" : power.desc}
            </span>
          </span>
        </button>
      </div>

      <div className="h-6">
        {engine.toast && (
          <p
            key={engine.toast.id}
            className={`text-center font-display text-lg tracking-wider text-pop animate-pop ${
              engine.toast.tone === "good" ? "text-accent" : "text-destructive"
            }`}
          >
            {engine.toast.text}
          </p>
        )}
      </div>
    </div>
  );
}

export function MiniLeaderboard({
  board,
}: {
  board: { name: string; score: number; you: boolean }[];
}) {
  const youIndex = board.findIndex((b) => b.you);
  const slice = board.slice(0, 5);
  const rows = slice.some((r) => r.you)
    ? slice
    : [...slice.slice(0, 4), board[youIndex]];

  return (
    <div className="comic-panel bg-card p-3">
      <p className="mb-2 font-display text-lg tracking-wider text-primary text-pop">
        🕷️ LIVE LEADERBOARD
      </p>
      <ul className="space-y-1">
        {rows.map((r) => (
          <li
            key={r.name}
            className={`flex items-center justify-between gap-2 rounded-lg px-2 py-1 text-sm font-bold ${
              r.you ? "border-2 border-gold bg-gold/10 text-gold" : "text-muted-foreground"
            }`}
          >
            <span className="truncate">
              {board.indexOf(r) + 1}. {r.you ? `${r.name} (YOU)` : r.name}
            </span>
            <span className="font-display tracking-wider">{r.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
