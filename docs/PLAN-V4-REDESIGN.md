# Alma redesign: plan (v4)

Status: **plan only, nothing built yet.** It supersedes the "next steps" in `HANDOVER.md` and the build order in `PLAN-V3-ONE-LIFE.md`. Product truth stays in `PRODUCT.md`.

---

## 1. Why the last round still looked the same

The user's verdict: "it still looks kinda the same old same old." That's correct.

- **The world never changed.** Every version (v1 through the "type in the water" round) shared the same base:
  - purple haze water with the same violet jellyfish render;
  - faded floating chore text;
  - header, footer and a sound toggle in the corners;
  - a big headline, a sub and the email form stacked bottom-left.

  Only the typography changed, so it was polish on the old look, not a redesign.
- **No direction round ran.** impeccable's new-work flow requires generating and choosing *different worlds* before code (concept roll, then a pick, then comps). I skipped that because the One Life concept was pinned. A pinned concept (the jellyfish life cycle) is not a pinned look.
- **The effort went into mechanics.** Stage by stage, the work added features (growth, eating chores, the type layer) to a composition nobody had approved as beautiful.
- **No picture of the target existed.** Without a comp or a sketch to approve, every review round measured the build against itself.

**Lesson:** decide the look first, show it, get a yes, and only then build mechanics inside it.

---

## 2. What does not change (guardrails)

