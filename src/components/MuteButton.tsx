import { Volume2, VolumeX } from "lucide-react";
import { buzz } from "@/lib/game/haptics";
import { sfx } from "@/lib/game/sound";
import { useGame } from "@/lib/game/store";

export default function MuteButton() {
  const muted = useGame((s) => s.muted);
  const toggleMute = useGame((s) => s.toggleMute);
  return (
    <button
      aria-label={muted ? "Unmute sound" : "Mute sound"}
      onClick={() => {
        toggleMute();
        buzz(10);
        if (muted) sfx("tap");
      }}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-border bg-card text-foreground transition-transform active:scale-90"
    >
      {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
    </button>
  );
}