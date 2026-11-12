// The Dive, controller (docs/dive/01-PLAN.md). The page works before any of this runs:
// the form posts natively and the proof link is a plain link.
import { bootCreature, creature, type AnchorOptions } from "./creature";
import { initDive, RESTS, AT, type Rest } from "./dive";
import { initWaitlist } from "./waitlist-ui";
import { initTheatre } from "./theatre";
import { initRipples, ripple } from "./ripples";
import { initFlip, armFlip } from "./flip";
import { initChores } from "./chores";
import { setHeadline } from "./headline";
import { waitlist } from "./waitlist-store";
import { DEFAULT_DEMO } from "../data/demos";
import { track, trafficContext } from "../lib/analytics";
import { isMac } from "../lib/platform";

const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s)!;
const root = document.documentElement;

const stage = $("[data-stage]");
const h1 = $("[data-headline]");
const sub = $("[data-sub]");

// ---------- the dive: the image and the three rests ----------
// One persistent scene; native scroll conducts it (dive.ts). The creature's path has one composed stop per rest; the
// whole animal (crown to the longest tips) is sized from its region (desktop: the stage; phones: the band above the
// text). Composition by depth: 01-PLAN.md §10–11.
const REST_STOP: Record<Rest, { wide: AnchorOptions; narrow: AnchorOptions }> = {
  surface: { wide: { x: 0.68, top: 0.15, span: 0.68, maxW: 0.36 }, narrow: { x: 0.5, top: 0.02, span: 0.94, maxW: 0.62 } },
  mid: { wide: { x: 0.66, top: 0.08, span: 0.6, maxW: 0.32 }, narrow: { x: 0.44, top: 0.04, span: 0.86, maxW: 0.56 } },
  deep: { wide: { x: 0.5, top: 0.07, span: 0.4, maxW: 0.2 }, narrow: { x: 0.5, top: 0.12, span: 0.66, maxW: 0.4 } },
};
bootCreature($<HTMLCanvasElement>("[data-creature-canvas]"));
const slot = $("[data-creature-slot]");
const dock = $("[data-dock]");
const restEls = Object.fromEntries(RESTS.map((r) => [r, $(`[data-rest="${r}"]`)])) as Record<Rest, HTMLElement>;
const narrow = matchMedia("(max-width: 1023px)");
const marks = [...document.querySelectorAll<HTMLButtonElement>("[data-goto]")];
const reached = new Set<Rest>();

// Desktop, The deep: the line sits under the creature, so the animal is sized to end above it (the creature
// never overlaps the copy [USER]). offsetTop: the layout position, whatever the choreography is doing to it.
function stops(): AnchorOptions[] {
  return RESTS.map((r) => {
    const a = { ...(narrow.matches ? REST_STOP[r].narrow : REST_STOP[r].wide) };
    if (r === "deep" && !narrow.matches) {
      a.span = Math.max(0.18, Math.min(a.span, (restEls[r].offsetTop - 40) / innerHeight - a.top));
    }
    return a;
  });
}
const placeCreature = () => creature.setPath(slot, stops());
placeCreature();
let resizeT = 0;
addEventListener("resize", () => { clearTimeout(resizeT); resizeT = window.setTimeout(placeCreature, 120); });
narrow.addEventListener("change", placeCreature);
document.fonts?.ready.then(placeCreature);

// review links: ?depth=mid | deep open at that rest (before the conductor starts, so it starts there)
const asked = new URLSearchParams(location.search).get("depth") as Rest | null;
if (asked && RESTS.includes(asked)) scrollTo({ top: AT[asked] * (document.documentElement.scrollHeight - innerHeight), behavior: "instant" });

// layout changes we cause (signing up, the chore field) glide instead of jumping
const snapFlip = initFlip(() => [dock, ...RESTS.map((r) => restEls[r]).filter((el) => el.hasAttribute("data-current"))], dock);
addEventListener("resize", () => snapFlip(), { passive: true });
document.querySelector(".wl-form")?.addEventListener("submit", () => armFlip(4000), { capture: true });

