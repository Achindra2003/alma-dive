// Creature facade. Tiny, three-free. The WebGL scene is lazy-loaded after first paint.
// Calls made before the scene loads are queued and replayed. Without WebGL every call is a no-op and the page
// stands on its HTML and the still gradient (docs/dive/01-PLAN.md §3, fallbacks).

/** idle: breathing. bloom: one stroke and brighter (the visitor joined). startle: one quick stroke (a failed submit). */
export type CreatureState = "idle" | "bloom" | "startle";

export type AnchorOptions = {
  /** Centre of the bell across the anchor element, 0..1. */
  x: number;
  /** Where the crown sits down the anchor element, 0..1. */
  top: number;
  /** Height of the whole animal (crown to the longest tentacle tips) as a fraction of the anchor's height. */
  span: number;
  /** Cap on the bell's diameter as a fraction of the anchor's width (narrow anchors). Default 0.5. */
  maxW?: number;
};

export interface CreatureImpl {
  setState(s: CreatureState): void;
  setAnchor(el: Element, opts: AnchorOptions): void;
  /** Elements the particles must stay clear of (the copy and the dock). */
  setKeepOut(els: Element[]): void;
  /** 0 = surface, 0.5 = mid-water, 1 = the deep. With a conductor this is an override; null releases it. */
  setDepth(d: number | null): void;
  /** One composed stop per rest; the conductor's chapter value moves the creature between them. */
  setPath(el: Element, stops: AnchorOptions[]): void;
  /** The smoothed chapter value (0 Surface, 1 Mid-water, 2 The deep, 3 Again), read once per frame. */
  setConductor(fn: () => number): void;
  /** Fold back to a polyp, hold, bloom again. */
  cycle(): void;
  /** Fold to a bud (1) or bloom (0) over ms; held until told otherwise. */
  fold(v: number, ms: number): void;
  /** Is a screen point (CSS px) on the creature? */
  creatureAt(x: number, y: number): boolean;
  /** The pointer is over the creature: it brightens a little. */
  hoverCreature(on: boolean): void;
  /** The recording slug of the Mac under a screen point (CSS px), if any. */
  pick(x: number, y: number): string | null;
  /** Hover a screen point (x < 0 clears); true when over a Mac. */
  hover(x: number, y: number): boolean;
  /** End the opening "light comes up" at once. */
  skipIntro(): void;
  /** A ring through the water from a screen point (CSS px); strength 1 = a click, 2 = a sign-up. */
  ripple(x: number, y: number, strength: number): void;
  destroy(): void;
}

type Call = [keyof CreatureImpl, unknown[]];
let impl: CreatureImpl | null = null;
const queue: Call[] = [];
let currentState: CreatureState = "idle";

function call<K extends keyof CreatureImpl>(name: K, ...args: Parameters<CreatureImpl[K]>) {
  if (impl) (impl[name] as (...a: unknown[]) => void)(...args);
  else queue.push([name, args]);
}

export const creature = {
  get state() { return currentState; },
  get ready() { return impl !== null; },
  setState(s: CreatureState) {
    currentState = s;
    call("setState", s);
  },
  setAnchor(el: Element, opts: AnchorOptions) { call("setAnchor", el, opts); },
  setKeepOut(els: Element[]) { call("setKeepOut", els); },
  setDepth(d: number | null) { call("setDepth", d); },
  setPath(el: Element, stops: AnchorOptions[]) { call("setPath", el, stops); },
  setConductor(fn: () => number) { call("setConductor", fn); },
  cycle() { call("cycle"); },
  pick(x: number, y: number): string | null { return impl ? impl.pick(x, y) : null; },
  fold(v: number, ms: number) { call("fold", v, ms); },
  creatureAt(x: number, y: number): boolean { return impl ? impl.creatureAt(x, y) : false; },
  hoverCreature(on: boolean) { impl?.hoverCreature(on); },
  hover(x: number, y: number): boolean { return impl ? impl.hover(x, y) : false; },
  skipIntro() { call("skipIntro"); },
  /** not queued: a ripple before the scene exists has nothing to move */
  ripple(x: number, y: number, strength = 1) { impl?.ripple(x, y, strength); },
};

function webgl2Supported(): boolean {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

export function bootCreature(canvas: HTMLCanvasElement, onReady?: () => void, onFail?: () => void) {
  const root = document.documentElement;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  const fail = () => { root.classList.add("creature-fallback"); onFail?.(); };
  // ?debug=nowebgl: review the no-WebGL page without disabling the GPU
  const forced = new URLSearchParams(location.search).get("debug")?.split(",").includes("nowebgl");
  if (forced || !webgl2Supported() || conn?.saveData) { fail(); return; }
  import("./scene")
    .then(({ createScene }) => {
      const made = createScene(canvas, () => { root.classList.remove("creature-ready"); fail(); });
      impl = made;
      root.classList.add(`tier-${made.tier}`);
      for (const [name, args] of queue.splice(0)) (impl[name] as (...a: unknown[]) => void)(...args);
      root.classList.add("creature-ready");
      onReady?.();
    })
    .catch(fail);
}
