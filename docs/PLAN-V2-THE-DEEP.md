# Alma "The Deep": single-screen revamp plan (v2)

Supersedes `DESIGN-PLAN.md` (v1, multi-section scrolling page). v1's brand tokens, product thinking and component states still apply. Its page architecture does not.

---

## 0. What changed since v1

| Learned | Consequence |
|---|---|
| The brief is **one screen, no scroll**: an insane revamp of the current single-screen alma.inc | Delete all scrolling sections. Everything happens in place, in one `100dvh` stage |
| Awwwards research (Lusion v3, Igloo Inc, The Sea We Breathe, Lando Norris: all confirmed SOTD) | Corner-frame layout, the camera tells the story, cursor as a physical presence, story loader, opt-in sound, kinetic type |
| Awwwards sites often fail usability (30% of the score) | Conversion guardrails in section 9 are hard requirements, not polish |
| alma.inc assets failed because the **college Sophos firewall** intercepts the connection (it also blocks igloo.inc) | alma.inc is likely fine. Present on a hotspot. Keep the asset base configurable and the error states |
| No CORS headers on alma.inc | Videos can't be WebGL textures. They play in DOM video elements, with transitions matched to the scene camera |
| M0 spike: creature costs about 0.4ms per frame | There's headroom for a post-processing chain and a water shader |

## 1. Which skill governs what

| Area | Skill | Used for |
|---|---|---|
| Direction and anti-slop | design-taste-frontend, impeccable, redesign-skill | Design read, dials, banned tells, single accent, copy audit |
| Scene rendering | **shader-dev** | water-ocean (caustics), volumetric-rendering (light shafts), procedural-noise and domain-warping (bell surface, water), particle-system (marine snow), post-processing (ACES, bloom, vignette, grain), camera-effects (focus blur), fluid-simulation (cursor wake, high tier only), webgl-pitfalls |
| Cinematic motion | **motion-design** (LottieFiles) | Motion personality, material easing (Fluid), three motion layers, choreography, ambient tables, 1/3 rules |
| UI motion | emil-design-eng, animate | Curves, durations, press feedback, interruption, reduced motion |
| Motion review | review-animations, find-animation-opportunities | Feel-check pass and gap hunt at M6 |
| Mobile | mobile-native | dvh, safe areas, 16px inputs, hover gating, bottom sheets, touch |
| Robustness | break-ui | Worst-case data and failure pass |
| Visual audit | **refactoring-ui** | Grayscale-first check, scale audit, **score 10/10** target |
| Compliance | web-design-guidelines | Final accessibility and UI review with file and line |
| Pitch | **frontend-slides** | Animated HTML deck that exports to PPTX, for presenting the work |
| Not used | gsap-scrolltrigger, threejs-scroll-worlds | Built for scroll-driven pages. This page does not scroll |
| Not installed | Craftwork | Installs into every agent system-wide and downloads are paid. Brand assets are fixed by Alma anyway |
| Not used | interface-design | Built for product UI and dashboards. This is a marketing surface |

### Conflict resolution
- **Exit easing.** Motion Design says exits use ease-in; Emil and animate ban ease-in on UI. **Rule:** DOM controls (buttons, sheets, video panel) use Emil's strong ease-out with exits faster than entrances. **Scene and camera motion** (creature, camera, light) use Motion Design's Fluid material rules.
- **Motion personality.** Motion Design defines Premium as 350-600ms. Emil says UI motion stays under 300ms. **Rule:** UI uses 120-280ms. Scene beats use the Premium/Fluid range (400-1400ms), because they are explanatory or rare-tier motion.

## 2. Design read and dials
**Reading this as:** a single-screen immersive waitlist page for a Mac computer-use agent, aimed at AI-curious Mac power users from X. The style is cinematic deep sea with one warm light, leaning toward a WebGL scene with a minimal DOM corner frame.

**Dials:** DESIGN_VARIANCE 9, MOTION_INTENSITY 8, VISUAL_DENSITY 2.
**Motion personality (Motion Design):** Premium. **Material:** Fluid (1.5x duration, 5% overshoot) for scene motion.
**Brand motion identity:**
- Signature curve: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` for 80% of motion
- Duration palette: quick 160ms, standard 280ms, slow 900ms (scene beats)
- Entrance pattern: rise 12px plus fade from black, never a scale pop

**Brand, unchanged:** Miranda Sans 400/500, gold `#F3CF8A` as the only accent, base `#0B0111`, Alma mark, the real demos.

