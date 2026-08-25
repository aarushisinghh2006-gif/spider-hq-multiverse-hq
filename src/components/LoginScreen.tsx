import { useState } from "react";
import { buzz } from "@/lib/game/haptics";
import { sfx } from "@/lib/game/sound";
import { useGame } from "@/lib/game/store";
import SeasonTimer from "@/components/SeasonTimer";

export default function LoginScreen() {
  const login = useGame((s) => s.login);
  const roster = useGame((s) => s.roster);
  const [value, setValue] = useState("");

  const submit = (name: string) => {
    if (!name.trim()) return;
    sfx("unlock");
    buzz(20);
    login(name);
  };

  const recent = [...roster].sort((a, b) => b.updated - a.updated).slice(0, 4);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 p-6">
      <div className="text-center animate-slide-up">
        <span className="text-6xl animate-hq-float">🕷️</span>
        <h1 className="mt-2 font-display text-4xl tracking-wider text-primary text-pop">
          SPIDER HQ
        </h1>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-accent">
          Agent sign-in required
        </p>
      </div>

      <SeasonTimer />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className="comic-panel halftone flex flex-col gap-3 bg-card p-5 animate-slide-up"
      >
        <label
          htmlFor="hero-name"
          className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
        >
          Enter your hero name
        </label>
        <input
          id="hero-name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={18}
          placeholder="e.g. Night-Weaver"
          className="w-full rounded-xl border-2 border-accent bg-secondary px-4 py-3 font-display text-xl tracking-wide text-foreground outline-none placeholder:text-muted-foreground/60"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="w-full rounded-xl border-2 border-primary bg-primary py-3.5 font-display text-2xl tracking-widest text-primary-foreground text-pop glow-primary active:scale-95 disabled:opacity-40"
        >
          ENTER HQ
        </button>
        <p className="text-center text-[11px] font-semibold text-muted-foreground">
          No password — your name is your agent ID. Points stack on the global leaderboard.
        </p>
      </form>

      {recent.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 animate-slide-up">
          {recent.map((r) => (
            <button
              key={r.name}
              onClick={() => submit(r.name)}
              className="rounded-full border-2 border-border bg-card px-3.5 py-1.5 font-display text-sm tracking-wider text-foreground active:scale-95"
            >
              {r.name} · {r.points}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
