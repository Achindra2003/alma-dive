# 01 · Plan: The Dive

See `00-INDEX.md` for tags and binding decisions.

## 1. What it is

One pinned screen. The page never changes; scrolling moves a camera **down through the water**, following the jellyfish from the lit surface to the dark, where it folds back to a polyp and begins again. Quiet type sits over the water at three depths. The email field is docked on screen the whole way.

**Narrative spine:** Journey [JURY 02-concept: "continuous scene where scroll advances a single continuous transformation"].
**Why a dive fits the brief's "one screen, no scroll":** see assumption A1 in §9.

## 2. Beat list

Six beats plus two states [JURY 02: 5 to 9 beats for a landing page; each beat = one screen-state, its purpose, its one visual event].
`p` is scroll progress, 0 to 1. Ranges are [TARGET]: tune at step 3.

| # | Beat | p | Purpose | The one visual event | Text on screen |
|---|---|---|---|---|---|
| 1 | **Surface** | 0.00–0.14 | First impression; complete on its own for people who never scroll | Light comes up through the rippling surface; the creature hovers large under it | Headline + sub. Dock. "Watch it work". |
| 2 | Descent A | 0.14–0.36 | Travel | The creature swims down ahead; light shafts thin; particles stream up past the camera | None (text is only on screen at rest) |
| 3 | **Mid-water** | 0.36–0.52 | How it works; the proof link | The creature settles on the opposite side; indigo water | One line + "Watch it work". Dock. |
| 4 | Descent B | 0.52–0.72 | Travel | Darkness closes; the creature's own violet glow becomes the light | None |
| 5 | **The deep** | 0.72–0.88 | Who is behind it; trust | Distant kin appear, faint (the only place they exist) | Trust lines. Dock. |
| 6 | **Again** | 0.88–1.00 | The idea, felt not named | The creature folds to a polyp, holds, blooms again | "And again." + "Back to the surface". Dock. |

**States (available at any depth):**
- **Joined:** the dock becomes "You're in." + what happens next + the optional first-chore question; the creature takes one stroke and brightens. Text of the current depth stays.
- **Theatre:** "Watch it work" opens a full-screen black layer with the recording uncropped, clean controls, all six listed. The dive pauses behind it. Deep links `/demos/<slug>/` open it over the Surface.

**The Surface must be a complete page by itself** [DECIDED, from `05-CONVERSION.md` rule C2]: headline, mechanism line, email, proof link. A visitor who never scrolls loses nothing they need.

## 3. How it is built

- **Scroll:** native. A tall track (`.dive`, about 7 viewport heights [TARGET]) with the stage `position: sticky; top: 0; height: 100dvh`. We read `scrollY`, never intercept the wheel [JURY 19 doctrine 2; JURY 07 anti-patterns]. Scrollbar, keyboard (Space, PageDown, Home, End, arrows), touch momentum and scroll restoration all keep working.
- **One loop** [JURY 07 one-loop rule]: the scene's existing `requestAnimationFrame` loop reads the scroll target, eases one normalized progress value toward it (dt-scaled), and drives *everything* from it: camera, water, creature, and the DOM text. No second loop, no per-element triggers.
- **No new libraries** [EMIL: cheapest tool that works]. No Lenis, no GSAP: the smoothing is applied to our progress value, not to the scroll itself.
- **Scene** (`src/scripts/creature/scene.ts`, kept and extended): a single `depth` uniform drives water colour, light shafts, caustics, particle density and the grade; a camera path; creature poses per beat with swim travel between them; tissue response from surface light to self-glow; distant kin in the deep only.
- **DOM:** real text for every line, each tied to a progress range. Visible by default in HTML and CSS; JavaScript only adds the choreography [JURY 07: never make content visibility depend on scroll animation without a fallback].
- **Depth line:** a thin vertical rule on the right edge with three ticks (Surface, Mid-water, The deep) showing position; each tick is a real `<button>` that scrolls to that depth [JURY 07: "always give a pinned scene a visible progress signal"; JURY 19: real buttons that `scrollTo` real positions].
- **Theatre:** native `<dialog>`, video loaded only when opened (nothing from the recordings in the first view).
- **Fallbacks:**
  - *Reduced motion:* no camera travel and no swim. Scrolling cross-dissolves three still states. Nothing autoplays.
  - *No WebGL / save-data / no JS:* a normal readable page: three sections on still gradients with the same text, the form, and the proof link.
