# Alma "The Tank": landing page design plan

Status: plan for a coded prototype. It should be built so Alma's team can lift it straight into alma.inc.
Skills applied: design-taste-frontend, redesign-skill, emil-design-eng, animate, review-animations, find-animation-opportunities, mobile-native, break-ui, interface-design, web-design-guidelines, impeccable.

---

## 0. Brief

**Reading this as:** a waitlist landing page for a Mac computer-use agent, aimed at technical early adopters arriving mostly from X demo posts. The style is calm and atmospheric, deep-sea themed, and leans toward a single interactive creature that carries the whole message.

**Dials:** DESIGN_VARIANCE 7, MOTION_INTENSITY 7, VISUAL_DENSITY 3.

**Goal:** get the most *qualified* waitlist signups.

| Metric | Type | Definition |
|---|---|---|
| Visit to signup rate, by traffic source | Primary | Waitlist success events / unique visits, split by `utm_source` and referrer (X, direct, referral) |
| Task engagement | Secondary | % of visitors who submit a task or click a chip |
| Invites per signup | Secondary | Referral link copies and shares / successful signups |
| First-task answer rate | Secondary | % of signups who answer "What would you have Alma do first?" |

### Brand constraints (keep, do not change)
| Asset | Value | Source |
|---|---|---|
| Typeface | Miranda Sans 400 and 500 (self-hosted woff2) | `/page/fonts/miranda-{400,500}.woff2` |
| Logo | Alma four-lobe mark plus wordmark | existing assets |
| Accent | Gold `#F3CF8A`, bright gold `#FFE6B0` | current CSS `--gold`, `--gold-bright` |
| Base | `#0B0111` | current `theme-color` |
| Demos | 6 unedited recordings (full mp4, small mp4, poster each) | `/media/demos/{blender,paint,krunker,zerodha,passwords,tinder}*` |
| Waitlist API | `POST /waitlist` with JSON `{ email }` | current bundle |
| Routes | `/demos/<slug>/` shareable demo URLs, `llms.txt` | current site |
| Analytics | PostHog `capture()` plus `almaTrackMetaEvent` | current bundle |

### Dropped from the current site
- macOS imitation chrome (menubar, Finder, Control Center, traffic lights, Apple blue `#007aff`). It is the Apple look-alike risk and the cause of the mobile problems.
- The double-click interaction model, `⌘W` and `⌘M` hints the browser takes over, and "Join us" (unclear whether it means waitlist or hiring).

### Stack (to fit Alma's)
- **Astro** pages and components, **vanilla TypeScript** islands, **CSS custom properties** (no Tailwind, matching the current site).
- **Three.js** for the creature only. It is lazy-loaded after first paint and lives in one island.
- No React. Any animation library must justify its weight; WAAPI and CSS cover everything except the creature.

---

## 1. Product thinking

### Who arrives, and what they need answered
| Visitor | Arrives from | Their first question | What answers it |
|---|---|---|---|
| X scroller who saw a demo | Link to `/demos/<slug>` or the homepage | "Is that real?" | The tank opens with *that* demo playing, labelled "Unedited recording" |
| AI-curious Mac power user | Search, word of mouth | "Can it do *my* thing?" | The task prompt |
| Skeptic | Hacker News, comments | "Will it wreck my computer?" | The "Transparent by design" section: visible steps and a Stop control |
| Windows or phone visitor | Anywhere | "Can I use it?" | A platform notice: "Alma is for Mac. We'll send your invite there." |

### The funnel
```
LAND ──► ASK ──► WATCH ──► WANT ──► JOIN ──► SPREAD
tank     type or   matched    "Want Alma   email     place in line,
loads    pick a    demo plays to do that   (1 field) invite link,
         task      inline     on your Mac?"          first-task question
```
Each step is skippable. The email field is visible from the first screen, so no one has to "play" to sign up.

### Matching a typed task to a demo (prototype)
- Matching happens on the visitor's device using a keyword and intent table per demo (`src/data/demos.ts`). It needs no LLM call, so there is no cost and nothing to abuse.