| Area | Commitment |
|---|---|
| Conversion | An email field visible and usable from the first frame, before WebGL loads. One primary action. Mock data labelled as mock. |
| Brand | Plum-black base `#0B0111`, violet bioluminescence for the creature, gold `#F3CF8A` only on actions, Miranda Sans (now self-hosted, OFL). The jellyfish is the main motif. |
| Format | One screen, no scroll, at desktop sizes (including the user's 1341×633) and on phones (390×844, 360×640). |
| Truth | No invented numbers, policies, customers or launch dates. The trust line stays as verified. |
| Access | WCAG 2.2 AA, a reduced-motion version, a no-WebGL fallback, real HTML for all meaning. |
| Performance | Under 4ms per frame at the high tier on an integrated GPU; automatic drop to the low tier. |

What *can* change: composition, camera, rendering style of the creature, type system, which mechanics survive, and copy layout. Everything visual is open.

---

## 3. Reference teardown (step 0, about half a day)

The client named four Awwwards sites. Before choosing, write down concretely what makes each one award-level, so the bar is specific rather than a vibe.

| Reference | What to study |
|---|---|
| Lusion v3 | Loading intro as a show, physical 3D with custom post-processing, cursor-reactive scene, minimal UI floating over it. |
| Igloo Inc | One continuous world, camera choreography (the camera moves, not the page), ice/glass materials, sound design, an intro sequence. |
| The Sea We Breathe | Underwater mood with real art direction: colour grading, light shafts, particulate, slow cinematic pacing. Closest subject to ours. |
| Lando Norris | Bold typographic system with a strong personality, video/3D integration, hover states that feel tactile. |

**Output:** a one-page "bar" doc (`docs/REFERENCE-BAR.md`) with 6–8 specific techniques we commit to, for example an intro sequence, a moving camera, cinematic grading, a custom cursor/hover language, transitions between states, and sound.

**Network:** the college Sophos firewall blocks igloo.inc. Use a hotspot to view the live sites.

---

## 4. Three candidate directions

All three keep the guardrails. They differ in **world**, not in styling.

### A. Macro: a film still
- **World:** the camera is *inside* the water, a few centimetres from the jellyfish. The bell fills 120% of the frame, cropped, with heavy depth of field, bokeh, light shafts and a slow drifting camera. It's photographic and cinematic, not illustrative.
- **First viewport:** almost no chrome. One line, "Never do it again.", sits at the bottom left like a film subtitle, with an inline email pill beside it. The wordmark is small, top left, and "Watch it work" is small, top right.
- **Signature interaction:**
  - The camera breathes with the cursor.
  - Focusing the email pulls focus (the background blurs, the bell sharpens).
  - Each keystroke is a gold spark rising into the bell.
  - Submit makes the camera pull back to reveal the colony.
- **Chores:** they appear as subtitles that cross-fade under the headline ("Rename 200 screenshots." … "Never again."). Clicking a subtitle hands that chore over.
- **Conversion:** strong, because the screen has very little else on it.
- **Risk:** it lives or dies on render quality. The current creature is not photographic, so it needs real shader work (subsurface look, depth of field, better tentacles).
- **Effort:** high on the scene, low on the UI.
- **Closest reference:** The Sea We Breathe / Igloo.

### B. Specimen plate: a scientific print
- **World:**
  - A dark natural-history plate.
  - The jellyfish is drawn in fine luminous linework (generated line rendering of the 3D model, or SDF strokes), not as a glowing blob.
  - A precise grid, hairline rules and annotation leaders name its parts as Alma's abilities: *listens* (bell), *reaches* (oral arms), *stops when told* (tentacles), *learns your chores* (gut).
- **First viewport:** a two-column plate. The headline and form on the left read as the plate's catalogue entry; the specimen is on the right, with annotations that animate in.
- **Signature interaction:**
  - Hovering an annotation lights that part of the creature.
  - Typing the email "draws" the creature stroke by stroke (growth becomes drawing).
  - Submit stamps the plate with your entry number ("mock" until the backend is real).
- **Chores:** catalogued as specimen labels you can pick.
- **Conversion:** clear. It's a classic reading order, and the annotations also explain the product, answering "why Alma?".
- **Risk:** editorial looks can feel cold, and it moves away from "bioluminescent wonder".
- **Effort:** medium. The line rendering is new; the layout is straightforward.
- **Closest reference:** none of the four. That's distinctive, but further from the client's named taste.

### C. The creature is the interface
- **World:** no hero layout at all. You look up at the jellyfish from below, centred and huge, and the UI lives inside it.
- **First viewport:** the bell is the frame. "Never do it again." and the email field sit *inside* the bell as its glowing core, and the gold button is its heart. Tentacles hang down holding chore tags.
- **Signature interaction:**
  - Pull a tentacle tag (drag or click) and the bell digests that chore, swapping the headline.
  - Typing makes the bell glow brighter from within.
  - Submit sends a pulse and the creature swims up out of frame, leaving "You're in." in its wake.
- **Conversion:** the form is literally the centre of attention. The risk is legibility over a moving, glowing body, so it needs a calm inner zone.
- **Risk:** the most radical option, with the most room to look gimmicky. Accessibility needs care because of the moving background behind text.
- **Effort:** medium-high.
- **Closest reference:** Lusion's playful physicality.

**My recommendation: A (Macro).** It matches the client's references, it's the subject's natural cinematic home, and it cuts UI to the minimum, which helps conversion. The work concentrates where the page is weakest today: render quality and art direction.

---

## 5. Process: three gates with user decisions

```
0 Reference bar  ->  1 Direction pick  ->  2 Look approval  ->  3 Build  ->  4 Review  ->  5 Finish
   (doc)              (USER decides)        (USER approves)
```

1. **Direction pick (user).**
   - Run impeccable's `concept-seed` properly this time. It may deal a challenger direction alongside A, B and C, which keeps us honest.
   - Present them on impeccable's decision page as cards (no image credits needed).
   - **The user picks one.**
2. **Look approval (user).** Two ways to see the look before the full build:
   - **(a) One Figma comp** of the chosen direction's first viewport. This costs Figma AI credits: one image on the cheapest model. Your plan is a free Starter team with a View seat, so generation may not even be allowed; the first attempt will tell us.
   - **(b) A code sketch, with no credits:** a throwaway, first-viewport-only prototype (about 2–4 hours), real WebGL but rough, shown as screenshots plus a short GIF.
   - **The user approves, adjusts or rejects the look.** No full build starts without this yes.
3. **Build** inside the approved look:
   - Rebuild the scene to the new art direction first (camera, materials, grade, intro), then the UI in that world, then mechanics.
   - **Mechanics are triaged, not carried over by default** (see §6).
4. **Review:**
   - impeccable critique (dual agent) against the approved look and the reference bar;
   - break-ui;
   - mobile-native;
   - an a11y pass;
   - performance bench;
   - the user runs `/review-animations`.
   - At most two fix rounds; then the user decides "ship as is" or "fund another round".
5. **Finish:** DESIGN.md (documenter), handover update, then the pitch deck (frontend-slides) built from the final screenshots.

---

## 6. What happens to the existing work

**Reuse (infrastructure that works):**
- the waitlist store, UI and every state, `api.ts` (mock/live), analytics;
- the invite sheet logic;
- the recordings dialog and Player;
- self-hosted Miranda Sans and the tokens;
- the Three.js boot, tiering, bench and reduced-motion/no-WebGL fallbacks;
- the keystroke-to-creature hookup (`grow.ts`);
- the glyph sampler (`dissolve.ts`);
- the type-in-water renderer, *if* the chosen direction uses painted type.

**Triage each mechanic against the chosen direction. Keep only what serves the look:**

| Mechanic | A Macro | B Specimen | C Creature-UI |
|---|---|---|---|
| Email grows / lights the creature | keep (focus pull + sparks) | keep (draws the specimen) | keep (inner glow) |
| Eat a chore | keep (subtitle hand-over) | keep (pick a label) | keep (pull a tentacle) |
| Ephyra budding | maybe (as the hand-over) | cut | maybe |
| Colony after signup | keep (camera pull-back reveal) | becomes the plate stamp | keep (swim-away) |
| Hold to stop | cut, or a single line | an annotation ("stops when told") | maybe |
| Sunken desktop slabs | cut | cut | cut |
| Drifting chore text | cut (becomes subtitles) | cut (becomes labels) | cut (becomes tags) |

**Snapshot first.** Before the rebuild, copy the current build to `archive/v3-type-in-water/`, or initialise git (the folder isn't a repo yet; recommended), so nothing is lost and the client can compare versions.

---

## 7. Decisions needed from the user

1. **Direction:** A, B, C, or the impeccable roll, to choose on the decision page. My recommendation is A.
2. **Look approval method:** one Figma comp (credits), or a code sketch (no credits).
3. **Git:** may I `git init` the project and commit the current state as a baseline?
4. **Mechanics:** OK to cut the ones the chosen direction doesn't need (per §6)?
5. **Sound:** the references all use it. Opt-in ambient sound is in PRODUCT.md. Should the redesign include an authored soundscape, or should sound stay out?

---

## 8. Risks

- **Render quality (A and C):** photographic underwater looks are hard in real-time WebGL on integrated GPUs. Mitigation: the code-sketch gate proves the look before the full build. Bake what can be baked (pre-rendered light, textures).
- **Memory:** the machine has 13.9 GB under pressure. One WebGL tab only, and stop servers after each check (see HANDOVER).
- **Throttled captures:** the Chrome window gets occluded, so take 2–3 screenshots before judging motion or placement.
- **Firewall:** reference sites and alma.inc assets are blocked on campus, so use a hotspot.
- **Credits:** comps cost Figma credits. Always ask before generating.

---

## 9. Rough effort

| Step | Estimate |
|---|---|
| 0 Reference bar | ~0.5 day |
| 1 Direction round | ~1–2 h of work, plus the user's pick |
| 2 Code sketch (or comp) | ~2–4 h (or one comp + adjustments) |
| 3 Build | A: ~2–3 days · B: ~1.5–2 days · C: ~2 days |
| 4 Review + fixes | ~1 day |
| 5 Finish + deck | ~0.5–1 day |
