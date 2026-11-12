// After joining: "Hand it the first one". A picked chore, or one typed into the hand-over field, rewrites the
// headline to “<chore>.” Never again. and becomes the first-task answer the team receives.
import { setHeadline } from "./headline";
import { waitlist } from "./waitlist-store";
import { track } from "../lib/analytics";
import { safeStorage } from "../lib/platform";
import { sendFirstTask } from "../lib/api";

const KEY = "alma.chore";
const session = safeStorage("session");
const local = safeStorage("local");

/** “Rename 200 screenshots.” — capitalised, one closing full stop, long ones cut. */
export function choreLine(text: string) {
  const t = text.trim().replace(/\s+/g, " ").replace(/[.!?…,;:\s]+$/u, "");
  // long chores are cut at a word boundary, never mid-word (break-ui: "…NetSui…" reads as a bug)
  let cut = `${t}.`;
  if (t.length > 48) {
    const head = t.slice(0, 47);
    const sp = head.lastIndexOf(" ");
    cut = `${(sp > 24 ? head.slice(0, sp) : head).replace(/[\s,;:–-]+$/u, "")}…`;
  }
  return `“${cut.charAt(0).toUpperCase()}${cut.slice(1)}”`;
}

export function initChores(opts: { h1: HTMLElement; sub: HTMLElement; focusEmail: () => void }) {
  const group = document.querySelector<HTMLElement>("[data-chores]");
  const form = document.querySelector<HTMLFormElement>("[data-handover]");
  if (!group && !form) return;
  const buttons = group ? [...group.querySelectorAll<HTMLButtonElement>("[data-chore-pick]")] : [];
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  let handed = session.get(KEY) ?? "";

  const accept = (text: string, source: string) => {
    handed = text.slice(0, 200);
    session.set(KEY, handed);
    track("chore_pick", { source, length: handed.length });
    return true;
  };
  // After joining, the chore is the visitor's first-task answer: it goes to the team (the endpoint is mocked
  // until Alma's backend has one; see src/lib/api.ts) and the headline answers.
  const resolve = (text: string) => {
    setHeadline(opts.h1, [choreLine(text), "Never again."]);
    const s = waitlist.get();
    if (s.status === "success") {
      opts.sub.textContent = "That’s the first thing Alma will hear from you. We’ll email you when your invite is ready.";
      void sendFirstTask(s.email, text).then((ok) => {
        if (!ok) return;
        local.set("alma.waitlist.firstTask", "1");
        // the invite sheet must not ask again for what was just handed over
        const ft = document.querySelector<HTMLElement>("[data-first-task]");
        if (ft) ft.hidden = true;
      });
    } else {
      opts.sub.textContent = "Alma will take it from here. Where should we send your invite?";
    }
  };

  // a drifting chore
  buttons.forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const text = (btn.textContent ?? "").trim();
      if (!text || !accept(text, "drift")) return;
      const viaKeyboard = (e as MouseEvent).detail === 0;
      buttons.forEach((b) => { if (b !== btn) { b.removeAttribute("data-taken"); b.removeAttribute("data-gone"); } });
      btn.setAttribute("data-gone", "");
      resolve(text);
      // the next step is the email. Keyboard and mouse go straight there; touch doesn't pop the keyboard unasked.
      if ((viaKeyboard || finePointer) && waitlist.get().status !== "success") opts.focusEmail();
    }),
  );

  // "Name your own": the field only appears when asked for, so the first view holds one form
  const own = document.querySelector<HTMLButtonElement>("[data-name-own]");
  own?.addEventListener("click", () => {
    if (!form) return;
    form.hidden = false;
    own.hidden = true;
    form.querySelector<HTMLInputElement>("input")!.focus();
    track("chore_name_own");
  });

  // a typed chore
  if (form) {
    const input = form.querySelector<HTMLInputElement>("input")!;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) { input.focus(); return; }
      if (!accept(text, "typed")) return;
      buttons.forEach((b) => { b.removeAttribute("data-taken"); b.removeAttribute("data-gone"); });
      input.value = "";
      resolve(text);
      if (waitlist.get().status !== "success") opts.focusEmail();
    });
  }

  // the chore they handed over becomes their first-task answer automatically
  waitlist.subscribe((s) => {
    if (s.status !== "success" || !handed) return;
    const area = document.querySelector<HTMLTextAreaElement>("[data-first-task] textarea");
    if (area && !area.value) area.value = handed;
  });
}
