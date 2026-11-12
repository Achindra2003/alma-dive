# 04 · Design system

See `00-INDEX.md` for tags. Meaning lives in `03-DESIGN-LANGUAGE.md`; this file is the exact values.

**Source of truth in code:** `src/styles/tokens.css`. Values marked *(in code)* were read from that file on 2026-11-12. Values marked [TARGET] are starting points to verify by measurement in step 1 before they are written into the tokens. **If this file and `tokens.css` disagree, fix one of them the same day and note it in §10.**

Rule: **a value that is not in this file does not ship** [JURY 03, 04: roles not sizes; one scale; no ad-hoc values].

## 1. Type

Family: **Miranda Sans**, variable, self-hosted (`/fonts/miranda-sans-wght.woff2`, preloaded), weights **400 and 500 only** *(in code; the file ships 400–700, we use two)*. Fallback stack `--font-brand` *(in code)*.

Four roles. Every text node maps to one [JURY 03].

| Role | Used for | Size | Weight | Tracking | Leading |
|---|---|---|---|---|---|
| **Display** | The Surface headline; "You're in."; "And again." | `clamp(2.75rem, 1.4rem + 5.4vw, 7.5rem)`, also capped at `16dvh` [TARGET] | 500 | -0.04em | 0.94 |
| **Lead** | The one line at each depth | `--t-lead` = `clamp(1.0625rem, 0.95rem + 0.35vw, 1.25rem)` *(in code)* | 400 | -0.01em | 1.45 |
| **Body** | Field, button, links, chore choices | 16px (`--t-input` 1rem *(in code)*; never below 16px, prevents iOS zoom) | 400–500 | 0 | 1.4 |
| **Meta** | Helper, trust lines, depth labels, figures | `--t-micro` 0.8125rem (13px) *(in code)* | 400 | 0 | 1.5 |

- Scale relation: 13 / 16 / 20 is a 1.25 ratio [JURY 03: one ratio]. Display sits outside it by design (display-led).
- Measure: Lead at most **34ch**; Meta at most **52ch** [DECIDED]. Display is 1 to 3 words a line [JURY 03].
- `text-wrap: balance` on Display, `pretty` on Lead and Meta [JURY 03].
- At most **three levels of emphasis in one viewport** [JURY 03].
- Not used: italics, uppercase, mono, a third weight. `font-synthesis: none`.
- A handed-over chore can make the headline long: Display-long = `clamp(1.75rem, 1rem + 2.4vw, 3.5rem)`, leading 1.0 [TARGET].

## 2. Colour

Authored in OKLCH [JURY 04]. Roles, not a palette.

### Ink and action *(all in code)*

| Token | Value | Role |
|---|---|---|
| `--ink-100` | `oklch(95% 0.012 300)` | Display, primary text |
| `--ink-300` | `oklch(76% 0.02 300)` | Lead, secondary text |
| `--ink-400` | `oklch(66% 0.02 300)` | Meta |
| `--ink-500` | `oklch(52% 0.02 300)` | Disabled only, or 24px and larger |
| `--action` / `-hover` / `-press` | `oklch(95% 0.012 300)` / `oklch(99% 0.006 300)` / `oklch(87% 0.016 300)` | The one button (pearl) |
| `--on-action` | `#0b0111` | Text on the button |
| `--life` | `oklch(70% 0.16 285)` | The creature's light; focus; selection; caret |
| `--glow-halo` | `oklch(70% 0.16 285 / 0.24)` | Focus halo on fields |
| `--danger` | `#ff8f80` | Form error text and border only |
| `--line` / `--line-strong` | pearl at 12% / 22% | Hairlines, field borders |
| `--sea-800` / `--sea-700` | `oklch(17% 0.04 305)` / `oklch(22% 0.04 303)` | Field and dialog surface / its hover |

### Water by depth [TARGET: to be tuned and measured in steps 1 and 2]

The scene draws these; the no-WebGL fallback uses them as gradients.

| Depth | Top of frame | Bottom of frame |
|---|---|---|
| Surface | `oklch(40% 0.10 268)` | `oklch(15% 0.06 288)` |
| Mid-water | `oklch(18% 0.07 282)` | `oklch(9% 0.04 300)` |
| The deep | `#0b0111` (`--sea-900`, the brand base *(in code)*) | `#07010b` (`--sea-950` *(in code)*) |

### Contrast rules [JURY 04; PRODUCT: WCAG 2.2 AA]

- Body and Meta text: **4.5:1 or more.** Display and Lead (large text): **3:1 or more.** Borders and icons that carry meaning: **3:1 or more.**
- Measured from screenshot pixels against the **brightest** pixel behind each text block, at every depth and in the joined state. Results are recorded in §10.
- **Text sits only over water at L ≤ 22%.** Where it cannot (the Surface is the brightest frame), it gets a soft dark scrim in the scene behind it, not a brighter ink.
- The dock is its own surface (`--sea-800` field, pearl button), so its contrast never depends on the water.