| Demo | Intent keywords (examples) |
|---|---|
| passwords | password, security, login, accounts, weak |
| blender | 3d, model, render, blender, rocket |
| paint | draw, paint, sketch, art, picture |
| zerodha | stock, trade, chart, option, nifty, portfolio |
| krunker | game, play, fps, shoot |
| tinder | dating, swipe, match, tinder |

- **No match:** reply "Alma hasn't been filmed doing that yet. Here's the closest one," then play the best match (passwords as the default). Keep the visitor's wording: "We'll show the team you asked for *{task}*."
- **Privacy:** typed tasks are sent to analytics only as *matched demo ID and length*, never the raw text, unless the visitor signs up and answers the first-task question.
- **Later (not in the prototype):** a server-side classifier. The UI contract stays the same.

### Copy deck (no em-dashes, no exclamation marks, sentence case)
| Slot | Copy |
|---|---|
| H1 | Say it. Watch your Mac do it. |
| Sub (no more than 20 words) | Alma uses your apps the way you do. Clicking, typing, navigating. Every step visible, every step stoppable. |
| Prompt placeholder | What should Alma do? |
| Chips | Fix my weak passwords · Build a rocket in Blender · Paint me something · Chart NIFTY 50 |
| Post-demo bridge | Want Alma to do that on your Mac? |
| CTA (one label, used everywhere) | Get early access |
| Email placeholder | you@domain.com (the label sits above: "Email") |
| Submitting | Saving your spot |
| Success | You're in. Invites go out in waves. |
| Already listed | You're already on the list. Here's your invite link. |
| Invalid email | That email looks incomplete. |
| Server error | We couldn't save that. Try again in a moment. |
| Offline | You're offline. We'll keep your email here until you reconnect. |
| Non-Mac notice | Alma runs on Mac. Leave your email and open the invite there. |
| First-task question | What would you have Alma do first? |
| Referral | Move up the list. Share your link. |

### Things the backend must add (the prototype mocks them)
- `POST /waitlist` returns `{ status: "created" | "exists", position?: number, referralCode?: string }`
- `POST /waitlist/answer` with `{ email, firstTask }`
- `?ref=<code>` attributes the visitor on signup

The prototype ships `src/lib/api.ts` with `MODE = "live" | "mock"`. In mock mode, the place in line is labelled "example" in the UI so nobody mistakes it for real data.

---

## 2. Design language

**Concept: "One warm light in a deep sea."** Alma is the only light source on the page. Everything else is water.

### Principles
1. **The creature is the interface.** The jellyfish isn't decoration. It reacts to the visitor typing, thinking, choosing and joining.
2. **Show, don't claim.** Real recordings come before adjectives. Real numbers ("under 2 minutes, about $0.30") come before superlatives.
3. **Transparent by default.** The bell is see-through, so you see the work. The jellyfish anatomy carries the trust message.
4. **One light.** Gold is the only accent, and light only ever comes from the creature or an action the visitor takes. No glowing borders, no gradient text.
5. **Calm pace.** Nothing rushes, and nothing loops without a reason. Motion follows the pulse rhythm: a quick contraction, then a slow release.

### The jellyfish, mapped to the brand
| Jellyfish trait | Alma meaning | Where it shows up |
|---|---|---|
| Four-lobe gonads seen through the bell (moon jellyfish) | The Alma mark | The logo glows *inside* the bell; it is the creature's heart |
| Transparent body | Every action visible | Transparent-by-design section |
| Tentacles | Reaches into any app | The tentacles reach toward the demo and app icons |
| Bioluminescence | Your computer starts from intent | The gold glow, and the bloom on signup |
| Ephyra (a baby jellyfish) | An invite you can pass on | The success state releases a small jellyfish: "your invite" |

**Avoid:** "no brain" or nerve-net metaphors (bad for an AI product), stings and danger imagery, and purple-blue neon (the generic AI look).

### Voice
Plain, specific, a little dry. Short sentences. Verbs over adjectives. Banned words: elevate, seamless, unleash, revolutionize, next-gen, magic.

---

## 3. Design system

