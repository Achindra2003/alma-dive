# Alma "One Life": spec (v3)

Supersedes the copy-only variants at `/v/a`, `/v/b`, `/v/c` and the single-state "Bioluminescence" page as the direction. The scene code, waitlist states, invite sheet, tokens and PRODUCT.md all carry over. Read `HANDOVER.md` first.

## Thesis
One screen. The life cycle of the immortal jellyfish (*Turritopsis dohrnii*) is the page's spine. The visitor moves it from polyp to medusa to a budded polyp of their own, and each stage carries one idea from the brainstorm. **Only one stage animates at a time.**

Mapping (from the user's brainstorm, all six combined):

| Stage | Concept it carries | Gap it closes |
|---|---|---|
| 1 Arrive | Remaster of their desktop idea + life cycle | Recognition (it's Alma), first wow |
| 2 Hand it over | "Never do it again" (kinetic type) | Imagination gap: what would I use it for? |
| 3 Stay in control | Reversal (hold to stop) | Trust gap: is it safe on my Mac? |
| 4 Sign | The form is the creature | Conversion: finishing the field finishes the animal |
| 5 Bud | Colony | Referral: your polyp joins the colony; share to grow it |

**Non-negotiable conversion guardrail:** the email field is visible and usable from the first frame, before WebGL loads. Stages 2 and 3 are optional enhancements, never gates.

## Storyboard (desktop; mobile notes below)

### Stage 1: Arrive (0–1.6s, then idle)
- **Scene:** Alma's Mac desktop, *submerged*. The menubar strip, two or three window silhouettes and a few icon shapes are faint glass planes deep in the water, with caustic light falling across them. No literal macOS chrome (no traffic lights, no Apple blue); it's an echo of their old site, not a costume.
- **Drifting chores:** 5–7 faded type objects drift slowly (Miranda Sans 500, large, low contrast). Examples: "Rename 200 screenshots", "Copy invoices into a spreadsheet", "Reset that password again", "Fill the same form every Monday", "Clean up Downloads". Each one is also a real button, so the drift is decorative but the action is semantic.
- **Creature:** a small polyp resting on the desktop. This is the `polyp` state already in `scene.ts`.
- **DOM:**
  - Wordmark top-left, "Watch it work" top-right.
  - Headline "Never do it again." in the bottom-left copy column.
  - Sub: "Tell Alma the chore you’re tired of. It clicks, types and navigates your Mac for you."
  - The email field with the gold "Get early access" button.
  - Trust line.
  - Sound toggle bottom-right.
- **Motion:** the existing descent (camera sinks, light fades up, 1600ms). Type masks rise with a 60ms stagger.

### Stage 2: Hand it over (on chore tap or typed chore)
- Optional input above the email: "Or tell Alma a chore you’re done with" (a small text field), or tap a drifting chore.
- **Motion** (motion-design narrative, about 1.8s; "Calm/Elegance" emotion, Fluid material):
  1. **Anticipation** (300ms): the polyp contracts.
  2. **Action** (700ms, `--ease-in-out`): it lifts off as an **ephyra** (the 8-armed baby stage: a new small creature form) and swims to the chore.
  3. **Reaction** (400ms): the chore's letters dissolve into particles that stream into the ephyra.
  4. **Resolution** (400ms): it glows, and the headline swaps to *“<chore>.” Never again.* (kinetic mask swap: 160ms out, 280ms in).
- The chore text is stored and pre-fills the invite sheet's "first task" answer.
- **Reduced motion:** no travel. The chore fades and the headline swaps.

### Stage 3: Stay in control (appears after stage 2, or after 6s idle)
- A quiet line: "Alma works while you watch. Hold to stop it."
- **Press and hold** anywhere on the water (not on controls) or the line's button: the creature folds back toward a polyp. Use the `polyp` state plus a contraction (2s linear while held, per Emil's hold-to-confirm; release is snappy, 200ms `--ease-out`).
- **On release:** "It picks up where it left off." The creature regrows.
- **Keyboard:** the button supports Space/Enter hold. It must never block the form.

### Stage 4: Sign (the form is the creature)
- On each keystroke in the email field, a point of light leaves the caret position and arcs (600ms, `--ease-in-out`) into the creature.
- The creature grows with field progress, from ephyra/polyp size toward the full medusa:
  - progress = `clamp(len(email)/14, 0, 1)`, boosted to 1 when the email is valid;
  - growth is smooth (spring-like follow, about 0.5s).
- When the address becomes valid, the button gets one gentle gold breath (Motion Design "CTA attention", 0.97–1.03, 2500ms, once).
- Errors: a startle contraction plus the inline message (already built).

### Stage 5: Bud (on success)
- **Bloom:** gold, 1.4s. This already exists; keep the jellyfish-silhouette swarm.
- **Then:** a small polyp buds from the bell and drifts down to join a faint **colony** (10–40 small, distant jellyfish) that fades in behind the scene.
- Headline: "You’re in." Sub: "Your jellyfish joined the colony. We’ll email you when your invite is ready."
- **Invite sheet:** "Share your link to grow the colony." with copy and Share on X, plus the first-task answer pre-filled from stage 2.
- **Colony count:** must come from Alma's real waitlist number. Until the backend provides it, show **no number**, or a number labelled "mock".

## Mobile (390×844 and down to 360×640)
- One screen.
- The submerged desktop becomes a faint phone-proportioned scene.
- Chores become a horizontal chip row instead of drifting type.
- Hold-to-stop becomes a long-press on the water.
- The creature sits in the top ~45%, with copy and form below.

## Tech notes (build on what exists)
- **`scene.ts` already has:** water shader (haze, caustics, shafts), creature with ribbon tentacles, the `polyp` state and size morph, swarm, trail, bloom, cursor follow and ripples, the tier system, bench and debug flags.
- **New in the scene:**
  1. **Submerged desktop:** a few textured planes behind the creature (rounded rects with soft caustic modulation) at z ≈ −3…−6, fogged.
  2. **Ephyra form:** a flattened bell with 8 notched lappets (a separate small mesh or a shader variant of the bell).
  3. **Type dissolve:** render the chore text to a canvas texture, sample its pixels into particles (cap 1,500 desktop, 500 mobile), and stream them to a target.
  4. **Keystroke light:** a pooled particle per keystroke from a screen point to the bell.
  5. **Growth uniform:** `setGrowth(0..1)` drives size between polyp and medusa.
  6. **Colony:** instanced small bells (InstancedMesh, ≤40), fade-in.
- **New in the DOM:**
  - Drifting chore buttons (absolutely positioned, CSS transform drift; reduced motion keeps them still).
  - The optional chore input.
  - The hold control.
  - Colony copy.
- **Keep:** WaitlistForm, the waitlist store/UI, Sheets (invite), Player, the demos dialog, tokens, headline.ts, sound.ts.
- **Remove after v3 lands:** the `/v/[variant]` review routes and the `compare` switcher.

## Budgets and guardrails
- **Frames:** ≤4ms on an integrated GPU at high tier, with the automatic drop to low tier.
- **Bundle:** scene ≤220KB gzipped; page JS ≤25KB.
- **One active stage at a time** (motion-design 1/3 rule).
- **Gold** only on actions, focus, trail, bloom and keystroke light.
- **Accessibility:** WCAG AA. Every effect has a reduced-motion version and a no-WebGL fallback. Every decorative 3D thing that does something has a DOM control.
- **No fabricated claims:** colony count, place in line and referral credit stay mock-labelled until real.

## Build order (test each before the next)
1. **Stage 4** (the conversion core): growth uniform plus keystroke light.
2. **Stage 1:** submerged desktop plus drifting chores.
3. **Stage 2:** ephyra and type dissolve.
4. **Stage 5:** colony.
5. **Stage 3:** hold to stop.
6. **Review pass:**
   - impeccable: finish reviewer, detector, then DESIGN.md via the documenter;
   - refactoring-ui score;
   - web-design-guidelines;
   - mobile-native;
   - break-ui;
   - the user runs `/review-animations`.
7. **Pitch deck** with frontend-slides.
