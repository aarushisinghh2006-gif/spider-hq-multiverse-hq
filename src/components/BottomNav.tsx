import { Link } from "@tanstack/react-router";
import { Home, Trophy, User } from "lucide-react";

const tabs = [
  { to: "/", label: "HQ", icon: Home },
  { to: "/leaderboard", label: "Ranks", icon: Trophy },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-border bg-popover/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {tabs.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-muted-foreground transition-colors"
            activeOptions={{ exact: to === "/" }}
            activeProps={{ className: "text-primary" }}
          >
            <Icon className="h-5 w-5" />
            <span className="font-display text-sm tracking-wider">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}