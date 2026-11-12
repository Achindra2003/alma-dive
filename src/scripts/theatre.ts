// The theatre: recordings open here, full screen, from "Watch it work" or a /demos/<slug>/ deep link.
// Nothing from a recording is requested until it opens. A recording ending, or closing the theatre, puts the visitor
// back at the email field: proof never takes them away from the form for good. [05-CONVERSION C6, C7]
import { DEMOS, demoBySlug, demoFiles, type Demo } from "../data/demos";
import { track } from "../lib/analytics";

const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initTheatre(opts: { onReturn: () => void; depth: () => string }) {
  const dlg = document.querySelector<HTMLDialogElement>("[data-theatre]");
  if (!dlg || typeof dlg.showModal !== "function") return null;
  const q = <T extends Element = HTMLElement>(s: string) => dlg.querySelector<T>(s)!;
  const video = q<HTMLVideoElement>("[data-th-video]");
  const title = q("[data-th-title]"), figs = q("[data-th-figs]");
  const error = q("[data-th-error]"), xLink = q<HTMLAnchorElement>("[data-th-x]");
  const items = [...dlg.querySelectorAll<HTMLButtonElement>("[data-th-pick]")];
  let current: Demo | null = null;
  let finished = false;

  function load(demo: Demo, o: { muted: boolean; autoplay: boolean }) {
    current = demo;
    finished = false;
    const f = demoFiles(demo.slug);
    title.textContent = `“${demo.task}”`;
    figs.textContent = ["Unedited recording", ...demo.stats].join(" · ");
    items.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.thPick === demo.slug)));
    error.hidden = true;
    xLink.hidden = !demo.xUrl;
    if (demo.xUrl) xLink.href = demo.xUrl;
    video.setAttribute("aria-label", `Recording: ${demo.task}. ${demo.caption}`);
    video.poster = f.poster;
    video.muted = o.muted;
    video.src = f.src;
    if (o.autoplay && !reduce()) video.play().catch(() => { /* blocked: the poster and the play control wait */ });
  }

  function open(slug: string, o: { muted?: boolean } = {}) {
    const demo = demoBySlug(slug) ?? DEMOS[0];
    if (!dlg!.open) dlg!.showModal();
    load(demo, { muted: o.muted ?? false, autoplay: true });
    track("demo_open", { demo: demo.slug, depth: opts.depth() });
  }

  items.forEach((b) => b.addEventListener("click", () => {
    const demo = demoBySlug(b.dataset.thPick ?? "");
    if (!demo || demo === current) return;
    load(demo, { muted: video.muted, autoplay: true });
    track("demo_select", { demo: demo.slug });
  }));
  q("[data-th-close]").addEventListener("click", () => dlg.close());
  video.addEventListener("error", () => { if (video.getAttribute("src")) error.hidden = false; });
  video.addEventListener("ended", () => {
    finished = true;
    if (current) track("demo_complete", { demo: current.slug });
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    dlg.close();
  });
  video.addEventListener("volumechange", () => { if (current) track("demo_sound", { demo: current.slug, on: !video.muted }); });
  video.addEventListener("fullscreenchange", () => { if (current && document.fullscreenElement) track("demo_fullscreen", { demo: current.slug }); });
  dlg.addEventListener("close", () => {
    video.pause();
    video.removeAttribute("src");   // stop the download; the next open starts clean
    video.load();
    if (finished) opts.onReturn();  // watched to the end: the next step is the field
  });

  return { open };
}
