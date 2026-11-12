// Ripples [USER, docs/dive/01-PLAN.md §10]: a ring through the water from every click (the water too), from a text
// selection, and a bigger one from a sign-up. Text near the ring bends for a moment as the ring reaches it, then is
// crisp again: it is never read while it moves. Nothing under reduced motion.
// The ring's speed matches the water shader's (RING_SPEED of the screen height per second), so the type and the
// water move as one wave.
import { creature } from "./creature";

const RING_SPEED = 0.22;   // screen heights per second (scene.ts uses the same value)
const BEND_MS = 520;
const TEXT = ".wordmark, .headline .line-in, .sub, [data-current] .title, [data-current] .lead, [data-current] .watch, .wl-label, .wl-platform, .chores-lead";
const reduce = matchMedia("(prefers-reduced-motion: reduce)");

let svg: SVGSVGElement | null = null;
let uid = 0;
const bending = new WeakMap<Element, number>();

function filterFor(): { id: string; map: SVGFEDisplacementMapElement; drop: () => void } {
  const NS = "http://www.w3.org/2000/svg";
  if (!svg) {
    svg = document.createElementNS(NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.style.position = "absolute";
    document.body.appendChild(svg);
  }
  const id = `ripple-bend-${uid++}`;
  const f = document.createElementNS(NS, "filter");
  f.id = id;
  for (const [k, v] of Object.entries({ x: "-4%", y: "-30%", width: "108%", height: "160%" })) f.setAttribute(k, v);
  const turb = document.createElementNS(NS, "feTurbulence");
  turb.setAttribute("type", "fractalNoise");
  turb.setAttribute("baseFrequency", "0.006 0.05");   // long, low waves along the line, like a swell passing
  turb.setAttribute("numOctaves", "1");
  turb.setAttribute("seed", String(uid % 7));
  turb.setAttribute("result", "n");
  const map = document.createElementNS(NS, "feDisplacementMap");
  map.setAttribute("in", "SourceGraphic");
  map.setAttribute("in2", "n");
  map.setAttribute("scale", "0");
  map.setAttribute("xChannelSelector", "R");
  map.setAttribute("yChannelSelector", "G");
  f.append(turb, map);
  svg.appendChild(f);
  return { id, map, drop: () => f.remove() };
}

function bendText(x: number, y: number, strength: number) {
  const vh = innerHeight;
  for (const el of document.querySelectorAll<HTMLElement>(TEXT)) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height || r.bottom < 0 || r.top > vh) continue;
    if (getComputedStyle(el).visibility === "hidden") continue;
    // nearest point of the element to the ring's centre: that is when the ring reaches it
    const dx = Math.max(r.left - x, 0, x - r.right), dy = Math.max(r.top - y, 0, y - r.bottom);
    const dist = Math.hypot(dx, dy);
    const amp = 7 * strength * Math.exp(-dist / (vh * 0.55));
    if (amp < 0.6) continue;
    const delay = (dist / (vh * RING_SPEED)) * 1000;
    const token = (bending.get(el) ?? 0) + 1;
    bending.set(el, token);
    const { id, map, drop } = filterFor();
    setTimeout(() => {
      if (bending.get(el) !== token) { drop(); return; }
      el.style.filter = `url(#${id})`;
      const t0 = performance.now();
      const frame = (now: number) => {
        const u = (now - t0) / BEND_MS;
        if (u >= 1 || bending.get(el) !== token) {
          if (bending.get(el) === token) el.style.filter = "";
          drop();
          return;
        }
        map.setAttribute("scale", (amp * Math.sin(Math.PI * u) * (1 - u * 0.4)).toFixed(2));
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }, delay);
  }
}

/** A ring from a point on screen (CSS px). strength 1 = a click; 2 = a sign-up. */
export function ripple(x: number, y: number, strength = 1) {
  if (reduce.matches) return;
  creature.ripple(x, y, strength);
  bendText(x, y, strength);
}

export function initRipples() {
  // every click, wherever it lands (not inside an open dialog: the recording is not water)
  addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || (e.target as Element | null)?.closest("dialog[open]")) return;
    ripple(e.clientX, e.clientY, 1);
  }, { passive: true });
  // a text selection: one ring from the middle of what was selected, once the selection settles
  let t = 0;
  document.addEventListener("selectionchange", () => {
    clearTimeout(t);
    t = window.setTimeout(() => {
      const sel = getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) return;
      const r = sel.getRangeAt(0).getBoundingClientRect();
      if (!r.width) return;
      ripple(r.left + r.width / 2, r.top + r.height / 2, 0.8);
    }, 260);
  });
}