- **Phones:** same dive on native touch scroll. Creature in the upper part of the frame, text below it, dock above the keyboard. `100dvh` used deliberately; height-only resize events must not re-layout the track [JURY 19 URL-bar guard].

## 4. What is kept, removed, not added

**Kept:** the creature model and its shaders; the waitlist store, API layer and analytics; the invite sheet (restyled later); the 404 page; tokens for radii, pearl action, violet life; Miranda Sans; the local recordings.
**Removed:** the on-page screen, its tabs and `screen.ts`; the screen "hole" in the water; the unused v5 window-fit code; the seated-bell anchor options if unused.
**Not added** (may return only if the dive earns them): drifting chore words, cursor effects, custom cursor, sound, a preloader that blocks the form, page transitions.

## 5. Build order and checkpoints

✋ = stop and show the user. Nothing past a ✋ is built until they approve.

| Step | Work | Skills to load first | Done when |
|---|---|---|---|
| 0 | Read the remaining references; confirm A1 | jury 08, 11, 13; `awwwards-director`; `impeccable`; `shader-dev` | Listed in the step-0 note in this file |
| 1 | **The Surface frame, not moving.** Composition, light, colour, type, dock. Remove v6 page parts. | as above | Contrast measured for every text pair; one screen at 1341×582, 1440×900, 390×844, 360×640; no console errors |
| ✋ 1 | **Look approval** on the still Surface | | User says yes or names what is wrong |
| 2 | Mid-water and The deep as still frames (scroll jumps between them, no travel yet) | | Same checks at each depth |
| ✋ 2 | Look approval on all three depths | | |
| 3 | The descent: camera, swim, text choreography, depth line, Again | `motion-design`, `animate`, `emil-design-eng` | Smooth in a normal (not automation) window; user runs `/review-animations` |
| ✋ 3 | **Motion approval.** The user judges it live. | | |
| 4 | Joined state, first-chore question, theatre, deep links | jury 17-video, `ui-ux-pro-max` | Keyboard-complete; errors inline |
| 5 | Phones, reduced motion, no-WebGL, no-JS | `mobile-native`, `break-ui`, `web-design-guidelines` | Checked at 320 to 1920 wide, 200% zoom |
| 6 | Measured review | jury 14, 15, 01; `impeccable` critique | Numbers in `04-DESIGN-SYSTEM.md` §9 met or the gap written down; jury self-score |
| ✋ 6 | Ship decision | | |
| 7 | DESIGN.md, handover, OG image, then the pitch deck | `frontend-slides` | |

## 6. Verification rules

- Contrast and sizes are **measured**, never judged by eye [JURY 04].
- Motion is judged by the **user in a normal browser window**; Claude's automation window throttles frames and has misled several rounds.
- Performance numbers come from tooling or are reported as "not measured". No estimates presented as results.
- At each checkpoint Claude lists which skills and which reference files were actually read for that step.

## 7. Risks

1. **The creature at 60% of the screen shows its flaws.** Its tissue shading gets work in step 1; if it still reads as wireframe at that size, say so at ✋ 1 rather than hiding it with scale.
2. **Scroll length.** Too long feels trapped, too short feels rushed [JURY 07: pinned scenes over ~4 viewport heights need a progress signal; we have the depth line]. Tune in step 3.
3. **Performance:** a full-screen water shader plus camera travel is the heaviest thing here. If it drops frames on a mid-range laptop, cut effects (caustics, octaves, particles) before smoothness.
4. **Text over a light surface.** The Surface is the brightest frame; text sits where the water is dark enough or gets a scrim (`04-DESIGN-SYSTEM.md` §2).
5. **Conversion vs. journey.** A dive invites exploring instead of signing up. The dock and rule C2 are the guard; the funnel in `05-CONVERSION.md` §7 is how we find out.

## 8. Step notes

*(Each step appends a short note here when done: what was read, what was measured, what was skipped.)*

### Steps 0 and 1 · the Surface, not moving (2026-11-12) · ✋ 1 passed (the user said "continue" after the look question)

