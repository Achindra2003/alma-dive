// One waitlist state shared by every form placement (hero, sticky, bloom).
import { joinWaitlist, type JoinResult } from "../lib/api";
import { track } from "../lib/analytics";
import { safeStorage } from "../lib/platform";

export type Placement = "hero" | "sticky" | "bloom" | "bridge";
export type WaitlistError = "invalid" | "server" | "offline" | "timeout";

export type WaitlistState =
  | { status: "idle"; draft: string }
  | { status: "submitting"; draft: string; placement: Placement }
  | { status: "error"; draft: string; error: WaitlistError; placement: Placement }
  | {
      status: "success";
      email: string;
      existed: boolean;
      position?: number;
      referralCode?: string;
      mock: boolean;
      placement: Placement;
    };

const KEY = "alma.waitlist.v1";
const local = safeStorage("local");
const session = safeStorage("session");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;
export const isValidEmail = (v: string) => v.length <= 254 && EMAIL_RE.test(v);

function restore(): WaitlistState {
  const saved = local.get(KEY);
  if (saved) {
    try {
      const s = JSON.parse(saved);
      if (s && s.status === "success" && typeof s.email === "string") return s;
    } catch { /* ignore */ }
  }
  return { status: "idle", draft: session.get(`${KEY}.draft`) ?? "" };
}

let state: WaitlistState = restore();
const subs = new Set<(s: WaitlistState) => void>();

function set(next: WaitlistState) {
  state = next;
  if (next.status === "success") local.set(KEY, JSON.stringify(next));
  else session.set(`${KEY}.draft`, next.draft);
  subs.forEach((fn) => fn(state));
}

export const waitlist = {
  get: () => state,
  subscribe(fn: (s: WaitlistState) => void) {
    subs.add(fn);
    fn(state);
    return () => subs.delete(fn);
  },
  setDraft(draft: string) {
    if (state.status === "idle" || state.status === "error") {
      state = { ...state, draft } as WaitlistState;
      session.set(`${KEY}.draft`, draft);
    }
  },
  async submit(raw: string, placement: Placement) {
    if (state.status === "submitting" || state.status === "success") return;
    const email = raw.trim();
    if (!isValidEmail(email)) {
      set({ status: "error", draft: email, error: "invalid", placement });
      track("waitlist_error", { placement, error: "invalid" });
      return;
    }
    set({ status: "submitting", draft: email, placement });
    track("waitlist_submit", { placement });
    const ref = session.get("alma.ref") ?? undefined;
    const res: JoinResult = await joinWaitlist(email, ref);
    if (res.ok) {
      set({
        status: "success",
        email,
        existed: res.status === "exists",
        position: res.position,
        referralCode: res.referralCode,
        mock: res.mock,
        placement,
      });
      track("waitlist_success", { placement, status: res.status });
    } else {
      set({ status: "error", draft: email, error: res.error, placement });
      track("waitlist_error", { placement, error: res.error });
    }
  },
};

// Offline: keep the email, retry once the connection is back.
addEventListener("online", () => {
  if (state.status === "error" && state.error === "offline") waitlist.submit(state.draft, state.placement);
});

// Referral attribution from ?ref=
try {
  const ref = new URLSearchParams(location.search).get("ref");
  if (ref && /^[a-z0-9]{3,16}$/i.test(ref)) session.set("alma.ref", ref);
} catch { /* ignore */ }
