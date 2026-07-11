import { createFileRoute } from "@tanstack/react-router";
import { Check, Pencil } from "lucide-react";
import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import MuteButton from "@/components/MuteButton";
import PlayerCard from "@/components/PlayerCard";
import { ACHIEVEMENTS } from "@/lib/game/achievements";
import { THEMES } from "@/lib/game/games";
import { buzz } from "@/lib/game/haptics";
import { sfx } from "@/lib/game/sound";
import { useGame } from "@/lib/game/store";
import { useMounted } from "@/lib/game/useMounted";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Hero Profile — Spider HQ" },
      { name: "description", content: "Your hero rank, achievements and unlockable HQ themes." },
      { property: "og:title", content: "Hero Profile — Spider HQ" },
      { property: "og:description", content: "Rank, achievements and unlockable themes." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const mounted = useMounted();
  return (
    <div className="mx-auto max-w-md p-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="mb-4 flex items-center justify-between gap-2">
        <h1 className="font-display text-3xl tracking-wider text-primary text-pop">HERO PROFILE</h1>
        <MuteButton />
      </header>
      {mounted && (
        <div className="flex flex-col gap-5">
          <PlayerCard />
          <NameEditor />
          <Stats />
          <ThemeShop />
          <Achievements />
        </div>
      )}
      <BottomNav />
    </div>
  );
}

function NameEditor() {
  const name = useGame((s) => s.name);
  const setName = useGame((s) => s.setName);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  return (
    <div className="comic-panel flex items-center gap-2 bg-card p-3">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Codename
      </span>
      {editing ? (
        <>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={18}
            autoFocus
            className="min-w-0 flex-1 rounded-lg border-2 border-accent bg-secondary px-3 py-1.5 font-display text-lg tracking-wide text-foreground outline-none"
          />
          <button
            aria-label="Save codename"
            onClick={() => {
              setName(draft.trim());
              setEditing(false);
              sfx("unlock");
              buzz(15);
            }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-success bg-success/20 text-success"
          >
            <Check className="h-4 w-4" />
          </button>
        </>
      ) : (
        <>
          <span className="min-w-0 flex-1 truncate font-display text-xl tracking-wide text-foreground">
            {name}
          </span>
          <button
            aria-label="Edit codename"
            onClick={() => {
              setDraft(name);
              setEditing(true);
              sfx("tap");
            }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-border bg-secondary text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}

function Stats() {
  const totalMissions = useGame((s) => s.totalMissions);
  const coinsEarned = useGame((s) => s.coinsEarned);
  const achievements = useGame((s) => s.achievements);
  const cells = [
    { label: "Missions", value: totalMissions, emoji: "🎯" },
    { label: "Coins earned", value: coinsEarned, emoji: "🪙" },
    { label: "Badges", value: `${achievements.length}/${ACHIEVEMENTS.length}`, emoji: "🏅" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {cells.map((c) => (
        <div key={c.label} className="comic-panel halftone bg-card p-3 text-center">
          <div className="text-xl">{c.emoji}</div>
          <p className="font-display text-2xl text-foreground">{c.value}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {c.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function ThemeShop() {
  const coins = useGame((s) => s.coins);
  const theme = useGame((s) => s.theme);
  const unlocked = useGame((s) => s.unlockedThemes);
  const setTheme = useGame((s) => s.setTheme);
  const buyTheme = useGame((s) => s.buyTheme);

  return (
    <section>
      <h2 className="mb-2 font-display text-2xl tracking-wider text-foreground text-pop">
        HQ THEMES
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {THEMES.map((t) => {
          const owned = unlocked.includes(t.id);
          const active = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                if (owned) {
                  setTheme(t.id);
                  sfx("tap");
                  buzz(10);
                } else if (buyTheme(t.id)) {
                  sfx("unlock");
                  buzz([20, 30, 20]);
                } else {
                  sfx("miss");
                }
              }}
              className={`comic-panel flex flex-col gap-2 bg-card p-3 text-left transition-transform active:scale-95 ${
                active ? "border-accent glow-accent" : ""
              }`}
            >
              <div className="flex gap-1.5">
                {t.swatch.map((c) => (
                  <span
                    key={c}
                    className="h-6 w-6 rounded-full border-2 border-border"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <p className="font-display text-lg leading-tight tracking-wide text-foreground">
                {t.name}
              </p>
              <p className="text-[11px] font-semibold leading-snug text-muted-foreground">
                {t.desc}
              </p>
              <p className="mt-auto font-display text-sm tracking-wider text-gold">
                {active ? "EQUIPPED" : owned ? "TAP TO EQUIP" : coins >= t.cost ? `BUY · ${t.cost} 🪙` : `🔒 ${t.cost} 🪙`}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Achievements() {
  const unlocked = useGame((s) => s.achievements);
  return (
    <section>
      <h2 className="mb-2 font-display text-2xl tracking-wider text-foreground text-pop">
        ACHIEVEMENTS
      </h2>
      <div className="flex flex-col gap-2">
        {ACHIEVEMENTS.map((a) => {
          const got = unlocked.includes(a.id);
          return (
            <div
              key={a.id}
              className={`flex items-center gap-3 rounded-xl border-2 p-2.5 ${
                got ? "border-gold/70 bg-gold/10" : "border-border bg-card opacity-55 grayscale"
              }`}
            >
              <span className="text-2xl">{got ? a.emoji : "🔒"}</span>
              <div className="min-w-0">
                <p className={`font-display text-lg leading-tight tracking-wide ${got ? "text-gold" : "text-foreground"}`}>
                  {a.name}
                </p>
                <p className="truncate text-xs font-semibold text-muted-foreground">{a.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}