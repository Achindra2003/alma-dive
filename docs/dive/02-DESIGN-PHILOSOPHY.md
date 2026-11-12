# 02 · Design philosophy and practices

See `00-INDEX.md` for tags.

## 1. The position

**Awwwards is a scoring system, not a style** [JURY SKILL.md]: Design 40%, Usability 30%, Creativity 20%, Content 10%. Honorable Mention needs 6.5 or more; the Developer Award needs more than 7. Two consequences govern this project:

1. Design and Creativity are 60%, but **Usability at 30% can sink the page alone**. Speed, accessibility and a form that always works are design constraints, not a QA phase.
2. **One signature moment, not twenty effects.** Ours is the dive. Everything else stays quieter than it.

And one more, from the brief: the page must **convert**. When beauty and conversion disagree, `05-CONVERSION.md` §2 decides.

## 2. Principles

1. **One idea, one image, one journey.** The concept (`03-DESIGN-LANGUAGE.md` §1) must survive with all animation removed [JURY 02]. If a still of each depth does not tell it, we have effects, not a concept.
2. **The stage is the whole screen.** The creature is not an illustration beside a layout; the water is the page and the type sits in it. *(Lesson from v6: a template with a jellyfish on it stays a template.)*
3. **Subtract first.** Every element must justify its place at its depth. At most **three levels of emphasis in one viewport** [JURY 03]. When in doubt, cut.
4. **Nothing moves without a reason:** orient, relate, or express the concept [JURY 05]. Frequent actions do not animate at all [EMIL]. Text never moves while it is being read.
5. **Proof over promise** [PRODUCT principle 1]: real recordings, real figures, real names. No invented numbers, testimonials, counts or dates [PRODUCT absences].
6. **The visitor stays in control** [PRODUCT principle 2]: native scroll, visible progress, everything stoppable, nothing trapping, sound never starts by itself.
7. **Colour has jobs, not decoration** [JURY 04]: one accent with one meaning. If a colour appears on unrelated things it means nothing.
8. **Systems, not one-offs.** Every text node maps to a type role; every space is on the scale; every radius is one of two; every motion uses the token curves [JURY 03, 04, 05]. A value that is not in `04-DESIGN-SYSTEM.md` does not ship.
9. **Honest materials.** The creature is code-drawn; we light and frame it well instead of pretending it is footage. The recordings are raw; they are shown as recordings, in a theatre, not dressed as page art.
10. **Degrade to something still good** [JURY 05]: reduced motion, no WebGL and no JavaScript each get a designed version, not a broken one.

## 3. Practices (how the work is done)

1. **Order of work:** concept → language → system → still frames → motion → states → hardening → measured review. Never start at shaders. *(Lesson from every rejected round.)*
2. **Checkpoints.** The user approves the look on **still frames** before anything moves, and judges **motion live** themselves (`01-PLAN.md` §5).
3. **Retrieve, don't recall.** Before a design decision, open the relevant file in this folder. If the answer is not there, it is [OPEN]: ask the user. Do not fill gaps from memory.
4. **Skills are loaded, not cited.** Invoke the skill and read the reference file before applying it; at each checkpoint list what was actually read. Never claim a skill from its description.
5. **Measure the basics before showing anything:** contrast of every text pair against the brightest pixel behind it; tap targets; one-screen fit at the four reference viewports; no horizontal overflow; console clean.
6. **Report what was not checked.** "Not measured" and "not tested" are stated plainly, next to what was.
7. **One change of composition per "rethink".** When the user rejects a round without specifics, ask what is wrong before building again; do not polish the rejected composition.
8. **Small, reversible commits** on the working branch, each describing what changed and why. Preview servers are stopped after use.
9. **Copy is a design material.** Every line is traceable to `PRODUCT.md`; proposed lines are marked and confirmed, not slipped in.
10. **Fresh eyes.** Review motion slowed down (`?debug=slow`) and again the next day [EMIL].

## 4. What we refuse (anti-patterns for this project)

From the rejected rounds and the skills:

- Copy on the left, visual on the right. **The template.**
- A headline as a full-width band of giant type painted in WebGL (soft, grey, ate a third of the screen).
- The creature as a small decoration in a corner.
- A screen recording as page art (blue border, webcam face, tiny UI), or hidden in an oval or behind a mechanic.
- Neon glow, purple haze, muddy gradients, visible "dust" particles, film grain that reads as speckle.
- Mechanics for their own sake: growth-on-typing, keystroke lights, click twitches, cursor-following, parting tentacles.
- Many metaphors at once. One trait of the animal, never named.
- Gold. Pills. A third radius. A second accent. Uppercase eyebrow labels. Nested cards. Glassmorphism.
- Hijacking the wheel; pinned travel with no progress signal; content that only exists after a scroll animation [JURY 07].
- Custom cursors, magnetic buttons, preloaders that block the form [declined in §6].
- Type over the image without measured contrast [JURY 03, 04].
- Claims of quality without measurement; performance numbers that were not measured.

## 5. Definition of good, per layer

| Layer | Good means |
|---|---|
| Concept | One sentence; legible in three stills; nobody else could use it |
| Image | One dominant, art-directed frame per depth; the creature large, lit, uncluttered |
| Type | Four roles, one family, measured contrast, at most three emphases per frame |
| Motion | One loop, one progress value, token curves; smooth on a mid-range laptop; reduced-motion version designed |
| Interaction | Native scroll; depth line; keyboard-complete; 44px targets; visible focus |
| Conversion | Email reachable at every depth from the first frame; Surface complete without scrolling |
| Engineering | LCP < 1.5s, CLS < 0.05, INP < 100ms, 60fps [JURY non-negotiables], measured |

## 6. The `awwwards-design` skill (modbender): what we take and leave

Checked 2026-11-12: three Markdown files, MIT, no scripts, no instructions to an agent. Installed at `.claude/skills/awwwards-design/`. It is a general technique catalogue; where it disagrees with the jury skill, with the user's decisions or with conversion, it loses.

| From the skill | Verdict | Reason |
|---|---|---|
| Intentional storytelling; progressive reveal | **Adopt** | It is the dive |
| Choreographed motion with purpose; scrubbed animation tied to scroll | **Adopt** | Matches JURY 05, 07 |
| Easing discipline, "fast in, slow out" | **Adopt in spirit** | We use our own token curves (`04` §6), not GSAP names |
| Grain at about 3% | **Adopt, lower** | Under our blend it must stay below visible speckle |
| Reduced-motion support, keyboard, contrast | **Adopt** | Already required |
| "When NOT to use: sites with conversion goals" | **Adopt as a warning** | It is why `05-CONVERSION.md` outranks spectacle |
| GSAP + ScrollTrigger + Lenis stack | **Decline** | One existing loop reads native scroll; no new dependency [EMIL] |
| Custom cursor, magnetic buttons, trails | **Decline** | [USER] removed cursor effects; decoration on frequent input [EMIL] |
| Hero text at 15–25vw | **Decline** | The rejected giant band; our display role is in `04` §1 |
| Character-by-character splits, scramble text | **Decline** | Line reveals only; text does not perform |
| Glassmorphism, animated mesh gradients | **Decline** | Against the register and the refusals above |
| Font lists and pairings | **Not applicable** | Miranda Sans is fixed [USER] |
| Loading sequence | **Decline as written** | Nothing may block the email field |
| Its thresholds ("8.5+ in all four for SOTD") and LCP < 2.5s | **Use the jury skill's instead** | HM ≥ 6.5, Developer Award > 7, LCP < 1.5s [JURY] |
