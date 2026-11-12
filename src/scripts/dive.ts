// The dive's conductor (docs/dive/01-PLAN.md §3, §11). Native scroll is the source of truth; nothing intercepts the
// wheel. Two values come out of it (build-threejs-scroll-worlds: exact for logic, smoothed for visuals):
//  - exact: ScrollTrigger's progress → the current rest, focus, the depth line's current mark, analytics;
//  - smooth: a master timeline scrubbed to the scroll (gsap-scrolltrigger `scrub`) → the scene, the text, the form,
//    the depth dot. One smoothed value for everything that moves, so they can never disagree.
// Choreography follows motion-design (LottieFiles): one origin (as you descend, everything rises), exits ease-in and
// shorter than entrances, text in reading order with a short stagger, nothing overshoots (premium).
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
ScrollTrigger.config({ ignoreMobileResize: true });   // a URL bar showing or hiding must not re-lay the track [JURY 19]

export type Rest = "surface" | "mid" | "deep";
export const RESTS: Rest[] = ["surface", "mid", "deep"];

// Scroll fraction → chapter value (0 Surface, 1 Mid-water, 2 The deep), with a short dwell at each rest and
// eased travel between them. Round 4 [USER: "too much effort to scroll"]: a 4-screen track (3 screens of scroll), short
// dwells, and a gentle snap to the next rest once scrolling stops, so each depth is one flick.
// Round 6 [USER: "why do we have the last scroll?"]: the Again rest is gone; the fold and bloom happen at The deep.
// A 3-screen track (2 screens of scroll), equal travels.
const DWELL: Record<Rest, [number, number]> = { surface: [0, 0.08], mid: [0.46, 0.54], deep: [0.92, 1] };
const KEYS: [number, number][] = [[0, 0], [0.08, 0], [0.46, 1], [0.54, 1], [0.92, 2], [1, 2]];
export function chapterAt(s: number): number {
  s = Math.min(1, Math.max(0, s));
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [s0, d0] = KEYS[i], [s1, d1] = KEYS[i + 1];
    if (s <= s1) {
      if (d0 === d1) return d0;
      const t = (s - s0) / (s1 - s0);
      return d0 + (d1 - d0) * (0.5 - 0.5 * Math.cos(Math.PI * t));   // sine in-out: travel starts and lands gently
    }
  }
  return 2;
}
/** Where each rest sits on the track (scroll fraction): the middle of its dwell. */
export const AT: Record<Rest, number> = { surface: 0, mid: 0.5, deep: 1 };

type Options = {
  dive: HTMLElement;
  stage: HTMLElement;
  rests: Record<Rest, HTMLElement>;
  dock: HTMLElement;
  dot: HTMLElement | null;
  onRest: (r: Rest) => void;
};

