import { useEffect, useState } from "react";

/** True only after client hydration — gate any localStorage-backed UI on this. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}