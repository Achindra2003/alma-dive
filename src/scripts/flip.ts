// Layout changes that we cause (signing up, picking a chore, opening "Something else") glide instead of jumping.
// FLIP on layout position (offsetTop, which ignores the dive's transforms), animated with the individual `translate`
// property so it composes with GSAP's `transform` on the same elements. Only inside a short armed window, so the
// dive's own size changes while scrolling never trigger it. Reduced motion: no glide.
let until = 0;
/** Allow the next layout change(s) within `ms` to glide. */
export function armFlip(ms = 600) { until = performance.now() + ms; }

export function initFlip(watch: () => HTMLElement[], observe: HTMLElement) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let tops = new Map<HTMLElement, number>();
  const snap = () => { tops = new Map(watch().map((el) => [el, el.offsetTop])); };
  snap();
  new ResizeObserver(() => {
    if (!reduce.matches && performance.now() < until) {
      for (const el of watch()) {
        const before = tops.get(el);
        if (before === undefined) continue;
        const dy = before - el.offsetTop;
        if (Math.abs(dy) > 1) {
          el.animate([{ translate: `0 ${dy}px` }, { translate: "0 0" }], { duration: 380, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
        }
      }
    }
    snap();
  }).observe(observe);
  return snap;
}
