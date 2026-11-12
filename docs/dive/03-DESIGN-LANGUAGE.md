# 03 · Design language

See `00-INDEX.md` for tags. Exact values live in `04-DESIGN-SYSTEM.md`; this file is the meaning behind them.

## 1. Concept

> **This page is about handing a chore to something that never tires, and it feels like a slow dive because you follow one jellyfish from the lit surface down into the dark, where it folds back and begins again.**

[DECIDED, format from JURY 02]

- **Test without animation:** three stills (a creature under bright water with "Never do it again."; the same creature in indigo mid-water with how it works; the creature as the only light in the dark with who built it) tell the idea. It passes.
- **The inside idea** [USER: never named on the page]: *Turritopsis dohrnii* reverts to a polyp and starts again instead of dying. Alma does the chore again and again so you never do. The page shows this once, at the bottom, as the creature folding back and blooming. No species name, no caption explaining it.
- **One trait only.** Not "it becomes any cell", not "colonies as waitlist". The distant kin in the deep are atmosphere, not a second metaphor.

## 2. Register

**Spatial world, journey spine** [JURY 02 registers and narrative structures]: a navigable scene; scroll moves through space; the DOM is an overlay.

Restraint is the house rule inside that register, not a second register: few elements, a lot of water, one accent, exact type. *(Mixing registers is the most common cause of "competent but bland" [JURY 02].)*

## 3. The concept answers each axis [JURY 02 table]

| Axis | Answer |
|---|---|
| Structure | A linear journey down, with a return |
| Pacing | Slow, with air. Three rests and two travels. Text only at rests. |
| Type | Humanist grotesk (Miranda Sans), quiet, set like film titles: small against the image, exact |
| Colour | Water (the ground), pearl (ink and the one action), violet (the creature's life). Each has one job (§5). |
| Imagery | Generative: the water and the creature, drawn in real time. No photography, no illustration, no screenshots on the page. |
| Motion | Cinematic and liquid: slow camera, weight and follow-through in the creature, nothing bouncy, nothing mechanical |
| Sound | Absent [JURY 02 default]. Recordings carry their own audio in the theatre, opt-in. |
| Signature | The dive |

## 4. Light (the main material)

The mood change the user asked for is a change of **light**, not of hue.

- **One light source: the surface, above.** Everything is lit from it. No neon, no glow that has no source.
- **Surface:** bright rippling ceiling in the upper part of the frame, light shafts falling, soft caustics moving over the creature's bell. The water is blue-violet where the light is and falls to dark toward the bottom of the frame.
- **Mid-water:** the surface is a memory above; shafts thin and fade; the water is indigo. The creature is lit from above and dim below.
- **The deep:** no surface light at all. The creature's own violet glow is the only light source, and it lights the water around it. This is where violet earns its meaning.
- **Darkness is a colour here.** The deep is near-black plum, not grey; the surface is never white.
- **Grade:** a soft vignette and a deep black point; grain low enough never to read as speckle; no chromatic fringe.

## 5. Colour meaning

| Colour | Its one job | Never |
|---|---|---|
| **Water** (blue-violet at the surface to plum-black in the deep) | The ground; tells you how deep you are | A flat fill; a CSS-gradient look |
| **Pearl** | Ink, and the one action (the button) | Decoration |
| **Violet** | The creature's life: its inner mark, its glow, focus rings, selection | Buttons, borders, headlines, backgrounds |
| **Danger** | An error on the form | Anything else |

Gold is retired [USER]. One accent only [JURY 04]. Neutrals are tinted toward plum, never pure grey, black or white [JURY 04].

## 6. Composition

- **Full-bleed.** The scene owns the whole viewport at every depth. Nothing is boxed.
- **The creature is large:** about 60% of the screen height at the Surface [TARGET], cropped by nothing, with room for its tentacles.
- **Asymmetric, and it alternates** so the page never settles into "copy left, visual right":
  - Surface: creature right of centre, high. Text low on the left.
  - Mid-water: creature left of centre. Text on the right.
  - The deep: creature centred, smaller and further away. Text centred beneath, low.
  - Again: creature centred; one line.
- **The creature never overlaps the copy** [USER]. At rests the two have separate regions; during travel there is no text on screen.
- **A strong left edge** for the wordmark, the Surface text and the dock [JURY 04: asymmetry, a strong left edge].
- **One deliberate grid break:** the creature itself crosses every column. Nothing else does [JURY 04: break the grid once or twice, deliberately].
- **Corners of the frame are quiet:** wordmark top-left; depth line on the right edge; dock at the bottom. No other chrome.

## 7. How the creature is used (its "potential")

It is the guide and the light meter of the page:

1. **It leads.** On each descent it swims ahead and the camera follows; you arrive where it has stopped.
2. **It shows the depth.** Lit pearl by the surface up top; its own violet glow at the bottom.
3. **It carries the idea.** At the end it folds back to a polyp and blooms again.
4. **It answers the visitor.** One stroke when they join; a startle on an error. Nothing on ordinary clicks, hovers or keystrokes.

Scale, crop and position change by depth; its anatomy does not. It is one animal the whole way down.

## 8. Motion character

- **Slow and weighted.** The camera eases; the creature has mass; tentacles follow through.
- **Swim = pulse.** Travel comes from strokes of the bell, not from sliding the model.
- **Text does not perform.** Lines rise a short distance through a mask and fade as a group at each rest, then leave as a group. No character animation, no scramble.
- **Scroll-scrubbed values are linear to the smoothed progress**; discrete UI motion uses the token curves [JURY 05: never linear except loops and scrubbed values].
- **Nothing reacts to bare clicks on the water, to hover, or to the cursor** [USER, motion audit 2026-11-12].
- Full inventory: `04-DESIGN-SYSTEM.md` §6.

## 9. Typography character

- One family, two weights (400, 500) [PRODUCT brand].
- **Display is confident, not enormous.** It is a title over a film frame, not a poster band.
- Tight tracking and leading at display size; open, readable body [JURY 03].
- No uppercase labels, no eyebrows, no italics, no mono.
- Text sits only where measured contrast holds; otherwise it gets a scrim, not a brighter colour [JURY 03, 04].

## 10. Voice

Plain, confident, a little dry [PRODUCT brand voice]. Short sentences. Say what it does, not how exciting it is. No "revolutionary", no "AI-powered", no exclamation marks. Numbers only when they are in `PRODUCT.md`.

## 11. What the recordings are in this language

Evidence, not imagery. They live in the theatre: black surround, the frame uncropped at its real proportions, its real figures beside it, controls in the system's own language. On the page itself they appear only as the words "Watch it work".