export function initDive(o: Options) {
  const root = document.documentElement;
  const reduceMQ = matchMedia("(prefers-reduced-motion: reduce)");
  const unpinned = matchMedia("(max-height: 440px)");   // too short to pin: the Surface stands alone
  let exact = 0, smooth = 0;
  let rest: Rest | null = null;
  const proxy = { s: 0 };

  const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const restOf = (d: number): Rest => RESTS[Math.min(RESTS.length - 1, Math.max(0, Math.round(d)))];
  function setExact(s: number) {
    exact = unpinned.matches ? 0 : s;
    if (exact > 0.004 && !("dived" in root.dataset)) root.dataset.dived = "";
    const r = restOf(chapterAt(exact));
    if (r !== rest) { rest = r; o.onRest(r); }
    if (reduceMQ.matches || unpinned.matches) { smooth = exact; placeDot(chapterAt(exact)); }
  }
  function placeDot(d: number) {
    if (o.dot) o.dot.style.transform = `translateY(${(Math.min(2, Math.round(d * 1000) / 1000) * 44).toFixed(2)}px)`;
  }

  // exact: always on
  const exactST = ScrollTrigger.create({
    trigger: o.dive, start: "top top", end: "bottom bottom",
    onUpdate: (self) => setExact(self.progress),
    onRefresh: (self) => setExact(self.progress),
  });

  // smooth + choreography: only with motion allowed and a pinned stage
  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference) and (min-height: 441px)", wide: "(min-width: 1024px)" }, (ctx) => {
    const { motion, wide } = ctx.conditions as { motion: boolean; wide: boolean };
    if (!motion) { root.classList.remove("dive-motion"); return; }
    const kids = (r: Rest) => [...o.rests[r].children].filter((c) => !(c as HTMLElement).hidden && c.getClientRects().length);
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: o.dive, start: "top top", end: "bottom bottom", scrub: 1, invalidateOnRefresh: true },
      onUpdate: () => { smooth = proxy.s; placeDot(chapterAt(smooth)); },
    });
    tl.to(proxy, { s: 1, duration: 1 }, 0);

    // a rest arrives from below and leaves upward; its block is visible only around its dwell
    const arrive = (r: Rest, at: number) => {
      tl.set(o.rests[r], { autoAlpha: 1 }, at);
      tl.fromTo(kids(r), { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.07, stagger: 0.008 }, at);
    };
    const leave = (r: Rest, at: number) => {
      tl.to(kids(r), { autoAlpha: 0, y: -24, ease: "power2.in", duration: 0.05, stagger: 0.004 }, at);
      tl.set(o.rests[r], { autoAlpha: 0 }, at + 0.06);
    };
    gsap.set([o.rests.mid, o.rests.deep], { autoAlpha: 0 });
    // lines arrive just before their dwell begins and leave just after it ends
    leave("surface", DWELL.surface[1] + 0.005);
    arrive("mid", DWELL.mid[0] - 0.085);
    leave("mid", DWELL.mid[1] + 0.005);
    arrive("deep", DWELL.deep[0] - 0.085);


    // the form moves a little and changes size with the composition (transform for the move: gsap-performance)
    const padX = () => { const cs = getComputedStyle(o.stage); return parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight); };
    if (wide) {
      tl.to(o.dock, { maxWidth: 400, "--field-h": "48px", ease: "power2.inOut", duration: 0.28 }, 0.13);
      tl.to(o.dock, { x: () => (o.stage.clientWidth - padX() - 520) / 2, maxWidth: 520, "--field-h": "56px", ease: "power2.inOut", duration: 0.3 }, 0.58);
    } else {
      tl.to(o.dock, { "--field-h": "48px", ease: "power2.inOut", duration: 0.28 }, 0.13);
      tl.to(o.dock, { "--field-h": "56px", ease: "power2.inOut", duration: 0.3 }, 0.58);
    }

    // start where the page already is (reload at depth, a review link): no catch-up animation on arrival
    tl.progress(exactST.progress);
    proxy.s = exactST.progress;
    smooth = proxy.s;
    root.classList.add("dive-motion");
    return () => {
      root.classList.remove("dive-motion");
      gsap.set([...RESTS.map((r) => o.rests[r]), ...RESTS.flatMap((r) => [...o.rests[r].children])], { clearProps: "opacity,visibility,transform" });
      gsap.set(o.dock, { clearProps: "transform,maxWidth,--field-h" });
    };
  });

  // Glides (round 5) [USER: "the scroll sensitivity just skips sections"; "make the back to surface smoother"].
  // One depth per gesture: when scrolling has been idle for 160ms, the page glides to the rest NEXT TO the one the
  // gesture started from, in the gesture's direction, even if momentum carried it further. Glides are GSAP ScrollTo
  // tweens (eased, sized to the distance); wheel, touch or scroll keys stop one at once. Nothing intercepts the
  // wheel, keys or touch. Longer trips (the depth line) hide the depths they pass through, so no text flickers past.
  const STOPS = RESTS.map((r) => AT[r]);
  const nearest = (s: number) => STOPS.reduce((b, p, i) => (Math.abs(p - s) < Math.abs(STOPS[b] - s) ? i : b), 0);
  let anchor = nearest(exact);            // the rest the current gesture started from
  let idle = 0;
  let glide: gsap.core.Tween | null = null;
  let glideFrom = 0;
  let glideCancel: (() => void) | undefined;
  // real input during a glide hands control straight back: count the next gesture from where the glide began, and
  // settle again once the visitor stops (never stranded between depths)
  const takeBack = () => {
    if (!glide) return;
    glide.kill();
    anchor = glideFrom;
    endGlide();
    glideCancel?.();
    glideCancel = undefined;
    clearTimeout(idle);
    idle = window.setTimeout(settle, 180);
  };
  // a wheel event that moves nothing (some devices and tools send them with clicks) is not the visitor taking over
  addEventListener("wheel", (e) => { if (Math.abs(e.deltaY) + Math.abs(e.deltaX) >= 1) takeBack(); }, { passive: true });
  addEventListener("touchstart", takeBack, { passive: true });
  addEventListener("keydown", (e) => { if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) takeBack(); });
  function endGlide() {
    glide = null;
    root.classList.remove("dive-travel");
    RESTS.forEach((r) => o.rests[r].removeAttribute("data-travel-target"));
  }
  function glideTo(i: number, travel = false, onDone?: () => void, onCancel?: () => void) {
    i = Math.min(STOPS.length - 1, Math.max(0, i));
    const y = STOPS[i] * maxScroll();
    glide?.kill();
    endGlide();
    const from = anchor;
    anchor = i;
    if (reduceMQ.matches || unpinned.matches) { scrollTo({ top: y, behavior: "instant" }); onDone?.(); return; }
    const screens = Math.abs(y - scrollY) / innerHeight;
    if (screens < 0.01) { onDone?.(); return; }
    if (travel && Math.abs(i - nearest(exact)) > 1) {
      root.classList.add("dive-travel");
      o.rests[RESTS[i]].setAttribute("data-travel-target", "");
    }
    glide = gsap.to(window, {
      scrollTo: { y, autoKill: false },   // autoKill misreads sub-pixel rounding (fractional DPR) as the visitor
      // motion-design: duration grows with distance; long trips use the dramatic in-out curve, no overshoot
      duration: travel ? 1.1 + 0.5 * screens : 0.55 + 0.35 * screens,
      ease: travel ? "power3.inOut" : "power2.inOut",
      onComplete: () => { endGlide(); glideCancel = undefined; onDone?.(); },
      onInterrupt: endGlide,
    });
    glideFrom = from;
    glideCancel = onCancel;
  }
  // Round 6 [USER: "pushback ... just comes back to the one i was at"]: the direction of a gesture is where the page
  // now is relative to the rest the gesture started from, not the last scroll delta (which sub-pixel rounding at a
  // fractional DPR can flip at the end of a scroll). A tiny nudge settles back; anything more goes one rest on.
  function settle() {
    if (unpinned.matches || document.querySelector("dialog[open]")) return;
    const s = exact, at = STOPS.findIndex((p) => Math.abs(p - s) < 0.006);
    if (at >= 0) { anchor = at; return; }          // came to rest on a depth: that is the new start
    const from = STOPS[anchor];
    if (Math.abs(s - from) < 0.02) { glideTo(anchor); return; }
    glideTo(anchor + (s > from ? 1 : -1));          // one depth on from where the gesture began, in its direction
  }
  addEventListener("scroll", () => {
    clearTimeout(idle);
    if (!glide) idle = window.setTimeout(settle, 180);
  }, { passive: true });

  // review hook: inspect the conductor from the console
  (window as Window & { __conductor?: unknown }).__conductor = {
    state: () => ({ exact, smooth, anchor, gliding: !!glide, glideProgress: glide?.progress() ?? null, max: maxScroll(), y: scrollY }),
    glideTo,
  };

  setExact(exactST.progress);
  return {
    /** the smoothed chapter value, for the scene (read once per frame) */
    chapter: () => (root.classList.contains("dive-motion") ? chapterAt(smooth) : Math.round(chapterAt(exact))),
    rest: () => rest ?? "surface",
    /** a long, eased trip to a rest (the depth line, "Back to the surface"); onDone when it lands */
    goTo(r: Rest, onDone?: () => void, onCancel?: () => void) { glideTo(RESTS.indexOf(r), true, onDone, onCancel); },
  };
}