---

## 3. Layout: the corner frame

```
DESKTOP (>= 1024)
┌──────────────────────────────────────────────────────────────────┐
│ Alma                                  Manifesto  [Get early access]│  top: 24px gutter
│                                                                  │
│  Say it.                                  ╭─────╮                │
│  Watch your Mac                          (  ✿✿  )               │  creature: right of centre
│  do it.                                   ╰┬┬┬┬╯                 │
│                                         ◉  ││││  ◉              │  6 specimens on the tentacles
│  Every step visible,                   ◉   ││││   ◉             │
│  every step stoppable.                    ◉ ││ ◉                 │
│                                                                  │
│  Email                                                           │
│  [ you@domain.com          ][Get early access]                   │
│                                                                  │
│ ◐ Sound off          [ What should Alma do?                  → ] │  bottom: prompt docked centre-right
└──────────────────────────────────────────────────────────────────┘

MOBILE (< 768), still one screen
┌────────────────────────┐
│ Alma     [Early access] │
│        ╭─────╮          │
│       (  ✿✿  )          │  creature: top 38%
│        ╰┬┬┬┬╯           │
│  ◉ ◉ ◉ ◉ ◉ ◉  ← swipe   │  specimens become a dot row
│ Say it. Watch your      │
│ Mac do it.              │
│ [ email ][ → ]          │
│ [ What should Alma do?] │  prompt docked above safe area
└────────────────────────┘
```

- **Fits the viewport at any height down to 560px.** Below that the headline steps down a size. Nothing scrolls (`overflow: hidden` on the stage, overlays are sheets).
- **Layers:** WebGL canvas (z0) → DOM specimen hit targets (z1) → copy, form and prompt (z2) → video panel (z3) → sheets (z4) → loader (z5).

---

## 4. The visit: storyboard

| # | Beat | Trigger | What happens | Duration and curve | Purpose |
|---|---|---|---|---|---|
| 1 | **Descent** (loader) | Page load | Depth gauge counts `0 m → 200 m` in the bottom-left corner. Camera sinks through a light shaft, the creature's glow fades up. HTML headline and form are **already rendered and usable** underneath | ≤1200ms, skippable on any input. `--ease-in-out` camera | Brand moment (Lusion pattern) |
| 2 | **Idle tank** | Default | Creature pulses (contract 280ms, relax 1100ms, every 3.2s). Caustics drift on the water. The cursor is a soft light; the creature turns toward it on a spring, and tentacles drift away from it | Ambient: pulse per Motion Design "Waiting/idle" 0.98-1.02 at 3000ms. Cursor spring stiffness 40, damping 14 | Alive, calm |
| 3 | **Ask** | Type in the prompt, or hover or focus a specimen | Hover: that specimen brightens and its DOM label appears. Typing: the creature leans toward the prompt (`attentive`). Submit: **your words replace the headline** in kinetic type (lines rise through a mask, 40ms stagger), followed by "Watch." | Type swap: exit 160ms, enter 280ms `--ease-out`, 40ms per line | The moment people remember |
| 4 | **Reach** | Match found (on-device) | The heart lobes light in sequence (`thinking`, up to 600ms). One tentacle grabs the matching specimen and lifts it. The camera pushes 15% toward it | Reach 600ms `--ease-in-out`. Camera 900ms Fluid | Shows where the demo comes from |
| 5 | **Watch** | Reach done | The video panel **unfolds from the specimen's screen position** with a clip-path circle-to-rounded-rect reveal. The scene behind gets focus blur and dims. Caption: task, real stats, "Every step visible. Press stop anytime." | Reveal 420ms `--ease-out`, focus blur 600ms. Close: 200ms reverse | Proof |
| 6 | **Want** | Video ends, or the panel is closed after 50% or more watched | The camera pulls back. A trail of light runs from the creature to the email field, and the field gets a 2500ms CTA breath (Motion Design "CTA attention", 0.97-1.03). The headline becomes "Want Alma to do that on your Mac?" | Trail 900ms `--ease-in-out` | Turns interest into a signup |
| 7 | **Bloom** | Signup success | The creature lights to full glow and releases an ephyra (a baby jellyfish) that swims to the form and **unfolds into the invite sheet**: place in line, share link, first-task question | Bloom 1400ms. Sheet enter 280ms `--ease-drawer`, exit 180ms | Celebration and referral |