let rest: Rest = "surface";
let cycleT = 0;
// Home from The deep [USER, round 7]: the immortal jellyfish, shown not named. It folds as the climb begins, stays a
// bud the whole way up, and blooms as it reaches the Surface; the depth-line jellyfish does the same. Focus lands on
// the email field.
function goHome() {
  clearTimeout(cycleT);
  root.removeAttribute("data-cycle");
  root.setAttribute("data-folded", "");
  creature.fold(1, 900);
  track("return_surface", { from: rest });
  const bloom = () => { creature.fold(0, 1400); root.removeAttribute("data-folded"); };
  // landed: bloom and hand over the field; the visitor took over mid-climb: bloom where they are
  dive.goTo("surface", () => { bloom(); wl.focus(); }, bloom);
}
const dive = initDive({
  dive: $("[data-dive]"),
  stage,
  rests: restEls,
  dock,
  dot: document.querySelector("[data-depth-dot]"),
  onRest(r) {
    rest = r;
    for (const k of RESTS) {
      const on = k === r;
      restEls[k].toggleAttribute("data-current", on);
      restEls[k].inert = !on;
    }
    root.dataset.depth = r;
    root.dataset.rest = r;
    marks.forEach((m) => { if (m.dataset.goto === r) m.setAttribute("aria-current", "step"); else m.removeAttribute("aria-current"); });
    creature.setKeepOut([restEls[r], dock]);
    snapFlip();
    // The deep is the end: once the visitor has been there a moment, the creature folds back to a bud, holds and
    // blooms again (the idea, felt and never named). Once per arrival; the depth-line jellyfish does the same.
    clearTimeout(cycleT);
    root.removeAttribute("data-cycle");
    if (r === "deep") cycleT = window.setTimeout(() => { creature.cycle(); root.setAttribute("data-cycle", ""); }, 2200);
    if (!reached.has(r)) { reached.add(r); track("depth_reached", { depth: r }); }
  },
});
creature.setConductor(dive.chapter);
marks.forEach((m) => m.addEventListener("click", () => dive.goTo(m.dataset.goto as Rest)));
addEventListener("keydown", () => creature.skipIntro(), { once: true });

// ---------- ripples [USER, 01-PLAN §10]: every click, a text selection, and a bigger one on sign-up ----------
initRipples();

// ---------- registration ----------
const wl = initWaitlist({
  onSuccess: (_s, fresh) => {
    // the payoff: a bigger ring from the button
    if (fresh) { const b = document.querySelector(".wl-submit")?.getBoundingClientRect(); if (b) ripple(b.left + b.width / 2, b.top + b.height / 2, 2); }
    root.dataset.beat = "joined";
    joined(fresh);
  },
});
// One line; the block above the form glides to its new place (flip.ts) instead of jumping.
function joined(animate: boolean) {
  if (animate) void setHeadline(h1, ["You’re in."]);
  else { h1.querySelector(".line-in")!.textContent = "You’re in."; h1.querySelectorAll(".line")[1]?.remove(); }
  sub.textContent = "We’ll email you when your invite is ready.";
}
if (waitlist.get().status === "success") { root.dataset.beat = "joined"; joined(false); }

// after joining: hand Alma the first chore (it becomes the first-task answer)
initChores();

// ---------- proof: the theatre ----------
const theatre = initTheatre({ onReturn: () => wl.focus(), depth: () => rest });
if (theatre) {
  // the recordings play on a Mac in the deep: the water goes dark behind it, and comes back when it closes
  const dlg = document.querySelector<HTMLDialogElement>("[data-theatre]")!;
  new MutationObserver(() => {
    root.toggleAttribute("data-theatre", dlg.open);
    creature.setDepth(dlg.open ? 1 : null);
  }).observe(dlg, { attributes: true, attributeFilter: ["open"] });
  document.querySelectorAll<HTMLAnchorElement>("[data-watch]").forEach((watch) =>
    watch.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // a new tab is the visitor's choice
      e.preventDefault();
      theatre.open(stage.dataset.initial || DEFAULT_DEMO);
    }),
  );
  // the Macs in the deep: each opens its own recording. Only at The deep and Again (exact rest), never through UI.
  const macsLive = () => rest === "deep" && !document.querySelector("dialog[open]");
  let hoverRaf = 0;
  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || hoverRaf) return;
    hoverRaf = requestAnimationFrame(() => {
      hoverRaf = 0;
      const free = macsLive() && (e.target as Element).closest("a, button, input, label, [data-dock]") === null;
      const onCreature = free && creature.creatureAt(e.clientX, e.clientY);
      creature.hoverCreature(onCreature);
      const over = onCreature || (free && creature.hover(e.clientX, e.clientY));
      if (!over || onCreature) creature.hover(-1, -1);
      root.style.cursor = over ? "pointer" : "";
    });
  }, { passive: true });
  addEventListener("click", (e) => {
    if (!macsLive() || (e.target as Element).closest("a, button, input, label, [data-dock], dialog")) return;
    // the jellyfish at The deep takes you home: it folds to a bud, rises with you, and blooms again at the surface
    if (creature.creatureAt(e.clientX, e.clientY)) {
      root.style.cursor = "";
      creature.hoverCreature(false);
      goHome();
      return;
    }
    const slug = creature.pick(e.clientX, e.clientY);
    if (slug) { root.style.cursor = ""; creature.hover(-1, -1); theatre.open(slug); }
  });
  // a deep link opens its recording over the Surface, muted (no gesture yet); closing it leaves the form
  if (stage.dataset.initial) theatre.open(stage.dataset.initial, { muted: true });
}

// every "Get early access" link focuses the email field (closing whatever dialog it sits in)
document.querySelectorAll<HTMLElement>("[data-focus-join]").forEach((a) =>
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const dialog = a.closest("dialog");
    dialog?.close();
    queueMicrotask(() => wl.focus());   // after the observer has made the page visible again (it steps aside under the theatre)
    track("cta_click", { placement: dialog ? "theatre" : "page" });
  }),
);

track("page_view", { ...trafficContext(), platform: isMac() ? "mac" : "other" });
