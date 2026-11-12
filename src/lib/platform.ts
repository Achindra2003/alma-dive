// Alma is a Mac app. Detect, never block: non-Mac visitors can still join.

export function isMac(): boolean {
  const uaData = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
  const platform = uaData?.platform ?? navigator.platform ?? "";
  if (/mac/i.test(platform)) {
    // iPadOS reports "MacIntel" with touch
    return !(navigator.maxTouchPoints > 1);
  }
  return /Macintosh/.test(navigator.userAgent) && !(navigator.maxTouchPoints > 1);
}

export function safeStorage(kind: "session" | "local") {
  return {
    get(key: string): string | null {
      try { return (kind === "session" ? sessionStorage : localStorage).getItem(key); } catch { return null; }
    },
    set(key: string, value: string): void {
      try { (kind === "session" ? sessionStorage : localStorage).setItem(key, value); } catch { /* private mode */ }
    },
  };
}
