# Alma v5: "The Window"

**Status:** proposal for approval. Nothing here is built yet.
**Supersedes:**
- `PLAN-V4-REDESIGN.md` (direction and process);
- the concept in `ART-DIRECTION.md` §0 (its tokens in §2 carry over unless changed below);
- the stage list in `PLAN-V3-ONE-LIFE.md`.

**Product truth** stays in `PRODUCT.md`.

**Method:** written to the phases of the Awwwards skills installed in this project:
- `awwwards-jury` 02 (concept), 05 (signature moment), 01 (rubric);
- `awwwards-director` (decision framework);
- `ui-ux-pro-max` (UX rules);
- `emil-design-eng` (motion decisions).

---

## 0. Why a v5

The page kept feeling assembled because three things were solved separately:
- the jellyfish was a metaphor;
- the design was a set of effects;
- conversion was a form under a headline.

They share no single idea. The proof that Alma works (six real, unedited recordings) is hidden behind a small "Watch it work" link.

v5 makes one idea do all three jobs.

---

## 1. The connection: one trait, one promise

### The trait
*Turritopsis dohrnii* doesn't die. When it is worn out or injured, it reverts to a polyp and starts its life again, indefinitely. That is the one trait we use. Earlier versions mapped four traits (immortality, cells that change type, reverting, colonies). Four metaphors read as decoration, so the others are dropped from the visuals; they may survive as copy at most.

### The promise it carries
Alma's promise is that you hand a job over once and it does it again, and again, without tiring. "**Never do it again**" is true *because* the creature will do it again, forever. The loop of the immortal jellyfish (live → revert → live again) is the loop of an automation (do it → reset → do it again).

### The concept statement
> **This page is a window you watch Alma work through. The window is an immortal jellyfish: it takes a task, does it in front of you, folds back to a polyp, and is ready to do it again, forever.**

**Test without animation (jury 02):** a still frame shows a jellyfish whose bell holds a real Mac screen mid-task, under "Never do it again." The idea survives as a poster.

### Making the reference learnable
Most visitors won't know the animal. One quiet line near the creature names it:
> *Turritopsis dohrnii never dies. It starts again.*

This is one line of meta text. It is not an eyebrow and not a caption block.

---

## 2. Beat list (one screen, five states)