Tokens live in `src/styles/tokens.css` (written alongside this plan).

### Colour
| Token | Value | Use |
|---|---|---|
| `--sea-950` | `#07010B` | Page edges and vignette, the deepest water |
| `--sea-900` | `#0B0111` | Page background (brand `theme-color`) |
| `--sea-850` | `#110818` | Raised surfaces (demo stage, cards) |
| `--sea-800` | `#180F21` | Inputs, chips |
| `--sea-700` | `#231A2D` | Hover fill |
| `--line` | `rgb(255 255 255 / .10)` | Hairlines, dividers |
| `--line-strong` | `rgb(255 255 255 / .18)` | Input borders |
| `--ink-100` | `rgb(255 255 255 / .92)` | Primary text (about 17:1 contrast) |
| `--ink-300` | `rgb(255 255 255 / .68)` | Secondary text (about 9:1) |
| `--ink-400` | `rgb(255 255 255 / .56)` | Meta text 13px and up (about 6:1) |
| `--ink-500` | `rgb(255 255 255 / .40)` | Disabled text or 18px+ only (about 3.5:1) |
| `--glow-300` | `#FFE6B0` | Creature core, hover glow |
| `--glow-500` | `#F3CF8A` | **The only accent**: CTA fill, focus ring, creature light |
| `--glow-700` | `#C9A464` | CTA pressed state |
| `--on-glow` | `#110818` | Text on a gold fill (about 12:1) |
| `--danger` | `#FF8F80` | Error text and borders only, never on the creature |

The page has one theme, dark. There's no light mode, and the brand is dark-only today. The skill's dark-mode rule is met by this deliberate one-theme lock; it is noted here as a decision.

### Typography (Miranda Sans 400 and 500 only, since the brand ships no other weights)
| Token | Size | Line height | Tracking | Weight |
|---|---|---|---|---|
| `--t-display` | `clamp(2.5rem, 1.6rem + 3.6vw, 4.5rem)` | 1.04 | -0.03em | 500 |
| `--t-h2` | `clamp(1.75rem, 1.3rem + 1.8vw, 2.75rem)` | 1.1 | -0.02em | 500 |
| `--t-h3` | `1.25rem` | 1.3 | -0.01em | 500 |
| `--t-body` | `1.0625rem` (17px) | 1.55 | 0 | 400 |
| `--t-small` | `0.875rem` | 1.5 | 0 | 400 |
| `--t-micro` | `0.8125rem` | 1.4 | 0.01em | 500 |

- Inputs are **16px or larger** (prevents iOS focus zoom).
- Use `text-wrap: balance` on headings and `text-wrap: pretty` on paragraphs. Keep body text to 60ch.
- Use tabular numbers for stats such as place in line, durations and costs.

### Space (4px base)
`--s-1` 4 · `--s-2` 8 · `--s-3` 12 · `--s-4` 16 · `--s-5` 24 · `--s-6` 32 · `--s-7` 48 · `--s-8` 64 · `--s-9` 96 · `--s-10` 128

Section padding is `--s-9` on desktop and `--s-8` on mobile, with the bottom optically 1.15x the top.

### Shape (one rule, written down)
- Anything you press is a **pill** (`--r-pill`): buttons, chips, the input.
- Surfaces are **20px** (`--r-surface`): the demo stage, panels.
- Media inside surfaces is **14px** (`--r-media`).
- Small UI is **10px** (`--r-sm`): tooltips, tags.

### Depth
- No black drop shadows. Depth comes from **light falloff** (radial gold glow from the creature) and **water haze** (blue-black gradients in layers).
- Glass only on the sticky CTA bar: `backdrop-filter: blur(16px) saturate(140%)`, with a solid `--sea-850` fallback under `prefers-reduced-transparency`.
- Grain: a fixed `pointer-events:none` overlay at 3% opacity on a pseudo-element, never on scrolling layers.

### Layout
- Max width 1280px, 12 columns, 24px gutters on desktop and 16px on mobile.
- Breakpoints: 640, 768, 1024, 1280.
- Full-height areas use `min-height: 100dvh`.

