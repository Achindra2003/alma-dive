// Waitlist adapter. "live" talks to Alma's endpoint; "mock" simulates the
// responses the backend still needs to add (position, referral code).

export type JoinResult =
  | { ok: true; status: "created" | "exists"; position?: number; referralCode?: string; mock: boolean }
  | { ok: false; error: "invalid" | "server" | "offline" | "timeout" };

const MODE: "live" | "mock" = import.meta.env.PUBLIC_WAITLIST_MODE === "live" ? "live" : "mock";
const TIMEOUT_MS = 10_000;

export const isMock = MODE === "mock";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

async function mockJoin(email: string, ref?: string): Promise<JoinResult> {
  await new Promise((r) => setTimeout(r, 700));
  const local = email.split("@")[0].toLowerCase();
  // Test hooks for the break-it pass
  if (local === "fail") return { ok: false, error: "server" };
  if (local === "slow") { await new Promise((r) => setTimeout(r, TIMEOUT_MS + 500)); }
  const h = hash(email.toLowerCase());
  return {
    ok: true,
    status: local === "exists" ? "exists" : "created",
    position: 1200 + (h % 3600) - (ref ? 250 : 0),
    referralCode: h.toString(36).slice(0, 7),
    mock: true,
  };
}

async function liveJoin(email: string, ref?: string): Promise<JoinResult> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch("/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ref ? { email, ref } : { email }),
      signal: ctrl.signal,
    });
    if (res.status === 400 || res.status === 422) return { ok: false, error: "invalid" };
    if (!res.ok) return { ok: false, error: "server" };
    // Current endpoint may return no body. Future contract: { status, position, referralCode }
    const body = await res.json().catch(() => ({}));
    return {
      ok: true,
      status: body.status === "exists" ? "exists" : "created",
      position: typeof body.position === "number" ? body.position : undefined,
      referralCode: typeof body.referralCode === "string" ? body.referralCode : undefined,
      mock: false,
    };
  } catch (e) {
    if ((e as Error).name === "AbortError") return { ok: false, error: "timeout" };
    return { ok: false, error: navigator.onLine ? "server" : "offline" };
  } finally {
    clearTimeout(timer);
  }
}

export function joinWaitlist(email: string, ref?: string): Promise<JoinResult> {
  if (!navigator.onLine) return Promise.resolve({ ok: false, error: "offline" });
  if (MODE === "mock") {
    const ctrl = new Promise<JoinResult>((r) => setTimeout(() => r({ ok: false, error: "timeout" }), TIMEOUT_MS));
    return Promise.race([mockJoin(email, ref), ctrl]);
  }
  return liveJoin(email, ref);
}

export async function sendFirstTask(email: string, firstTask: string): Promise<boolean> {
  if (MODE === "mock") {
    await new Promise((r) => setTimeout(r, 400));
    return true;
  }
  try {
    const res = await fetch("/waitlist/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, firstTask }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