**Read:** `awwwards-jury` SKILL.md and references 08-webgl, 11-performance, 13-responsive; `awwwards-director` SKILL.md and color-systems (archetype section only); `impeccable` SKILL.md, its project context and craft-floor; `shader-dev` SKILL.md, water-ocean (caustic variant, Beer absorption, composition tips) and atmospheric-scattering (fog models, SSS variant, composition tips). Not read: director typography, layouts-ux, motion-design; impeccable typeset, colorize, critique.

**Built:**
- `src/scripts/creature/scene.ts` rewritten from scratch (1,588 → about 470 lines): one water shader driven by a `depth` value (surface seen from below, shafts, absorption), the bell re-lit as pearl tissue with violet only in its inner mark, verlet tentacles kept, sparse particles that stay out of the copy and dock. No bloom or post chain. `?depth=0.5` or `__dive.depth(v)` previews other depths.
- `Stage.astro` rebuilt: full-bleed scene, type low on the left edge, dock under it, creature right of centre and high. Phones: creature above, copy, dock at the foot. `.dive` is the scroll track, one screen tall until step 3.
- Theatre brought forward from step 4 in a minimal form (`Theatre.astro`, `theatre.ts`), because removing the on-page screen would otherwise have left "Watch it work" with nowhere to go (priority 3: proof one action away). Native player controls; the six recordings; "Get early access" returns to the field; a recording that ends closes the theatre and focuses the field; deep links open muted. Step 4 still owes: custom controls if wanted, error-state check, captions (O3).
- Removed: `screen.ts`, `feed.ts`, `dissolve.ts`, the chore-eating animation (a picked chore now simply rewrites the headline), the focus reaction on the field. Added the `field_focus` and `demo_open` events.

**Measured** (Chrome, real rendered pixels via `__dive.probe`, brightest pixel behind each text block):

| Viewport | One screen | Wordmark | Headline | Sub | Watch | Label | Helper |
|---|---|---|---|---|---|---|---|
| 1341×582 | yes | 15.4 | 9.4 | 8.3 | 17.2 | hidden | 6.2 |
| 1440×900 | yes | 15.5 | 13.3 | 7.9 | 17.2 | 8.6 | 6.2 |
| 768×1024 | yes | 12.1 | 13.6 | 8.4 | 16.5 | 8.6 | 6.2 |
| 390×844 | yes | 9.9 | 13.5 | 7.0 | 16.6 | 8.1 | 6.0 |
| 360×640 | yes | 9.2 | 10.5 | 6.4 | 16.2 | 8.0 | hidden |
| 320×568 | yes | 8.8 | 6.7 | 4.9 | 14.8 | hidden | hidden |

No horizontal overflow, no control under 44px, no console errors. Scene cost in `__dive.bench` on this machine: 5 draw calls, 0.9 ms average per frame at DPR 1.3 (a desktop GPU; says nothing about phones).

**Not checked:** reduced motion, no-WebGL and no-JS renders; real phones; LCP/CLS/INP; the theatre's error state; 200% zoom. At 320×568 the creature's band is only about 100px tall.

**Deviations to note:** the Email label and the helper line hide on short screens to keep one screen; `--t-display` in `tokens.css` now holds the Display role from `04` §1.

### Step 2 · Mid-water and The deep, not moving (2026-11-12) · ✋ 2 rejected (see §10)

**Read:** nothing new; the step needed no new skill (the plan names none for step 2). The `docs/dive` files were re-read.