### Icons
- Phosphor Icons, regular weight. App marks reuse the existing SVGs (`/page/desktop/icons/*.svg`).
- Never draw icon paths by hand.

---

## 4. The creature (jellyfish spec)

### Anatomy (built in Three.js)
| Part | Build | Detail budget, desktop / mobile |
|---|---|---|
| Bell | Displaced hemisphere, Fresnel transparency shader, rim light in `--glow-300` | 64×32 / 32×16 segments |
| Heart | Alma four-lobe mark as an emissive texture inside the bell | 1 quad |
| Oral arms (4) | Ribbon meshes, slow sine sway | 4 × 24 / 4 × 12 |
| Tentacles | Verlet chains drawn as thin lines, driven by the bell's pulse | 24 × 32 / 12 × 16 points |
| Marine snow | GPU points drifting upward, parallax with the pointer | 600 / 200 |

Render with DPR capped at 1.5 on desktop and 1 on mobile. Pause on `IntersectionObserver` (off screen) and `visibilitychange` (tab hidden).

### States (driven by one `creature.setState()` API)
| State | Trigger | Behaviour |
|---|---|---|
| `idle` | Default | Pulses every 3.2s, drifts ±12px, heart at 60% |
| `attentive` | Prompt or email field focused | Drifts toward the field, pulses every 2.2s, heart at 80% |
| `thinking` | Task submitted, before matching | The four lobes light up in turn (a loading indicator that *is* the logo), up to 600ms |
| `reaching` | Match found | Tentacles extend toward the demo stage over 600ms, then the stage opens |
| `presenting` | Demo playing | Dims to 40% and drifts aside so it doesn't compete with the video |
| `bloom` | Waitlist success | Full glow, one slow pulse, releases an ephyra that drifts to the invite card |
| `startle` | Error | One quick contraction. No colour change; errors stay in the form |
| `asleep` | Off screen or tab hidden | Rendering paused |

Desktop pointer behaviour (`hover:hover` and `pointer:fine` only): the creature eases toward the cursor on a spring (`stiffness 40, damping 14`), capped at 40px of travel. This is decorative and allowed because this is a marketing page.

### Fallbacks
| Condition | What's shown |
|---|---|
| No WebGL2, `navigator.connection.saveData`, or failed shader compile | Static poster (rendered from the same scene, AVIF/WebP) plus a CSS opacity "breath" every 6s |
| `prefers-reduced-motion` | Static poster. The state changes become gentle opacity and glow changes only, with no drift, reach or bloom movement |
| No JS | Static poster, plain form posting to `/waitlist`, and demos as a list of `<video controls>` |

**Performance:** the **LCP element is the H1 text**, not the canvas. The creature bundle (Three.js plus scene) is at most 160KB gzipped and loads with `requestIdleCallback` after first paint. The poster sits underneath, so the swap to the live creature is invisible (crossfade 400ms).

---

## 5. Page architecture

The page has 6 sections and 6 different layout families. There are at most 2 eyebrow labels on the whole page.

| # | Section | Layout | Job | Key components |
|---|---|---|---|---|
| 1 | **Tank** (hero) | Split: copy and form on the left (5 columns), creature and demo stage on the right (7 columns). Mobile: creature on top, then copy, then form | Hook, ask, prove, convert | `SiteHeader`, `TankCanvas`, `TaskPrompt`, `TaskChips`, `DemoStage`, `WaitlistForm` |
| 2 | **Specimens** | Horizontal scroll-snap row of 6 recordings, each tile on its own lit "specimen" backdrop | Proof by volume | `SpecimenCard`, `DemoStage` (modal on mobile, inline on desktop) |
| 3 | **Transparent by design** | Full-width sticky split: a recording on the left, the agent's step list ticking on the right, with a **Stop** button you can press | Defuse the fear | `StepTrace`, `StopButton` |
| 4 | **Reach** | Centred creature with tentacles reaching out to real app icons in an arc | Any app, no integrations | `ReachDiagram` |
| 5 | **Built from scratch** | Plain text block with one stat row (no cards) | Credibility | `CredBlock`, `StatRow` |
| 6 | **Bloom** | Full-bleed dark band, the creature at full glow, centred form | Final conversion | `WaitlistForm`, `TankCanvas` (same instance, re-parented) |
| | Footer | Single row | Legal and contact | `SiteFooter` |
| | Sticky bar | Appears after the Tank leaves view, hidden while the Bloom is visible | Always-available CTA | `StickyCTA` |

