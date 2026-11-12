# The Dive: source of truth (index)

**Created:** 2026-11-12. **Status:** step 2 rebuilt to rounds 2 and 3 (`01-PLAN.md` §10, §11: they override `02` §6 on GSAP, `03` §6–8 and `05` C1 where they disagree). Steps 3–6 built (2026-11-12); motion awaits the user's live judgement (✋ 3) and the ship decision (✋ 6). Build state in §8.
**Supersedes:** every earlier plan in `docs/` (v2 to v5) and the v6 page currently in `src/`. Those stay for history only.

Read these before designing or building anything. If a file here disagrees with memory or with an older doc, **this folder wins**. If something is not written here, it is not decided: ask, don't invent.

| File | Answers |
|---|---|
| `01-PLAN.md` | What we are building, beat by beat; how; in what order; the checkpoints; risks; open decisions |
| `02-DESIGN-PHILOSOPHY.md` | Why we make the choices we make; the working practices; what we refuse to do; lessons from the rejected versions |
| `03-DESIGN-LANGUAGE.md` | The concept, the register, light, colour meaning, composition, how the creature is used, motion character, voice |
| `04-DESIGN-SYSTEM.md` | The exact tokens and components: type roles, colour roles, spacing, grid, radii, motion tokens, states, budgets |
| `05-CONVERSION.md` | What the page is for, the priority order when goals conflict, the funnel, copy, objections, measurement |

## Tags used in these files

- **[USER]** decided by the user in conversation. Binding.
- **[PRODUCT]** fact from `PRODUCT.md` (product truth, evidence on hand). Binding; never embellish.
- **[JURY]** rule from the `awwwards-jury` skill, with the reference file named.
- **[EMIL]** rule from `emil-design-eng` / `animate`.
- **[DECIDED]** decided in these documents by Claude, within the rules above. Can change with a reason, written here.
- **[TARGET]** a starting value that must be verified by measurement before it counts.
- **[OPEN]** not decided. Do not build on it; ask.

## Binding decisions carried in from earlier rounds [USER]

1. The jellyfish is the main motif. The code-built creature stays ("the jellyfish i think is fine, it's just not being used to its potential").
2. The reference feeling is **The Sea We Breathe**: cinematic underwater, slow, quiet type over the image.
3. What was wrong with v6: **generic layout**, **the recording looks bad on the page**, **mood and colour**.
4. Action colour is **pearl**. Violet means the creature's life only. **No gold.**
5. Corners: **4px controls, 12px surfaces.** Nothing else.
6. Type: **Miranda Sans** only.
7. The creature **never overlaps the copy**.
8. The immortal-jellyfish idea is **never named on the page**. It is an inside rationale.
9. **Fewest clicks** to proof. Sub line leads with the mechanism.
10. No Figma image comps for now (credits). No Playwright install yet (asked "not now" on 2026-11-11; revisit at the measured-review step).

## Skills this plan is grounded in

Read in full for these documents (2026-11-12): `awwwards-jury` SKILL.md and references 02-concept, 03-typography, 04-color-and-layout, 05-motion, 07-scroll, 17-video, 19-scroll-scrub; `emil-design-eng`; `animate`; `awwwards-design` (modbender, all three files; see `02-DESIGN-PHILOSOPHY.md` §6 for what is adopted and declined).
Still to read before the step that needs them: jury 08-webgl, 11-performance, 12-accessibility, 13-responsive, 14-anti-patterns, 15-audit, 01-scoring; `awwwards-director` references; `impeccable` typeset/colorize/critique; `shader-dev` techniques (water surface, light shafts, translucency); `motion-design`; `mobile-native`; `break-ui`; `ui-ux-pro-max` rules; `web-design-guidelines`.