Errors: a single `startle` contraction of the creature, plus an inline message. No shaking UI and no red on the creature.

---

## 5. The scene (shader-dev)

### Passes and budgets

| Layer | Technique (shader-dev file) | High tier | Low tier (phones, ≤4 cores) |
|---|---|---|---|
| Water volume background | color-palette, procedural-noise (FBM ≤4 octaves) | Full-screen quad, depth gradient `#07010B → #0B0111` with warped noise haze | Same, 3 octaves at half resolution |
| Caustics | water-ocean (caustic pattern), domain-warping | Animated caustic light on the haze, strongest near the top | Static caustic texture, scrolled |
| Light shafts | volumetric-rendering (screen-space radial, ≤32 samples) | 24 samples, from the top toward the creature | Off. A baked gradient instead |
| Creature | Existing scene. Bell surface gets domain-warped emissive veins | 64×32 bell, 24 tentacles | 32×16, 12 tentacles |
| Specimens (6) | Emissive spheres plus a halo sprite | Glow tied to hover and state | Same |
| Marine snow | particle-system | 600 points | 200 |
| Cursor wake | fluid-simulation (half-float ping-pong) | 128² velocity field distorting the haze | Off. A cheap radial ripple in post instead |
| Post chain | post-processing: ACES tone map, mip bloom, vignette, grain. camera-effects: single-pass focus blur | Full chain at 0.75 resolution | Bloom plus vignette only |

**Frame budget:** ≤4ms GPU on an integrated laptop GPU at high tier, ≤8ms on a mid-range phone at low tier (30fps cap). Tier is chosen by device capability, and automatically **drops a tier** if the median frame time is over 12ms across 60 frames.

**shader-dev rules applied:** FBM ≤6 octaves, volume loops ≤32 steps, ≤1000 loop iterations per pixel, WebGL2 only, float-texture capability check before running the fluid wake (webgl-pitfalls), and a no-WebGL fallback to a static poster.

**Bundle:** three.js plus the scene plus the post chain at most 220KB gzipped, loaded after first paint. The page HTML, CSS and form work without it.

---

## 6. Motion layers (Motion Design: three layers)

| Layer | Elements | Rules |
|---|---|---|
| **Primary** | Creature reach, video unfold, kinetic headline, bloom | One primary action at a time (staging). Everything else dims to 80% |
| **Secondary** | Specimen glow, camera push, focus blur, light trail | Starts 50-100ms after the primary action (follow-through) |
| **Ambient** | Pulse, caustics, snow, cursor light, slow light-shaft shimmer | Loops at 3000ms or more, sine in-out, never competing with the primary |

**1/3 rule:** at most 3 elements move noticeably at once, and none travels more than a third of the screen in one beat except the camera.

**Reduced motion:**
- No camera moves, no tentacle reach, no fluid wake, no kinetic type travel. The headline crossfades over 200ms.
- The video panel fades in, with no clip-path travel.
- Pulse and caustics are frozen. Bloom becomes a 600ms glow change.
- The loader is skipped.

---

## 7. DOM components

| Component | Notes | States |
|---|---|---|
| `CornerFrame` | Logo top-left, Manifesto and CTA top-right, sound toggle and depth gauge bottom-left | n/a |
| `KineticHeadline` | Real `<h1>`. Lines are wrapped for mask reveals. `aria-live="polite"` region announces the swapped text once | default, asked (user words), watch, want, joined |
| `WaitlistForm` | Reused from v1 (one shared store, all states). Labels above inputs, 16px | idle, focus, invalid, submitting, success, exists, server error, timeout, offline, non-Mac notice |
| `PromptBar` | Reused task matching. Shows the matched or closest demo | idle, focus, thinking, matched, unmatched |
| `SpecimenTargets` | 6 real `<button>` elements positioned over the 3D specimens every frame (the 3D is decorative, the buttons carry meaning). Mobile: a scroll-snap dot row inside the stage | default, hover, focus, active, playing |
| `VideoPanel` | Reused player (error state, "Watch on X"). Clip-path reveal from the specimen's coordinates. `Esc` closes it. Focus moves in and returns on close | poster, loading, playing, paused, ended, error |
| `InviteSheet` | Bottom sheet (mobile) or anchored panel (desktop). Place in line (mock data labelled), copy link, share on X, first-task question | mock, live, copied, sent |
| `ManifestoSheet` | Long text in a sheet that scrolls internally. The page itself never scrolls | open, closed |
| `SoundToggle` | Off by default. WebAudio synthesis (filtered brown noise plus a slow low hum), no audio file. Saves the choice per visitor | off, on, unavailable |
| `DepthLoader` | Counts in the corner, never covers the form. Skip on any key, click or tap | running, done, skipped |