**Built:**
- `.dive` is now the track: three screens (`300vh`, not `dvh`, so the URL bar cannot re-layout it), the stage pinned. The rest nearest the scroll position is current; it sets the water depth (0 / 0.5 / 1), the creature's anchor and the particles' keep-out together. **No travel yet:** the depth eases in about 120ms and the creature slides in about 300ms; the tentacles trail during the slide (step 3 replaces this with the swim).
- Three rests share one grid cell (`main.rests` is `display: contents`). Mid-water: creature upper-left, the line and "Watch it work" bottom-right on the dock's baseline (a diagonal against the dock). The deep: creature small and centred, the trust line centred under it, above the dock. Phones: creature in the band, the line under it, the dock at the foot, for all three.
- Non-current rests are `inert` and hidden; they fade out at `--d-exit` and in at `--d-reveal` (placeholder until step 3's choreography).
- Scene: mid-water keeps about 40% of the surface light (shafts thin from the upper right; the surface itself is gone); `M_TOP` is a little bluer than the token so mid-water reads indigo, not black. The deep: the creature's own glow lights the water (stronger and tighter than step 1). **Distant kin:** five small rim-lit bells with tapering hairline threads, upper part of the frame only, the deep only (one shared bell geometry plus one line mesh, 6 extra draw calls).
- `?depth=mid` / `?depth=deep` scrolls to that rest (review links). The scene's numeric `?depth=` was removed; `__dive.depth(v)` still previews any value.
- `depth_reached` events (once per depth per visit); `demo_open` now carries the real depth. Both "Watch it work" links open the theatre.

**Measured** (Chrome, `__dive.probe`, brightest rendered pixel behind each block; all pass):

| Depth · viewport | One screen | Wordmark | Lead | Watch | Label | Helper |
|---|---|---|---|---|---|---|
| Mid 1341×582 | yes | 17.2 | 16.3 | 16.9 | hidden | 6.4 |
| Mid 1440×900 | yes | 17.2 | 16.6 | 16.9 | 9.2 | 6.4 |
| Mid 768×1024 | yes | 17.0 | 17.0 | 17.3 | 9.1 | 6.4 |
| Mid 390×844 | yes | 14.5 | 16.1 | 17.3 | 9.0 | 6.3 |
| Mid 360×640 | yes | 16.3 | 15.6 | 17.2 | 8.9 | hidden |
| Mid 320×568 | yes | 16.6 | 15.0 | 16.9 | hidden | hidden |
| Deep 1341×582 | yes | 14.9 | 16.9 | – | hidden | 6.5 |
| Deep 1440×900 | yes | 16.3 | 17.2 | – | 9.4 | 6.6 |
| Deep 768×1024 | yes | 17.5 | 17.5 | – | 9.4 | 6.5 |
| Deep 390×844 | yes | 17.1 | 17.4 | – | 9.4 | 6.5 |
| Deep 360×640 | yes | 17.0 | 17.2 | – | 9.3 | hidden |
| Deep 320×568 | yes | 12.6 | 16.9 | – | hidden | hidden |

No horizontal overflow; controls 44px; no console errors; scroll, End and Home land on the right rest (the automation window delivers scroll events late, so checks waited); the Mid-water "Watch it work" opens the theatre.

**Deviations:** the Lead line at Mid-water and The deep uses `--ink-100`, not `--ink-300`: it is the only text at its rest, so it is primary there. The mid-water top colour is bluer than the `04` §2 target (recorded in `04` §10).

**Not checked / owed:** no-JS (only the Surface shows; step 5 owes the three-section fallback); the joined state at Mid-water or The deep (the chore choices live in the Surface block; step 4); focus return after closing the theatre from Mid-water; kin near the future depth line on the right edge (step 3); reduced motion; real phones.
### Step 2, round 2 · the §10 direction as still frames (2026-11-12) · awaiting ✋ 2

**Read:** all of `docs/dive` (02 included, which the first round skipped); `awwwards-director` SKILL.md and references typography (fluid scale, tracking, line height), layouts-ux (hero patterns, section rhythm, sticky reveal). Not read: impeccable typeset/colorize/critique; no critique pass was run.

**Built (each item is a §10 decision):**
- No scrollbar on any engine. The **depth line** (right edge; tick per depth, pearl dot on the current one, only its label shown; hover or focus names the others; each mark scrolls there). **"Scroll to dive"** cue (Meta, `--ink-300`, a mote sinking down a short line): bottom-right on desktop, in the top bar on phones ("Swipe to dive" on touch). It leaves on the first scroll.
- **Title** role added (`--t-title` `clamp(2rem, 1rem + 3vw, 4rem)`, 500, -0.03em, 1.02; from director typography h1/h2). Mid-water: "Any app you already use." / Lead / Watch it work, right side, clear of the depth line. The deep: "Built by Sarvam AI's founding engineers." / "Ex‑Microsoft Research. Backed by Peak XV.", centred under the creature. Lead back to `--ink-300`.
- **The form grows** with depth: field and button 52 → 56 → 60px, width 480 → 520 → 560px, in place. Label is now "Email for your invite". The first-chore choices moved into the dock.
- **The deep:** the creature's glow brightens with each stroke and lights the water more; the kin glow brighter and pulse out of step. **Three Macs** (two on phones), code-built (rounded aluminium base, lid with bezel, 16:10 screen), screens showing the Blender, Passwords and Krunker posters dimmed, lit by the creature's violet light (lambert, specular, rim). Posters load only once the deep is reached. On desktop the creature is sized so it ends above the title.
- **Theatre = a Mac:** a CSS-built Mac (12px lid, aluminium edge, base with notch) plays the recording uncropped; the water goes to the deep behind it and the page steps aside; "Get early access" returns focus to the field (checked).
- **Ripples:** water ring (shader; four at once) from every click, text selection and, at strength 2, a sign-up; nearby text bends through an SVG displacement filter timed to the ring's arrival, about 0.5s, then the filter is removed. Off under reduced motion.

**Measured** (`__dive.probe`, brightest pixel behind each block): all text passes. Lowest values: Surface helper 5.9; scroll cue 5.3 (320×568) after shading the top-right corner of the water on narrow screens (it was 2.0); deep title 4.5 at 320×568 and 6.1 at 1440×900 (large text, 3:1 needed). One screen, no overflow at all six viewports, no console errors. Depth line vs text: checked by eye at 1341×582, 1440×900, 390×844 and 320×568 (the box test reports padding as overlap).

**Not checked / owed:** motion of everything (ripples included) in a normal window; the joined state at Mid-water and The deep with the chores in the dock (fit on small phones); clicking a Mac in the deep to open its recording (not wired); reduced motion, no-WebGL, no-JS; real phones. Mac material colours are new values: listed in `04` §10.

### Step 2, round 3 · stills for §11 (2026-11-12) · awaiting the user's look check before step 3

**Read:** see §11 (skills). From them: one exact and one damped progress (scroll-worlds conductor); transforms not width/height for moving UI (gsap-performance); one origin per scene, Premium timing 350/500/800ms with no overshoot, exits at 65–75% of entrances, ambient 2–20s (motion-design tables and choreography). Not yet read: scroll-worlds `world-bible.md`, `quality-and-qa.md`, `kage-anatomy.md` (before step 3's build).

**Built:** worded cue removed; the mote on the depth line; Mid-water compact left, creature right (anchor x 0.66); form sizes by depth as in §11 (still by width/height between rests; step 3 moves it by transform); deep's kin and Macs rise from below with depth (`rise`, per-object `peek`), visible from depth 0.3.

**Measured:** Mid-water and The deep at 1341×582, 1440×900, 390×844, 320×568: lowest text contrast 6.1 (deep title, large text), Meta 6.3+; one screen; controls 48px or more.

### Steps 3–6 · the descent, states, fallbacks, measured review (2026-11-12) · awaiting ✋ 3 (motion, judged live) and ✋ 6

The user said "finish the remaining steps" after approving the round 3 stills. Motion has **not** been judged in a normal window yet: Claude's automation window ran at about 4 fps.

**Read for these steps:** `build-threejs-scroll-worlds` world-bible (motion, chapter ledger, interaction matrix) and quality-and-qa (evidence matrix, endpoints, transition paths); awwwards-jury 17-video, 01-scoring, 14-anti-patterns (15-audit not read); `ui-ux-pro-max` quick reference §8 Forms; `mobile-native` (all). Not loaded: `motion-design`'s remaining files, `break-ui`, `web-design-guidelines`, `impeccable` critique (no impeccable pass was run).

**Step 3, the descent** (`src/scripts/dive.ts`, scene):
- Track 700vh. Scroll fraction → chapter value with dwells: Surface 0–0.10, travel, Mid-water 0.30–0.42, travel, The deep 0.62–0.76, travel, Again 0.90–1 (sine in-out travel).
- **Exact** progress (a standalone ScrollTrigger) owns the current rest, `inert`, `aria-current`, `depth_reached`. **Smooth** progress (a master timeline, `scrub: 1`) owns the scene, text, form and depth dot. The scene runs on `gsap.ticker` (one loop, no desync).
- Creature: a path of four composed stops; mid-travel it dips below the line (swims down ahead of the camera), banks into sideways travel, and strokes faster the faster you scroll. Motes stream up with descent. The deep's Macs and kin rise from below; the ones that come up behind the form fade in only near their place.
- Text: each rest's lines arrive from 32px below (power2.out, stagger) and leave 24px upward (power2.in, shorter). The form: Surface 480/52 → Mid 400/48 → Deep 520/56 centred, by transform for the move (`maxWidth` and `--field-h` also tween: a layout property on one element during travel only, accepted deviation from gsap-performance, recorded here).
- Depth line: a pearl dot travels with the smoothed value; the current tick lengthens and names itself.
- **Again:** "And again." + "Back to the surface" (scrolls up, focuses the field). On every arrival the creature folds to a polyp (1.4s), holds (0.6s), blooms (1.4s).
- Checked (at 4 fps, so lag is expected there): forward, reverse to top (Surface and form restored), depth-line click to The deep, Back to the surface (focus on the field), `?depth=` opens at its rest without playing the dive.

**Step 4, states:** joined at any depth (confirmation and chore choices live in the form; centred at the deep; "You're in." in the form below the Surface); errors inline, field marked invalid and focused, creature startles (checked: malformed address, `fail@` mock); clicking a Mac at The deep or Again opens its own recording (raycast; hover wakes its screen; DOM "Watch it work" added at the deep as the keyboard path); theatre error state and `/demos/blender/` deep link checked; Escape restores the page. Test sign-up cleared from localStorage.

**Step 5, fallbacks:** mobile-native baseline (global tap-highlight off, `touch-action: manipulation`, unselectable controls, tick press state); **no-JS** page in reading order (promise, form, Mid-water, The deep) checked in a script-blocked frame at 1440 and 390; **no-WebGL** (`?debug=nowebgl`) shows depth stills; 200% zoom (720×450) and 1920×1080 fit with no overflow; Macs stay out on short narrow screens. **Reduced motion: not checked live** (cannot emulate the media query from the extension); by code: no dive-motion, rests crossfade 200ms, creature jumps between stops, no fold, no ripples, no mote, recordings never autoplay.

**Step 6, measured** (Chrome, localhost, no network or CPU throttling: a best case, not field data):

| Metric | Budget | Measured |
|---|---|---|
| LCP | < 1.5s | 108 ms (the headline line) |
| CLS | < 0.05 | 0 |
| First-view transfer | < 3 MB | about 209 KB; no recording bytes |
| Draw calls | < 100 | 5 at the Surface, 20 at the deep |
| Frame cost (`__dive.bench`) | 16.7 ms | about 1.0 ms average, 1.5–1.6 ms p95 (desktop GPU, DPR 1.43) |
| INP, 60fps under 4× CPU throttle, real phones | | **not measured** (needs Lighthouse/DevTools or devices; O5) |
| Console | clean | clean |
| Keyboard | logical, visible focus | skip link → wordmark → depth marks → Watch it work → email → button; rings visible |

**Jury self-score (01-scoring, pessimistic):** Design 6.5 (type, colour and tokens hold; the invite sheet and 404 are not restyled to this system; craft not checked on real phones) · Usability 6.4 (orientation clear, fast locally; 60fps under throttle, INP and reduced motion unverified) · Creativity 7.0 (one concept, one signature: the dive and the fold) · Content 6.5 (real copy and recordings; captions missing, O3) → **about 6.6: Honorable Mention territory**, not SOTD. The two lowest rows to fix: measured performance on a mid-range phone, and the unstyled inner surfaces (invite sheet, 404).

### Rounds 4–5 · pacing, indicator, glides (2026-11-12)

[USER] "too much effort to scroll", "feels awkward", the depth line an "eyesore", "not saying it aloud", "link it up with the immortal jellyfish", "make the back to surface animation smoother", "the scroll sensitivity just skips sections".
- Track 700vh → **400vh**; dwells Surface 0–0.06, Mid-water 0.30–0.36, The deep 0.62–0.68, Again 0.92–1 (`dive.ts` DWELL/KEYS/AT).
- **One depth per gesture:** after 160ms idle the page glides to the rest next to the one the gesture started from, in its direction, even if momentum overshot. Glides are GSAP ScrollTo tweens (0.55s + 0.35s per screen, power2.inOut); the depth line and "Back to the surface" are long trips (1.1s + 0.5s per screen, power3.inOut) that hide the depths they pass (`html.dive-travel`). Wheel, touch or scroll keys during a glide stop it at once (ScrollTo's `autoKill` misreads sub-pixel rounding at fractional DPR, so it is off). `html { scroll-behavior: smooth }` removed (it fought every GSAP step). "Back to the surface" focuses the field when it lands.
- **Indicator:** a faint hairline with a 12×15px jellyfish glyph that travels with the dive; no ticks, no visible labels (the three buttons keep their accessible names). Before the first scroll it strokes and sinks 12px (3.2s loop); at Again it folds to a bud and blooms with the creature.
- Checked in the automation tab (about 2–7 fps, GSAP time crawls there): a 10-notch flick from the Surface glides back to Mid-water, not on to The deep; from Mid-water likewise to The deep; "Back to the surface" runs up and lands with the field focused. **Real-time feel not judged:** needs the user's normal window.
- `window.__conductor.state()` shows exact/smooth/anchor/glide for review.


### Round 6 · three rests, no pushback (2026-11-12)

[USER] "why do we have the last scroll?"; "the scroll has pushback ... just comes back to the one i was at".
- **Again removed as a section** (and "Back to the surface" with it). Track 300vh, two equal travels: Surface 0–0.08, Mid-water 0.46–0.54, The deep 0.92–1. The fold and bloom now happen at The deep, 2.2s after arriving, once per arrival (creature and depth-line jellyfish together, `html[data-cycle]`). The idea stays felt, never named.
- **Pushback fixed:** a gesture's direction is now where the page is relative to the rest it started from, not the last scroll delta (sub-pixel rounding at the end of a smooth wheel scroll could flip it and glide the visitor back). A nudge under 2% of the track settles back; anything more goes one rest on. Idle 180ms.
- Checked: 1 notch down from the Surface → Mid-water; 1 notch up from Mid-water → Surface; a 10-notch flick from the Surface overshoots to 0.68 and glides back to Mid-water (no skip); Mid-water → The deep, fold starts; console clean. Real-time feel still the user's call.
### Round 7 · the jellyfish takes you home (2026-11-12)

[USER] "now the option to scroll back on top is gone.. maybe clicking the jellyfish does that at the end? it kinda shrinks and then grows back to show the immortal jellyfish?"
- At The deep, the creature is clickable (an ellipse around the bell and upper tentacles; on hover it brightens 22% and the cursor becomes a pointer). A click folds it to a bud (0.9s), the page makes the long eased trip to the Surface with it held folded (the depths passed stay hidden), and it blooms (1.4s) as it lands; focus goes to the email field. The depth-line jellyfish folds and blooms with it (`html[data-folded]`). Event `return_surface`. The idea is shown, never named.
- If the visitor scrolls during the climb, the glide stops and the jellyfish blooms where they are (`goTo` onCancel). Zero-movement wheel events no longer count as the visitor taking over.
- Keyboard path: the depth line's Surface mark.
- Checked: a click at The deep starts the climb folded; a full climb lands on the Surface, unfolded, with the field focused; console clean. Real-time feel: the user's call.


## 10. Round 2 direction (2026-11-12, after ✋ 2 was rejected)

The user rejected step 2: "the direction and design are off putting". Their specifics, and what they decided [USER]:

- **The dive concept stays.** Step 1 (the Surface) is fine.
- **No scrollbar**, but visitors must know to scroll, without hurting the UX or the sign-up. [DECIDED] Hide the scrollbar on every engine. The depth line on the right edge (three marks, a light dot for the current depth, each mark a button) is the progress signal. A "Scroll to dive" cue at the foot of the depth line shows at the Surface only and leaves on the first scroll. It is Meta size, far from the form, and never pearl.
- **The text and the hierarchy were the off-putting part.** Alternating sides stay, but every depth gets a real hierarchy: a **Title** (new role, `04` §1), one Lead line, then the link. At most three levels. Lead returns to `--ink-300`.
- **The deep:** the jellyfish glows: it is the light, pulsing, lighting the water and what is near it. The distant kin glow slightly. **Macs are there:** a few open Mac laptops (code-built, no Apple logo), their screens dimly showing a still from a recording, lit by the creature's glow.
- **"Watch it work" was bland.** A Mac shows the recording: the theatre becomes a Mac (aluminium body, bezel, the recording uncropped on its screen) over the dimmed deep, with the real figures and "Get early access" beside it. [DECIDED] Several Macs in the deep, one per recording; the theatre's Mac is the one you picked. The user did not object to this.
- **The form grows slightly as you dive** (Surface → The deep), and stays where it is (C1 still holds: it never moves or gets covered). A half-typed email survives scrolling.
- **The visitor must know right away what the form does.** [DECIDED] The label says what you get ("Email for your invite"), not just "Email". The helper stays.
- **Ripples:** a ring through the water from every click (water included), from text selection, and a bigger one from a sign-up. Letters near the ring bend briefly as it passes, then are crisp again. Nothing under reduced motion. This **reverses** the 2026-11-12 motion audit rule "nothing reacts to bare clicks" (`03` §8, `04` §6) [USER].
- After signing up, the first-chore choices live in the dock, so they work at any depth [DECIDED, fixes the step 2 gap].

Still-frame order for ✋ 2 (again): Surface with depth line and cue; Mid-water; The deep with Macs; the Mac theatre. Motion (ripples aside, which the user asked to try) stays for step 3.

## 11. Round 3 direction (2026-11-12) [USER]

- **Motion more fluid.** References named by the user, installed and read: `gsap-scrolltrigger`, `gsap-timeline`, `gsap-performance` (greensock/gsap-skills, MIT); `build-threejs-scroll-worlds` (MengTo/Skills, MIT, text files only); `motion-design` (LottieFiles, already installed). **This reverses `02` §6's "decline GSAP + ScrollTrigger":** GSAP ScrollTrigger may turn native scroll into one smoothed progress (`scrub`) and drive the DOM timeline; the scene reads the same value. Still no Lenis; native scroll stays the source of truth (scroll-worlds conductor: exact value for logic, damped value for visuals).
- **Scroll hint subtler, design-led.** No words. Until the first scroll, a mote sinks along the depth line from Surface to Mid-water every 3.6s and "Mid-water" names itself as it arrives.
- **The form moves a little** with the composition. **This relaxes `05` C1:** the form may move between depths (eased, by transform in step 3), but it is never covered and always usable. Surface: bottom-left, 480/52. Mid-water: left under a compact text block, smaller (400/48). The deep: centred under the title, 520/56.
- **Mid-water is compact on the left**, the creature on the right.
- **The deep peeks in from below:** at Mid-water the nearest Mac and kin already show at the bottom edge (right side only; the text and form are on the left), and the descent brings them up into place. Phones: nothing peeks (the text fills the lower half).


## 9. Assumptions and open decisions

| ID | Item | State |
|---|---|---|
| A1 | "Single screen, no scroll" [PRODUCT, brief] is read as **one pinned viewport with a scroll-driven dive inside it**, not "no scroll input". The user chose direction 1 after this was stated, but has not answered the question directly. | **[USER] 2026-11-12: delegated** ("i don't care about either as long as it converts users to sign up"). [DECIDED] scroll-driven dive on native scroll; the Surface stays a complete page by itself (rule C2) so non-scrollers lose nothing. Revisit only if funnel data says the dive costs signups. |
| O1 | The lines of copy at each depth (`05-CONVERSION.md` §4) | [USER] 2026-11-12: delegated, judged by conversion. [DECIDED] build with the proposed lines; still needs Alma's confirmation before launch |
| O2 | Dropping gold for pearl departs from alma.inc's current CSS [PRODUCT] | [USER] decided; needs Alma's approval before launch |
| O3 | Captions for the voice recordings (Paint, Zerodha) | [OPEN] needed from Alma for accessibility |
| O4 | Angel investors named on the page | [PRODUCT] company-stated only: **do not publish** until Alma confirms |
| O5 | Tooling for measured performance (Playwright/Lighthouse) | [OPEN] user said "not now" on 2026-11-11; ask again at step 6 |
