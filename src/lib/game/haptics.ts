export function buzz(pattern: number | number[] = 15) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // haptics unsupported — ignore
  }
}