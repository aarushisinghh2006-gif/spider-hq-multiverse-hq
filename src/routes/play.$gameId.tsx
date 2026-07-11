import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import GameShell from "@/components/GameShell";
import { GAMES } from "@/lib/game/games";

function PlayNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="font-display text-4xl text-primary text-pop">MISSION NOT FOUND</p>
      <Link to="/" className="rounded-xl border-2 border-border bg-card px-6 py-3 font-display text-xl tracking-widest">
        BACK TO HQ
      </Link>
    </div>
  );
}

function PlayError({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="font-display text-3xl text-primary text-pop">MISSION GLITCHED</p>
      <button
        onClick={() => {
          router.invalidate();
          reset();
        }}
        className="rounded-xl border-2 border-primary bg-primary px-6 py-3 font-display text-xl tracking-widest text-primary-foreground"
      >
        TRY AGAIN
      </button>
    </div>
  );
}

export const Route = createFileRoute("/play/$gameId")({
  loader: ({ params }) => {
    if (!GAMES.some((g) => g.id === params.gameId)) throw notFound();
  },
  head: ({ params }) => {
    const meta = GAMES.find((g) => g.id === params.gameId);
    const title = meta ? `${meta.name} — Spider HQ` : "Mission — Spider HQ";
    return {
      meta: [
        { title },
        { name: "description", content: meta?.howTo.slice(0, 155) ?? "Spider HQ mission." },
        { property: "og:title", content: title },
        { property: "og:description", content: meta?.tagline ?? "Spider HQ mission." },
      ],
    };
  },
  notFoundComponent: PlayNotFound,
  errorComponent: PlayError,
  component: PlayPage,
});

function PlayPage() {
  const { gameId } = Route.useParams();
  const meta = GAMES.find((g) => g.id === gameId)!;
  return <GameShell meta={meta} />;
}