## 3. Space and grid

- **Space scale** *(in code, `--s-1`…`--s-10`)*: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px. Nothing off the scale.
- **Gutter:** `clamp(24px, 4vw, 64px)` on each side, never less than the safe-area inset [DECIDED].
- **Grid:** 12 columns on desktop (≥ 1024px), 4 on phones [JURY 04].
  - Text blocks: at most 5 columns on desktop.
  - The dock: columns 1–5 on desktop; full width on phones.
  - The depth line: on the right gutter.
  - The creature: the one element that ignores the grid.
- **Proximity:** related items are closer than unrelated ones (headline to sub: 16–24px; text block to dock: 48px or more) [JURY 04].

## 4. Shape *(in code)* [USER]

- **4px** on every control (field, button, tick, focusable chip): `--r-pill`.
- **12px** on every surface (dialogs, the theatre's frame): `--r-surface`.
- Nothing else. The creature is the only curve on the page.

## 5. Components

Each lists its states; all must be designed [JURY Phase 4].

| Component | Parts | States |
|---|---|---|
| **Wordmark** | "Alma", top-left, link home | default, focus |
| **Line block** | One Display or Lead line (plus an optional link) per depth | hidden above, entering, at rest, leaving; reduced-motion: crossfade; no-JS: always visible |
| **Dock** | Label "Email", field (52px high), pearl button "Get early access", helper line (Meta), message line | idle, focus, typing, valid, submitting ("Saving your spot…"), error (inline, names the fix), offline (input kept), duplicate, **joined** |
| **Joined block** | "You're in." line, next-step line, "See your invite", the first-chore choices and "Name your own" field | fresh, returning, chore sent, mock labelled |
| **Watch link** | Text link with a 12px play glyph: "Watch it work" | default, hover, focus, pressed |
| **Depth line** | 1px vertical rule, three ticks with Meta labels (Surface, Mid-water, The deep), a pearl marker for the current position | default, hover, focus, current; hidden under no-JS |
| **Theatre** | `<dialog>`: recording (uncropped, 12px frame), task title (Body 500), real figures (Meta), list of six, play/pause, scrub, mute, full screen, close | poster, loading, playing, paused, ended, error ("This recording didn't load" + link to the X post when one exists), reduced motion (never autoplays) |
| **Back to the surface** | Text button at the end | default, hover, focus |
| **Invite sheet** | Existing `<dialog>`; restyled to this system in step 4 | as today |

Shared rules: every target **44px or more** (`--tap-min` *(in code)*); visible focus (`--focus-ring` *(in code)*); press feedback `scale(0.97)` [EMIL]; hover styles only under `(hover: hover) and (pointer: fine)` [EMIL]; no `transition: all` [EMIL].

## 6. Motion

### Tokens *(in code)*

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Entrances, UI [EMIL] |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | On-screen travel [EMIL] |
| `--d-press` | 120ms | Press feedback |
| `--d-hover` | 150ms | Hover, colour |
| `--d-exit` | 160ms | Exits |
| `--d-enter` | 240ms | Entrances |
| `--d-reveal` | 400ms | A line arriving at a rest |
| `--d-reach` | 600ms | Scene moves not tied to scroll (the join stroke) |
| `--stagger` | 60ms | Between lines in a group (within JURY's 40–90ms) |

One easing family [JURY 05]. No bounce, no elastic. UI motion stays under 300ms except the two scene tokens [EMIL].

### Scroll

- One normalized progress `p` (0–1) for the whole dive; sub-ranges per beat (`01-PLAN.md` §2) [JURY 07].
- Smoothing on `p` only, dt-scaled, time constant about 120ms [TARGET]. The scroll itself is untouched.
- Scrubbed values map **linearly** to smoothed `p` [JURY 05].
- Track length about **7 viewport heights** [TARGET; JURY 19 weights: about 1.6 per scene, 0.9 per connector].

### Inventory: everything that moves [EMIL: frequency decides; JURY 05: a reason for each]

| Movement | Trigger | How often | Reason | Spec |
|---|---|---|---|---|
| Light comes up | Load | Once | Orient | ≤ 1.6s, skippable by any key, never delays the field |
| Camera descent | Scroll | User-driven | The concept | Scrubbed to `p` |
| Creature swim between rests | Scroll | User-driven | The concept | Pulse strokes scrubbed to `p`; tentacles follow through |
| Creature breathing at rest | Always | Ambient | Life | Period 4–12s, amplitude ≤ 2% [JURY 05 continuous motion] |
| Water: shafts, caustics, particles | Always | Ambient | Atmosphere | Slow; particles never over text blocks or the dock |
| Line block arrive / leave | `p` crosses a rest | Per rest | Orient | Rise 16–24px through a mask + fade, `--d-reveal`, `--ease-out`; leave `--d-exit` |
| Depth marker | Scroll | User-driven | Orient | Position scrubbed to `p` |
| Fold and re-bloom | End of dive | Rare | The concept | About 1.4s fold, hold, bloom |
| Join stroke and brighten | Signup | Once | Feedback, delight | One stroke, `--d-reach` |
| Error startle | Failed submit | Rare | Feedback | One contraction + inline message |
| Button press | Press | Frequent | Feedback | `scale(0.97)`, `--d-press` |
| Button breath | Address becomes valid | Once per visit | Feedback | One cycle, 2.5s, scale ≤ 1.03 |
| Theatre open / close | Click | Occasional | Orient | `--d-enter` in, `--d-exit` out, opacity + 0.98 scale |

**Never moves:** text while at rest; anything in response to a bare click on the water, to hover on the water, or to the cursor; the dock.

### Reduced motion [JURY non-negotiable; EMIL: fewer and gentler, not zero]

No camera travel, no swim, no fold, no ambient drift. Scrolling cross-dissolves the three still depths (200ms). Lines fade without rising. Nothing autoplays.

## 7. Layers (z-order) [DECIDED]

1. Scene canvas (fixed, full screen)
2. Line blocks, wordmark, depth line
3. Dock
4. Dialogs (theatre, invite sheet)

The v6 trick of blending the canvas over a `<video>` is gone with the on-page screen; the canvas is a normal opaque layer again.

## 8. Responsive

| Width | Layout |
|---|---|
| ≥ 1024px | 12 columns; alternating composition (`03` §6); dock bottom-left |
| 768–1023px | As phones, larger type |
| < 768px | Creature in the upper 45–50% of the frame, line block under it, dock pinned at the bottom above the safe area and the keyboard; depth line becomes three small ticks at the right edge |

Reference viewports for every check: **1341×582** (the user's window), **1440×900**, **390×844**, **360×640**. Also 320px wide, 1920px wide and 200% zoom at step 5 [JURY 13 to be read].
Heights use `dvh` deliberately; a height-only resize on touch must not re-layout the track [JURY 19].

## 9. Budgets [JURY non-negotiables unless noted]

| Metric | Target |
|---|---|
| LCP (the Surface text or its still; never a `<video>`) | < 1.5s |
| CLS | < 0.05 |
| INP | < 100ms |
| Frame rate | 60fps sustained on a mid-range device, under throttling |
| First-view weight | < 3MB; **no recording bytes before the theatre opens** |
| Draw calls | < 100 per frame [JURY 08] |
| Text contrast | §2 |
| Tap targets | ≥ 44px |

All **measured** with tooling, or reported as not measured (`01-PLAN.md` §6, O5).

## 10. Change log and measurements

| Date | Change or measurement | By |
|---|---|---|
| 2026-11-12 | File created. Known clean-up for step 1: `tokens.css` header comment still says "gold accent" and "The Tank"; unused tokens `--t-display`, `--t-h2`, `--glass-*`, `--pulse-*`, `--header-h`, `--font-mono` to remove or justify; add the Display role and water-by-depth tokens once measured. | Claude |
| 2026-11-12 | Step 2: mid-water top drawn as display sRGB (0.075, 0.070, 0.230), bluer than the `oklch(18% 0.07 282)` target, so it reads indigo; tokens.css not yet updated (the fallback gradient still uses the target). Lead at Mid-water and The deep uses `--ink-100` (sole text at its rest). Contrast at both depths: `01-PLAN.md` §8, lowest 6.3:1. | Claude |
| 2026-11-12 | Round 2: **Title** role `--t-title` clamp(2rem, 1rem + 3vw, 4rem) / 500 / -0.03em / 1.02 (in tokens.css). Lead back to `--ink-300`. Form sizes by depth: 52/56/60px high, 480/520/560px wide. **Mac material** (theatre and scene): bezel `oklch(11% 0.008 300)`, edge `oklch(46% 0.012 295)`, lit edge `oklch(72% 0.09 290 / 0.8)`, base gradient `oklch(70% 0.03 292)` → `oklch(30% 0.012 300)`, notch `oklch(36% 0.012 298)`; scene aluminium (0.56, 0.57, 0.63). Ripple and depth line values: `01-PLAN.md` §8. | Claude |
| 2026-11-12 | Steps 3–6: `--t-title` capped at 8.5dvh; form 480/52 → 400/48 → 520/56 (tweened in the dive, by `data-depth` without it); depth dot 7px pearl; motion: rests' text in 32px/out 24px, power2.out/in, stagger 0.008 of the track; scrub 1s; fold 1.4s / hold 0.6s / bloom 1.4s. Measurements: `01-PLAN.md` §8. | Claude |