### Deep links
- `/demos/<slug>/` renders the same page with the Tank's `DemoStage` preloaded to that demo and the creature in `presenting`. It also gets its own title and OG image (keeps the current URLs working for search and sharing).
- `/?ref=<code>` stores the referral code in `sessionStorage`, wrapped in try/catch.

---

## 6. Component inventory

Every component lists its states. Mark-up is semantic HTML first; scripts only enhance it.

| Component | Element | States | Accessibility notes |
|---|---|---|---|
| `SiteHeader` | `<header><nav>` | default, scrolled (hairline appears) | 64px tall, one line. Links: Demos, Manifesto, button "Get early access". Skip link to `#main` |
| `TankCanvas` | `<canvas aria-hidden="true">` plus poster `<img alt="">` | the 8 creature states above, fallback | Decorative. All meaning is duplicated in text |
| `TaskPrompt` | `<form role="search">` with `<label class="sr-only">` and `<input>` | idle, focus, typing, thinking, matched, unmatched | `aria-describedby` points at the result line. Result announced via `aria-live="polite"` |
| `TaskChip` | `<button>` | default, hover (gated), pressed, selected | Selected state uses `aria-pressed` |
| `DemoStage` | `<figure>` with `<video playsinline preload="none">` and `<figcaption>` | empty, poster, loading, playing, paused, ended (shows bridge and CTA), error (shows "Watch on X") | Custom controls are buttons with labels. Captions via `<track>`. Starts muted only if autoplayed, with an obvious unmute control |
| `WaitlistForm` | `<form action="/waitlist" method="post">` with a visible `<label>` | idle, focus, invalid, submitting, success, exists, error, offline, non-Mac notice | One shared store, so all three placements (hero, sticky, bloom) change together. Errors are inline below the field with `aria-invalid`. Button stays enabled and shows a progress label |
| `InviteCard` | `<section aria-labelledby>` | mock (labelled "example"), live | Copy-link button confirms with an inline "Copied", not a toast. X share link |
| `FirstTaskQuestion` | `<form>` with `<textarea>` | idle, sent | Optional, can be dismissed |
| `PlatformNotice` | `<p>` inside the form | mac (hidden), other | Detected from `userAgentData.platform`, falling back to the user agent |
| `StickyCTA` | `<aside>` | hidden, shown, form open | Safe-area padding, closes with Esc, no focus trap |
| `SpecimenCard` | `<button>` that opens the stage | default, hover, playing | Scroll-snap row is keyboard reachable. "6 recordings" count stated as text |
| `StepTrace` | `<ol>` | running, stopped, done | Steps are real text. Stop is a real button that pauses the video |
| `ReachDiagram` | `<figure>` with SVG and the app list as text | static, reaching (in view) | App names are listed in text too |
| `StatRow` | `<dl>` | static | Real numbers only, from the demos |
| `SiteFooter` | `<footer>` | static | Privacy, Terms, contact email |

### Buttons
| Variant | Fill | Text | Use |
|---|---|---|---|
| Primary | `--glow-500` | `--on-glow` | "Get early access" only |
| Secondary | `--sea-800` plus `--line-strong` border | `--ink-100` | Chips, "Watch on X" |
| Text | none | `--ink-300` | Tertiary links |

All buttons are at least 44px tall and use `:active { transform: scale(.97) }`. Focus is a 2px `--glow-500` ring offset 3px.

---

## 7. Motion spec

Every row passed the animate skill's checks for frequency, purpose and tool. Curves come from the skill's tables, not invented.

