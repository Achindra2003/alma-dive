// Kinetic headline: lines leave upward through a mask, new lines rise in (40ms stagger).
// UI motion: exit 160ms, enter 280ms, strong ease-out. Reduced motion: 200ms crossfade.

const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
let seq = 0;

export async function setHeadline(h1: HTMLElement, lines: string[]) {
  const my = ++seq;
  const current = h1.textContent?.replace(/\s+/g, " ").trim();
  if (current === lines.join(" ").trim()) return;
  const olds = [...h1.querySelectorAll<HTMLElement>(".line-in")];

  if (reduce()) {
    await h1.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 100, easing: "ease" }).finished.catch(() => {});
    if (my !== seq) return;
    render(h1, lines);
    h1.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 100, easing: "ease" });
    return;
  }

  await Promise.all(
    olds.map((el, i) =>
      el.animate([{ transform: "none", opacity: 1 }, { transform: "translateY(-105%)", opacity: 0 }], {
        duration: 160, delay: i * 30, easing: EASE, fill: "forwards",
      }).finished.catch(() => {}),
    ),
  );
  if (my !== seq) return;
  render(h1, lines);
  h1.querySelectorAll<HTMLElement>(".line-in").forEach((el, i) =>
    el.animate([{ transform: "translateY(105%)", opacity: 0 }, { transform: "none", opacity: 1 }], {
      duration: 280, delay: i * 40, easing: EASE, fill: "backwards",
    }),
  );
}

function render(h1: HTMLElement, lines: string[]) {
  h1.textContent = "";
  const total = lines.join(" ").length;
  h1.toggleAttribute("data-long", total > 32);
  for (const text of lines) {
    const line = document.createElement("span");
    line.className = "line";
    const inner = document.createElement("span");
    inner.className = "line-in";
    inner.textContent = text; // user text is never parsed as HTML
    line.append(inner);
    h1.append(line);
  }
}

export const quote = (s: string) => {
  const t = s.trim().replace(/\s+/g, " ");
  const cut = t.length > 56 ? `${t.slice(0, 55).trimEnd()}…` : t;
  return `“${cut.charAt(0).toUpperCase()}${cut.slice(1)}”`;
};