**v1 code reused:** creature scene (extended), task matcher, waitlist store and UI, player, API adapter, analytics, platform helpers, tokens, base CSS, Icon.
**v1 code deleted:** Specimens, Transparent, Reach, CredBlock, Bloom, StickyCTA, SiteFooter, station logic, `/demos/[slug]` scroll variant (deep links stay but open the VideoPanel directly).

---

## 8. Copy (no em-dashes, sentence case)

| Slot | Text |
|---|---|
| H1 default | Say it. Watch your Mac do it. |
| Sub | Every step visible, every step stoppable. |
| H1 after asking | {user's task}. Watch. |
| H1 after watching | Want Alma to do that on your Mac? |
| H1 after joining | You're in. Invites go out in waves. |
| Prompt | What should Alma do? |
| CTA everywhere | Get early access |
| Video caption tail | Unedited recording. Press stop anytime. |
| Loader | Descending · {n} m (one dot, allowed once) |
| Sound | Sound off / Sound on |

---

## 9. Guardrails (non-negotiable)

**Conversion**
- The email field is visible and usable in the first frame, before WebGL loads.
- One CTA label. The loader never blocks input.

**Usability**
- Every 3D thing that does something has a real DOM control.
- Keyboard order: CTA, email, prompt, specimens, sound. Visible focus rings.

**Performance**
- LCP is the H1 text, under 1.8s. CLS under 0.05. INP under 150ms.
- Page JS before the scene ≤25KB gzipped.

**Accessibility**
- WCAG 2.2 AA. Reduced motion as in section 6. Captions on videos.
- Sound is off by default.

**Fallbacks**
- No WebGL, save-data or context loss: static poster, everything still works.
- Video failure: error state plus "Watch on X".

**Refactoring UI**
- Grayscale-first check of the DOM layer.
- Every value comes from the token scales. **Target score 10/10** on the 8-row diagnostic.

---

## 10. Milestones

| # | Milestone | Skills used | Done when |
|---|---|---|---|
| M1 | Strip v1, build the single-screen DOM frame | taste, refactoring-ui, mobile-native | Fits 1440×900, 1366×650, 390×844, 360×640 with no scroll. Form works with JS off |
| M2 | Water scene: haze, caustics, light shafts, snow, post chain, tiers | shader-dev | High tier ≤4ms per frame. Tier drop works. Fallback poster works |
| M3 | Creature v2: cursor light and spring turn, veins, specimens on tentacles, DOM targets synced | shader-dev, animate | Specimens clickable by mouse, keyboard and touch |
| M4 | Storyboard beats 3-6: kinetic headline, reach, clip-path unfold, focus blur, light trail | motion-design, emil-design-eng | Each beat matches section 4 timings, feel-checked at 3x slow speed |
| M5 | Bloom, invite sheet, manifesto sheet, depth loader, sound | motion-design, animate | Signup flow end to end in mock mode |
| M6 | Review pass | review-animations, find-animation-opportunities, break-ui, web-design-guidelines, refactoring-ui | Zero blocking findings, Refactoring UI 10/10, break-ui cases pass |
| M7 | Pitch deck | frontend-slides | 8-10 slides: problem, research, concept, storyboard, system, live demo link, metrics |

## 11. Presenting
- Run the demo on a **phone hotspot** so alma.inc assets load (the college firewall blocks them).
- Or drop local copies into `public/media/demos/` and set `PUBLIC_ASSET_BASE=""`.
- The deck (M7) is local HTML. Exporting to PPTX or PDF happens on your machine. Deploying publicly only happens if you ask.

## 12. Open questions
1. Sound: ship the toggle (off by default), or leave sound out?
2. High-tier extras (fluid cursor wake, light shafts): keep, or simplify for a faster build?
3. Demo media: hotspot on the day, or can you get the files?
4. Is the pitch deck (M7) needed for your placement submission?