```css
--ease-out:    cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

| Element | Frequency | Purpose | Tool | Properties | Curve | Duration | Reduced motion |
|---|---|---|---|---|---|---|---|
| Button and chip press | tens/day | Feedback | CSS transition | transform `scale(.97)` | `--ease-out` | 120ms | Kept (no movement) |
| Chip and link hover | tens/day | Feedback | CSS transition, gated by `hover:hover` | background-color | `ease` | 150ms | Kept |
| Input focus ring | tens/day | State | CSS transition | ring opacity | `--ease-out` | 150ms | Kept |
| Creature pulse | idle | Explanation (it's alive) | Three.js | bell scale | contract `--ease-out` 280ms, relax `--ease-in-out` 1100ms | every 3.2s | Static |
| Thinking lobes | per task | State | Three.js | emissive intensity | `--ease-in-out` | 150ms per lobe, up to 600ms | Opacity only |
| Tentacle reach | per task | Spatial (demo comes *from* Alma) | Three.js | vertex targets | `--ease-in-out` | 600ms | Skipped |
| Demo stage enter | per task | Prevents a jarring swap | WAAPI | opacity, `blur(2px→0)`, `scale(.98→1)` | `--ease-out` | 240ms | Opacity only, 200ms |
| Demo stage exit | per task | Same | WAAPI | opacity, scale | `--ease-out` | 160ms (faster than enter) | Opacity only |
| Form to success | once | State and delight | WAAPI | crossfade with 2px blur bridge | `--ease-out` | 220ms | Opacity only |
| Bloom and ephyra release | once | Delight | Three.js | glow, ephyra path | `--ease-in-out` | 1400ms | Glow fade only |
| Sticky bar | occasional | Spatial | CSS transition | `translateY(100%→0)` | `--ease-drawer` | enter 280ms, exit 180ms | Opacity only |
| Section reveal | once per section | Hierarchy | CSS scroll-driven (`animation-timeline: view()`) or IntersectionObserver | opacity, `translateY(12px→0)` | `--ease-out` | 400ms, 60ms stagger | None, content visible |
| Specimen row | user scroll | n/a | native scroll-snap | none | none | none | n/a |
| Menus and keyboard actions | 100+/day | n/a | **no animation** | none | none | none | n/a |

**Never:** `transition: all`, `ease-in`, `scale(0)`, animating width or height, `window` scroll listeners, more than one marquee (there are zero), hover motion that isn't gated.

**Things to feel-check by hand:** the pulse ratio (contract and relax), the tentacle reach timing against the stage entrance, and the blur crossfade on the success change. Review each at 3x slow speed and again the next day.

---

## 8. Mobile (mobile-native)
- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` and `theme-color #0B0111`.
- `env(safe-area-inset-*)` padding on the sticky bar and footer.
- `-webkit-tap-highlight-color: transparent` on buttons, with the custom pressed state as the replacement.
- `touch-action: manipulation` on interactive elements. `overscroll-behavior-x: contain` on the specimen row only.
- `user-select: none` on button labels only, never on copy.
- Demos use the `-sm.mp4` files under 768px, with `playsinline` and no autoplay with sound.
- The creature uses its low-detail level, capped at 30fps on low-power devices (`navigator.hardwareConcurrency <= 4`).
- **Test on a real iPhone and Android phone** before calling it done.

## 9. Worst cases to test (break-ui)
| Case | Expected |
|---|---|
| A 254-character email, or one with `+tag` and unicode in the domain | The field scrolls horizontally, the server validates, and the layout doesn't break |
| Double-tapping submit | Request deduplicated, one success |
| `/waitlist` returns 500, times out, or the device is offline | Inline error, email kept, retry works |
| The same email submitted twice | The "exists" state, still showing the invite link |
| A 400-character task, emoji, or Hindi script | Truncated display with ellipsis, matching still works or falls back |
| Video 404 or autoplay blocked | Poster plus "Watch on X" |
| WebGL context lost mid-session | Swap to the poster silently |
| 320px wide, 200% zoom, landscape phone | No horizontal scroll, form reachable |
| Windows or Android visitor | Platform notice, signup still allowed |