| # | Beat | Purpose | The one visual event |
|---|---|---|---|
| 1 | **Arrive** | First impression; recognition (it's Alma) | Light comes up; a polyp rests on the right, its four-lobe mark glowing |
| 2 | **Choose** | Pick what to watch (or skip straight to the email) | The tasks sit as a short labelled row; hovering one lifts the polyp slightly toward it |
| 3 | **Watch** *(signature)* | Proof that it works, on a real Mac | The polyp blooms into a medusa; its bell becomes a lens and the real recording plays inside it |
| 4 | **Again** | The immortality, the product's loop | When the recording ends, the medusa folds back to a polyp and re-blooms, ready |
| 5 | **Joined** | Confirmation; qualification; referral | "You're in."; "What should it never let you do again?"; your invite link |

The email form is visible and usable in **every** beat, from the first frame, before WebGL loads. Watching never blocks signing up, and signing up never blocks watching.

---

## 3. What you can watch: the real recordings

From `src/data/demos.ts` (copy from alma.inc/llms.txt). These replace the invented chores.

| Recording | Task label on the page | Real figures | Why it earns a place |
|---|---|---|---|
| Passwords | Fix my weak passwords | About a minute | The only true "chore you're tired of"; matches the headline exactly |
| Blender | Build a rocket in Blender | Under 2 minutes, about $0.30 of inference | A complex pro app, with a real cost figure |
| Zerodha | Trade NIFTY options by voice | Waits for your confirmation | Voice, plus control: it asks before acting |
| Krunker | Alma vs ChatGPT, same prompt | Side by side | Answers "why Alma?" in the 2026 field |
| Paint | Paint me something | Voice only | Optional: delight |
| Tinder | Swipe on Tinder | none published | Optional: humour; low proof value |

**Honest tension.** Only Passwords is a chore in the "never do it again" sense. The others prove capability. So:
- the row's label says **"Watch it do one:"**, not "hand it a chore";
- **the first screen shows four:** Passwords, Blender, Zerodha, and Alma vs ChatGPT;
- Paint and Tinder stay in the full recordings dialog.

The invented chores ("Rename 200 screenshots" and the rest) move to **after** signup, where they are honest. There, they are the visitor's *own* answer to "what should it never let you do again?". That is the qualification data the founders want.

**Deep links:** `/demos/<slug>/` from X opens straight into beat 3 with that recording. This replaces today's dialog.

---

## 4. Signature moment: specification (jury 05 format)

```
NAME:       The Window
TRIGGER:    click/tap/Enter on a task in the row; or a deep link /demos/<slug>/; or (once, after 4s idle,
            desktop only) a muted autoplay of Passwords at half opacity as an invitation
PHASES:     1. Bloom: polyp → medusa, bell rises to the right-centre of the frame; 600ms, ease-in-out
            2. Lens: the bell's interior clears to glass and the recording fades in inside the bell's silhouette;
               300ms, ease-out
            3. Watch: recording plays (real length; Passwords about 60s); task label + real figures sit under the
               bell; pause, scrub, close, full-screen controls
            4. Again: on end (or close), the picture fades (160ms), the medusa folds back to a polyp (1.4s,
               the reversal), holds, re-blooms slightly (the immortality), returns to rest
INPUT:      the task row; native video controls; Esc closes; Space plays or pauses; arrow keys move between tasks
FALLBACK:   no WebGL: the recording plays in a plain rounded frame in the same position; same controls
MOBILE:     the creature + lens move to the top 45% of the screen; the recording plays in the lens at the
            small file (`-sm.mp4`); full-screen button is primary; the form stays below
REDUCED:    no bloom or reversal motion; the lens appears with a 200ms crossfade; the polyp/medusa swap is instant
FIRST 3s:   the polyp at rest, its mark glowing; "Never do it again."; the email field; the four tasks.
            Nothing moves except the polyp's slow breathing pulse.
```

**Implementation note.** The recording is a real `<video>` element, for accessibility, captions and controls. It sits in the DOM, masked to the bell's on-screen silhouette (an ellipse tracked from the scene each frame). The WebGL bell draws its rim, glass edge and glow around it. The creature never covers the video, and the video never covers the copy.

**Everything else stays quieter than this.** The email keystroke light is demoted to small feedback (a faint point of light; no growth spectacle). The hover on a task is a hint, not a show.

---

## 5. Design system (enforced, measured)

Carries over from `ART-DIRECTION.md` §2 unless noted.

### Register
**Quiet luxury.** A few elements, a lot of dark water, one accent, flawless type, and one image: the creature with its lens.

### Type: Miranda Sans only, four roles
| Role | Use | Size | Weight · tracking · leading |
|---|---|---|---|
| Display | headline only | edge-to-edge desktop (~12vw, height-capped); two lines on phones | 500 · -0.04em · 0.86 |
| Lead | sub, recording title | 20px | 400 · -0.01em · 1.45 |
| Body | field, buttons, task row | 16px | 400–500 · 0 · 1.4 |
| Meta | helper, trust, figures, the *Turritopsis* line | 13px | 400 · 0 · 1.5 (≥ 4.5:1) |

No uppercase labels, no eyebrows, no italics except the *Turritopsis* name (a species name is italic by convention).

### Colour roles (OKLCH)
| Role | Value | Job |
|---|---|---|
| Water | `#0B0111` | the ground |
| Water-2 | `oklch(17% 0.04 305)` | field, dialogs |
| Pearl ink | `oklch(95% 0.012 300)` | headline, primary text, **the action** |
| Ink-2 | `oklch(76% 0.02 300)` | lead and body secondary |
| Ink-3 | `oklch(66% 0.02 300)` | meta |
| Life (violet) | `oklch(70% 0.16 285)` | the creature's light, focus, selection, links |

Gold stays retired (user decision). Every text pair is verified by pixel measurement at worst case.

### Shape · space · grid
- **Shape:** 4px controls, 12px surfaces (dialogs, the fallback video frame). The lens is the only curve, and it is the creature's own.
- **Space:** 8px base; scale 8 / 16 / 24 / 40 / 64 / 96. Nothing off-scale.
- **Grid:** 12 columns.
  - Copy in columns 1–5.
  - The creature and lens own columns 7–12.
  - The headline is the one element that crosses the whole width (the single deliberate grid break).
  - **The creature never overlaps type** (user, 2026-11-12).

### Motion grammar
**Tokens:**
| Token | Value |
|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` (entering, UI) |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` (on-screen travel) |
| `--d-ui` | 160ms (exits, state) |
| `--d-enter` | 240ms |
| `--d-scene` | 600ms (scene) |
| reversal | 1.4s (the only long one; it is the concept) |

**Inventory** (every movement on the page has a row; anything not listed does not move):
| Movement | Trigger | Frequency | Purpose | Allowed |
|---|---|---|---|---|
| Light comes up, camera settles | load | once | orientation | ≤ 2s, skippable, never blocks the field |
| Polyp breathing pulse | always | ambient | life | slow (~5s), small |
| Hover hint toward a task | hover | occasional | affordance | 240ms, ≤ 2% travel |
| Bloom → lens | choose a task | rare | the signature | as specified in §4 |
| Reversal → re-bloom | recording ends | rare | the concept (immortality) | as specified in §4 |
| Keystroke light | typing | frequent | feedback | tiny, no pulse, no growth |
| Button press | press | frequent | feedback | `scale(0.97)`, 120ms |
| Field focus ring | focus | frequent | state | instant |
| Error | invalid submit | rare | feedback | one contraction, plus inline message |
| Success | submit | once | celebration | one slow stroke + glow; "You're in." |
| Headline swap | joined / answer given | rare | state | dissolve 950ms |

**Never:** responses to bare clicks on the water, cursor-following, text that moves while it's read, confetti.

### Consistency surfaces (jurors click through)
These must be rebuilt in this language, not left in the old one:
- the recordings dialog (folds into beat 3);
- the invite sheet;
- the 404 page (done);
- the error, offline and duplicate-email states;
- the favicon (done);
- the OG image (to make: a frame of the lens mid-recording, 1200×630).

---

## 6. Conversion plan

### Who arrives and what they need
- **Who:** visitors from X who have already seen a demo clip. They don't need wonder.
- **What they need, in order:**
  1. **Proof:** it works on a real Mac.
  2. **Clarity:** what Alma is, within 3 seconds.
  3. **Low friction:** one field.

### First screen copy (proposed; confirm with Alma)
- **Headline:** *Never do it again.*
- **Sub (the mechanism, immediately):** *Alma operates your Mac for you. Any app, while you watch.*
- **Task row:** *Watch it do one:* Fix my weak passwords · Build a rocket in Blender · Trade options by voice · Alma vs ChatGPT
- **Form:**
  - field label *Email*;
  - pearl button *Get early access*;
  - helper *Mac app in private testing. Invites go out in waves.* (on Windows: *Alma runs on Mac. Join now and open your invite there.*).
- **Proof line** (footer left): *Backed by Peak XV. Built by founding engineers of Sarvam AI and ex‑Microsoft Research.*
- **The species line**, near the creature: *Turritopsis dohrnii never dies. It starts again.*

### The three objections, answered at the field
| Objection | Answer |
|---|---|
| What is it? | the sub |
| Does it work? | the Window (one click away, beside the form) |
| Can I trust it? | the proof line, plus Zerodha's "waits for your confirmation" figure in the task row |

### Friction rules
- One field, no other required input.
- No modal before signup.
- The form never moves while a recording plays.
- Errors are inline and name the fix.
- Offline input is kept.

### After signup (beat 5), in order
1. "You're in."
2. **"What should it never let you do again?"**: the chore row (*Rename 200 screenshots · Copy invoices into a spreadsheet · Reset that password again · Name your own*). The pick is eaten and becomes the first-task answer (the qualification).
3. **Invite link + Share on X.** The position and referral credit stay labelled *mock* until the backend exists.

### Measurement
The events already exist in `src/lib/analytics.ts`. Before launch, add:
- **Funnel:** page view → task watched (which, % watched) → field focus → submit → success → first-task answered → share.
- **A/B test 1:** promise-led headline vs mechanism-led headline.
- **A/B test 2:** autoplay invitation on vs off.
- **A/B test 3:** four tasks vs two.
- **Decision rule:** keep whatever raises the *success* rate without lowering *first-task answered* (lead quality).

---

## 7. Quality bar (jury rubric targets)

| Criterion | What earns it here | Target |
|---|---|---|
| Design 40% | The system above, measured; every state designed; consistency surfaces rebuilt | ≥ 7 |
| Usability 30% | The email field usable before WebGL; LCP < 1.5s, CLS < 0.05, INP < 100ms, 60fps under 4× CPU throttle (**measured**); keyboard and reduced motion complete | ≥ 7 |
| Creativity 20% | One concept, one signature moment, an idea nobody else can claim (the immortal window) | ≥ 7.5 |
| Content 10% | Real recordings, real figures, real copy; no invented claims | ≥ 7 |

**Measurement needs tooling.** Installing `playwright-cli` (plus a headless Chromium, ~150 MB) is a prerequisite for the build's review phase, not optional.

---

## 8. Assets and dependencies

| Need | Status | Owner |
|---|---|---|
| The six recordings + posters + small variants | On alma.inc; **blocked on the campus network**. Copy them into `public/media/demos/` and set `PUBLIC_ASSET_BASE=""`, or work on a hotspot | user |
| Captions for the voice demos (Paint, Zerodha) | Not available; needed for accessibility | Alma |
| Alma logomark SVG (for the lobes and favicon) | Stand-in drawing in use | Alma |
| Approval of the new sub, the species line and dropping gold | Pending | Alma |
| Real waitlist count / referral backend | Mocked and labelled | Alma |
| Creature craft | Code-built, anatomically corrected (v4). The lens makes the realism the video's job | — |

---

## 9. Build order (user checkpoints marked ✋)

1. **Assets.** Recordings available locally; deep links verified.
2. **The Window, desktop:** bloom → lens → watch → reversal → re-bloom, with the DOM video masked to the bell. ✋ *Look approval: a screen recording of the full loop.*
3. **Mobile and reduced-motion versions** of the Window. ✋
4. **First-screen copy and task row** (real recordings); chore row moved to beat 5; invite sheet rebuilt in the system.
5. **Intro** (light up, settle, ≤ 2s) and **sound** (opt-in bed + one tone on bloom).
6. **Consistency sweep:** error, offline and duplicate states; OG image; inner surfaces.
7. **Measured review:**
   - Playwright/Lighthouse: performance, a11y, 320–1920px, 200% zoom, reduced motion;
   - `awwwards-jury` self-score;
   - `break-ui` worst-case pass;
   - impeccable critique;
   - the user runs `/review-animations`.

   ✋
8. **DESIGN.md, handover, then the pitch deck**, built from real screenshots and the loop recording.

---

## 10. Carried from v4 / cut

**Kept:**
- type-in-water as the headline layer (static, with the dissolve on change);
- the corrected creature anatomy;
- tokens, contrast and corner system;
- the waitlist and all its states;
- analytics;
- the 404 page and favicon;
- the motion-audit removals (no click response, no cursor-following, no moving type).

**Changed:**
- the signature moment moves from "the email grows the creature" to "the Window";
- keystroke light demoted to feedback;
- the first-screen task row becomes the real recordings;
- the invented chores move to after signup.

**Cut:**
- the separate recordings dialog (it becomes beat 3);
- the ephyra eating chores on the first screen (eating stays only for the post-signup answer).

---

## 11. Decisions (user, 2026-11-12)

1. **Sub line:** mechanism-led: *Alma operates your Mac for you. Any app, while you watch.* (A/B later.)
2. **Autoplay invitation:** on. Muted Passwords in the lens after 4s idle, desktop only.
3. **Task count:** the fewest clicks for users. The first screen offers **two** tasks (Passwords, Alma vs ChatGPT), and the autoplay means proof arrives with zero clicks. The other recordings sit behind "More" inside the Window.
4. **Species line:** **cut.** The immortal-jellyfish connection stays an internal design rationale (and pitch-deck material); the page doesn't name the animal. The reversal → re-bloom still plays.
5. **Recordings:** downloaded from alma.inc on a hotspot into `public/media/demos/` (git-ignored), with `PUBLIC_ASSET_BASE=""` in `.env`.
