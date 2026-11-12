# DESIGN.md: The Dive (Alma landing page)

The full system lives in `docs/dive/`. This file is the one-page summary for anyone integrating the page.

## Concept
Handing a chore to something that never tires, felt as a slow dive: you follow one jellyfish from the lit surface into the dark, where it folds back to a polyp and blooms again. One idea, one signature (the dive), one trait of the animal, never named on the page.

## Structure
| Rest | Track | Composition | Copy |
|---|---|---|---|
| Surface | 0–8% | creature right, high; type low-left; form under it | Never do it again. / Alma operates your Mac for you. Any app, while you watch. / Watch it work |
| Mid-water | 46–54% | compact type left with a smaller form; creature right; the deep peeks up from below | Any app you already use. / You see every step, and you can stop it any time. / Watch it work |
| The deep | 92–100% | creature small, centred, the light; Macs either side; title and form centred; after a moment it folds to a bud and blooms again; clicking it takes you home (it folds, rises with you, blooms at the Surface) | Built by Sarvam AI's founding engineers. / Ex‑Microsoft Research. Backed by Peak XV. / Watch it work |

## Tokens (see `src/styles/tokens.css`, `docs/dive/04-DESIGN-SYSTEM.md`)
- **Type:** Miranda Sans 400/500. Display `clamp(2.75rem, 1.4rem + 5.4vw, 7.5rem)` ≤ 16dvh; Title `clamp(2rem, 1rem + 3vw, 4rem)` ≤ 8.5dvh; Lead 17–20px; Body 16px; Meta 13px.
- **Colour roles:** water (blue-violet → plum-black) is the ground; pearl `oklch(95% 0.012 300)` is ink and the one action; violet `oklch(70% 0.16 285)` is the creature's life, focus and selection; danger for form errors only. No gold.
- **Shape:** 4px controls, 12px surfaces. **Space:** 4–128px scale. **Targets:** 44px minimum.
- **Motion:** `--ease-out` (0.23, 1, 0.32, 1), `--ease-in-out` (0.77, 0, 0.175, 1); press 120ms, hover 150ms, exit 160ms, enter 240ms, reveal 400ms. Scroll: one smoothed value (GSAP `scrub: 1`) for everything that moves; exact value for state.

## Conversion rules
The form is reachable from the first frame at every depth, before WebGL, without JavaScript (posts natively to `/waitlist`); one pearl button; one field; errors inline and named; the Surface is complete for people who never scroll; proof is one action away and always returns to the form. Events: `docs/dive/05-CONVERSION.md` §7.

## Fallbacks
Reduced motion: rests crossfade, nothing travels or autoplays. No WebGL: depth stills. No JS: one readable column in reading order.

## Open items
See `docs/dive/01-PLAN.md` §9 (O2–O5) and the "Not checked" lines in §8.