## 10. Accessibility checklist
WCAG 2.2 AA. One `<h1>` and logical headings. A skip link. Visible focus rings everywhere. Form labels sit above fields, never placeholders alone. `aria-live` for task results and form status. Videos have captions and no autoplaying sound. Every animation has a reduced-motion version. Touch targets are at least 44px. Contrast is checked against the token table.

## 11. Performance budget
| Item | Budget |
|---|---|
| LCP (H1) | under 1.8s on 4G |
| CLS | under 0.05 (poster and stage have reserved aspect ratios) |
| INP | under 150ms |
| First-load JS before the creature | 25KB gzipped or less |
| Creature bundle (lazy-loaded) | 160KB gzipped or less |
| Fonts | 2 woff2 files, preloaded |
| Creature GPU time | 4ms per frame or less on an M1 Air |

## 12. Analytics events (PostHog, existing setup)
| Event | Properties |
|---|---|
| `tank_view` | `source`, `ref`, `platform` |
| `task_focus` | none |
| `task_submit` | `matched`, `demo`, `length`, `via` (`typed` or `chip`) |
| `demo_play` / `demo_complete` | `demo`, `placement` |
| `bridge_cta_view` | `demo` |
| `waitlist_submit` / `waitlist_success` / `waitlist_error` | `placement` (`hero`, `sticky`, `bloom`), `status`, `error` |
| `invite_copy` / `invite_share_x` | none |
| `first_task_answer` | `length` (raw text goes to the backend, not to analytics) |

## 13. File structure (prototype, ready to integrate)
```
src/
  pages/index.astro            # Tank page
  pages/demos/[slug].astro     # Deep links (static paths from data/demos.ts)
  layouts/Base.astro           # head, meta, OG, fonts, theme-color
  styles/tokens.css            # this design system
  styles/base.css              # reset, type, focus, grain, reduced-motion
  components/
    SiteHeader.astro  SiteFooter.astro  StickyCTA.astro
    Tank.astro  TaskPrompt.astro  TaskChips.astro  DemoStage.astro
    WaitlistForm.astro  InviteCard.astro  PlatformNotice.astro
    Specimens.astro  SpecimenCard.astro  Transparent.astro  StepTrace.astro
    Reach.astro  CredBlock.astro  Bloom.astro
  scripts/
    creature/  (scene.ts, bell.ts, tentacles.ts, snow.ts, states.ts, fallback.ts)
    task-match.ts  waitlist-store.ts  demo-stage.ts  analytics.ts  platform.ts
  data/demos.ts                # slug, title, caption, stats, files, keywords, X url
  lib/api.ts                   # live or mock waitlist adapter
public/media/...               # existing demo assets (copied for the prototype)
```

## 14. Build milestones
| # | Milestone | Done when |
|---|---|---|
| M0 | **Creature spike** | Bell, tentacles and pulse run at 60fps on an M1 and 30fps on a mid-range Android; poster fallback renders |
| M1 | Foundation | Tokens, base styles, layout, header and footer, no-JS page works |
| M2 | Tank core | TaskPrompt, matching, DemoStage and creature states connected |
| M3 | Conversion | WaitlistForm (all states), shared store, InviteCard, FirstTaskQuestion, StickyCTA, mock API |
| M4 | Sections | Specimens, Transparent, Reach, Cred, Bloom, deep links |
| M5 | Polish | Motion feel pass, reduced motion, mobile-native pass, accessibility audit, Lighthouse |
| M6 | Break-it pass | Every row in section 9 verified, with fixes |

## 15. Risks and open questions
1. **Real data:** can Alma's backend return the place in line and a referral code? If not, ship without referrals rather than with fake numbers.
2. **Team and credibility claims:** confirm what can be said publicly (for example "ex-Sarvam, ex-Microsoft researchers").
3. **Creature on low-end devices:** the M0 spike decides between live WebGL and a pre-rendered loop video on mobile.
4. **Captions:** the demo videos have burned-in serif captions that clash with Miranda Sans. Ask for clean exports, or accept them as part of the "unedited" proof.
5. **Manifesto:** link to the existing page or reproduce it? Default: link out.
