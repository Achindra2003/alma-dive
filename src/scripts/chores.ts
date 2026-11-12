// After joining: "What should Alma take off your hands first?" [05-CONVERSION §1 qualifier, C8].
// Round 8 [USER: "quite shittly done and very jittery when the copy changes"]: the headline no longer changes; the
// choices stay where they are (one is marked, and it can change); the question line answers in place with a short
// crossfade; "Something else" swaps the row for a field and Escape brings the row back. Layout changes glide (flip.ts).
// The answer goes to the team as the first-task answer (mocked until Alma's backend has the endpoint: src/lib/api.ts).
import { waitlist } from "./waitlist-store";
import { track } from "../lib/analytics";
import { safeStorage } from "../lib/platform";
import { sendFirstTask } from "../lib/api";

const KEY = "alma.chore";
const QUESTION = "What should Alma take off your hands first?";
const session = safeStorage("session");
const local = safeStorage("local");
const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** “Rename 200 screenshots” as a quote, one line: cut at a word boundary, never mid-word. */
export function choreLine(text: string) {
  const t = text.trim().replace(/\s+/g, " ").replace(/[.!?…,;:\s]+$/u, "");
  let cut = t;
  if (t.length > 40) {
    const head = t.slice(0, 39);
    const sp = head.lastIndexOf(" ");
    cut = `${(sp > 20 ? head.slice(0, sp) : head).replace(/[\s,;:–-]+$/u, "")}…`;
  }
  return `“${cut.charAt(0).toUpperCase()}${cut.slice(1)}”`;
}

export function initChores() {
  const group = document.querySelector<HTMLElement>("[data-chores]");
  if (!group) return;
  const lead = group.querySelector<HTMLElement>("[data-chores-lead]")!;
  const row = group.querySelector<HTMLElement>("[data-chore-row]")!;
  const form = group.querySelector<HTMLFormElement>("[data-handover]")!;
  const input = form.querySelector<HTMLInputElement>("input")!;
  const own = group.querySelector<HTMLButtonElement>("[data-name-own]")!;
  const picks = [...group.querySelectorAll<HTMLButtonElement>("[data-chore-pick]")];
  const all = [...picks, own];

  // the question line answers in place: same line, same height; the new words fade in (set at once, so two
  // answers in quick succession can never leave the wrong one showing)
  function say(text: string) {
    if (lead.textContent === text) return;
    lead.textContent = text;
    if (!reduce()) lead.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
  }
  const mark = (btn: HTMLButtonElement | null) => all.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));

  function answer(text: string, source: "pick" | "typed", btn: HTMLButtonElement) {
    const handed = text.trim().slice(0, 200);
    if (!handed) return;
    session.set(KEY, handed);
    track(source === "pick" ? "chore_pick" : "chore_name_own", { length: handed.length });
    mark(btn);
    say(`Noted. Alma will start with ${choreLine(handed)}.`);
    const s = waitlist.get();
    if (s.status !== "success") return;
    void sendFirstTask(s.email, handed).then((ok) => {
      if (!ok) return;
      local.set("alma.waitlist.firstTask", "1");
      // the invite sheet must not ask again for what was just handed over [C8]
      const ft = document.querySelector<HTMLElement>("[data-first-task]");
      if (ft) ft.hidden = true;
      const area = document.querySelector<HTMLTextAreaElement>("[data-first-task] textarea");
      if (area && !area.value) area.value = handed;
    });
  }

  picks.forEach((btn) => btn.addEventListener("click", () => answer((btn.textContent ?? "").trim(), "pick", btn)));

  // "Something else": the field takes the choices' place in the same cell (no height change); "Back to the choices",
  // Escape or an empty submit brings the choices back
  const showField = (on: boolean) => {
    row.toggleAttribute("data-off", on);
    row.inert = on;
    form.toggleAttribute("data-off", !on);
    form.inert = !on;
    if (on) { say("Name it. Alma will start there."); input.focus({ preventScroll: true }); }
  };
  const back = () => {
    input.value = "";
    showField(false);
    const prev = session.get(KEY);
    say(prev ? `Noted. Alma will start with ${choreLine(prev)}.` : QUESTION);
    own.focus({ preventScroll: true });
  };
  group.querySelector("[data-handover-back]")!.addEventListener("click", back);
  own.addEventListener("click", () => {
    track("chore_own_open");
    showField(true);
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    showField(false);
    if (!text) { back(); return; }
    answer(text, "typed", own);
    own.focus({ preventScroll: true });
  });
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    e.preventDefault();
    back();
  });

  // a returning visitor sees what they already handed over
  const prev = session.get(KEY);
  if (prev) {
    const btn = picks.find((b) => (b.textContent ?? "").trim() === prev) ?? own;
    mark(btn);
    lead.textContent = `Noted. Alma will start with ${choreLine(prev)}.`;
  }
}
