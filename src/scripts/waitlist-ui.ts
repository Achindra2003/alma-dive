// Renders the waitlist store into the form and the invite sheet.
import { waitlist, type WaitlistState, type WaitlistError } from "./waitlist-store";
import { creature } from "./creature";
import { isMac, safeStorage } from "../lib/platform";
import { sendFirstTask, isMock } from "../lib/api";
import { track } from "../lib/analytics";

const MESSAGES: Record<WaitlistError, string> = {
  invalid: "That email looks incomplete.",
  server: "We couldn’t save that. Try again in a moment.",
  timeout: "That took too long. Try again in a moment.",
  offline: "You’re offline. We’ll keep your email here and send it when you reconnect.",
};

const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const local = safeStorage("local");
const FIRST_TASK_KEY = "alma.waitlist.firstTask";

export function initWaitlist(opts: { onSuccess: (s: Extract<WaitlistState, { status: "success" }>, fresh: boolean) => void }) {
  const root = document.querySelector<HTMLElement>("[data-waitlist]")!;
  const sheet = document.querySelector<HTMLDialogElement>("[data-invite-sheet]")!;
  const form = root.querySelector<HTMLFormElement>(".wl-form")!;
  const input = root.querySelector<HTMLInputElement>(".wl-input")!;
  const btn = root.querySelector<HTMLButtonElement>(".wl-submit")!;
  const btnLabel = root.querySelector<HTMLElement>("[data-label]")!;
  const msg = root.querySelector<HTMLElement>(".wl-msg")!;
  const done = root.querySelector<HTMLElement>("[data-success]")!;
  const helper = root.querySelector<HTMLElement>(".wl-platform")!;
  helper.textContent = (isMac() ? helper.dataset.mac : helper.dataset.other) ?? helper.textContent;
  let lastStatus = waitlist.get().status;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    waitlist.submit(input.value, "hero");
  });
  input.addEventListener("input", () => {
    waitlist.setDraft(input.value);
    input.removeAttribute("aria-invalid");
    if (root.dataset.status === "error") msg.textContent = "";
  });
  // nothing on the page reacts to focus (motion audit); the first focus is a funnel step
  input.addEventListener("focus", () => track("field_focus"), { once: true });

  // ---------- invite sheet ----------
  const openSheet = () => { if (!sheet.open) sheet.showModal(); };
  done.querySelector("[data-open-invite]")!.addEventListener("click", openSheet);
  sheet.querySelector("[data-close]")!.addEventListener("click", () => sheet.close());
  sheet.addEventListener("click", (e) => { if (e.target === sheet) sheet.close(); });
  sheet.addEventListener("close", () => done.focus({ preventScroll: true }));

  const ft = sheet.querySelector<HTMLFormElement>("[data-first-task]")!;
  if (local.get(FIRST_TASK_KEY)) ft.hidden = true;
  ft.addEventListener("submit", async (e) => {
    e.preventDefault();
    const s = waitlist.get();
    const area = ft.querySelector("textarea")!;
    const out = ft.querySelector<HTMLElement>("[data-first-task-msg]")!;
    const text = area.value.trim();
    if (!text || s.status !== "success") { area.focus(); return; }
    out.textContent = "Sending…";
    const ok = await sendFirstTask(s.email, text);
    out.textContent = ok ? "Thanks. That goes straight to the team." : "That didn’t send. Try again in a moment.";
    if (ok) {
      local.set(FIRST_TASK_KEY, "1");
      track("first_task_answer", { length: text.length });
      setTimeout(() => (ft.hidden = true), 1600);
    }
  });

  sheet.querySelector<HTMLButtonElement>("[data-copy]")!.addEventListener("click", async (e) => {
    const b = e.currentTarget as HTMLButtonElement;
    const link = sheet.querySelector<HTMLElement>("[data-link]")!.textContent ?? "";
    const label = b.querySelector<HTMLElement>("[data-copy-label]")!;
    try {
      await navigator.clipboard.writeText(link);
      label.textContent = "Copied";
      track("invite_copy");
    } catch {
      const range = document.createRange();
      range.selectNodeContents(sheet.querySelector("[data-link]")!);
      getSelection()?.removeAllRanges();
      getSelection()?.addRange(range);
      label.textContent = "Press ⌘C";
    }
    setTimeout(() => (label.textContent = "Copy"), 2000);
  });
  sheet.querySelector("[data-share-x]")!.addEventListener("click", () => track("invite_share_x"));

  // ---------- render ----------
  waitlist.subscribe((s) => {
    render(s);
    const fresh = s.status === "success" && lastStatus !== "success";
    if (s.status === "success") {
      if (fresh) celebrate(s);
      opts.onSuccess(s, fresh && lastStatus === "submitting");
    }
    if (s.status === "error" && lastStatus === "submitting") creature.setState("startle");
    lastStatus = s.status;
  });

  function render(s: WaitlistState) {
    root.dataset.status = s.status;
    if (s.status !== "success" && document.activeElement !== input) input.value = s.draft;
    btn.setAttribute("aria-busy", String(s.status === "submitting"));
    btnLabel.textContent = s.status === "submitting" ? "Saving your spot…" : "Get early access";

    if (s.status === "error") {
      input.setAttribute("aria-invalid", String(s.error === "invalid"));
      msg.textContent = MESSAGES[s.error];
    } else {
      input.removeAttribute("aria-invalid");
      msg.textContent = "";
    }

    form.hidden = s.status === "success";
    done.hidden = s.status !== "success";
    if (s.status !== "success") return;

    sheet.querySelector("[data-invite-title]")!.textContent = s.existed ? "You’re already on the list" : "Your invite link";
    sheet.querySelector("[data-invite-note]")!.textContent = s.mock ? "Share your link. (Mock: referral credit isn’t live yet.)" : "Share your link.";
    const pos = sheet.querySelector<HTMLElement>("[data-position]")!;
    if (s.position) {
      pos.hidden = false;
      pos.textContent = `You’re #${s.position.toLocaleString("en-US")} in line${s.mock ? " (example: mock data)" : ""}.`;
    }
    const invite = sheet.querySelector<HTMLElement>("[data-invite]")!;
    if (s.referralCode) {
      const link = `https://alma.inc/?ref=${s.referralCode}`;
      invite.hidden = false;
      sheet.querySelector("[data-link]")!.textContent = link;
      const text = encodeURIComponent("I'm on the Alma waitlist. Say it, watch your Mac do it.");
      sheet.querySelector<HTMLAnchorElement>("[data-share-x]")!.href = `https://x.com/intent/post?text=${text}&url=${encodeURIComponent(link)}`;
    }
  }

  function celebrate(s: Extract<WaitlistState, { status: "success" }>) {
    done.animate(
      reduceMotion() ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, filter: "blur(2px)" }, { opacity: 1, filter: "blur(0)" }],
      { duration: 220, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
    );
    done.focus({ preventScroll: true });
    creature.setState("bloom");
    // The bloom is the peak: nothing covers it. The invite sheet opens only from "See your invite".
    setTimeout(() => creature.state === "bloom" && creature.setState("idle"), 4200);
    void s;
  }

  if (isMock) console.info("[alma] Waitlist is in mock mode. Set PUBLIC_WAITLIST_MODE=live to use POST /waitlist.");

  return {
    focus() {
      if (waitlist.get().status === "success") { openSheet(); return; }
      input.focus({ preventScroll: true });
    },
    get input() { return input; },
  };
}
