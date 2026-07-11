export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background halftone px-8">
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-accent animate-ring-pulse" />
        <div
          className="absolute inset-0 rounded-full border-2 border-primary animate-ring-pulse"
          style={{ animationDelay: "0.45s" }}
        />
        <img
          src="/icons/icon-192.png"
          alt="Spider HQ emblem"
          width={112}
          height={112}
          className="relative h-28 w-28 animate-hq-float drop-shadow-[0_0_24px_var(--primary)]"
        />
      </div>
      <h1 className="font-display text-5xl tracking-wider text-primary text-pop animate-pop">
        SPIDER HQ
      </h1>
      <p className="mt-1 text-sm font-semibold uppercase tracking-[0.3em] text-accent animate-slide-up">
        Multiverse Mission Control
      </p>
      <div className="mt-10 h-2 w-56 overflow-hidden rounded-full border border-border bg-card">
        <div
          className="h-full rounded-full bg-primary"
          style={{ animation: "boot-bar 2s ease-in-out both" }}
        />
      </div>
      <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
        Calibrating spider-sense…
      </p>
    </div>
  );
}