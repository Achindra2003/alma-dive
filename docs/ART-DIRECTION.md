# Alma: concept and art direction (phases 0–2)

Method: the Awwwards skills the user supplied (SandroHub013 `awwwards` phases 0–2, tponscr `awwwards` decision framework, ga14ctic brief), checked against impeccable's craft floor. **No code is written until §5 is confirmed.**

---

## 0. Concept

> **This page is the life of one immortal jellyfish. You hand it the chores you're done with, and because it never dies, you never do them again.**

**Test without animation:** a still frame still reads. A single creature in dark water, "Never do it again.", and an email field: the idea survives as a poster.

**Why *Turritopsis dohrnii*, and how that becomes Alma:**

| What the animal does | What it means for Alma | Where it appears on the page |
|---|---|---|
| When it's old or hurt, it doesn't die: it turns back into a polyp and grows up again. | It never tires of a chore, and it's never "done". | The headline promise: *Never do it again.* |
| Its cells turn into whatever cell type it needs (transdifferentiation). | It drives whichever app the task needs, unmodified. | The sub line: *It clicks, types and navigates your Mac for you.* |
| It returns to an earlier stage when it's threatened. | You can stop it any time, and it picks up where it left off. | Hold-to-stop (one line, beat 5) |
| Polyps bud into colonies. | The waitlist: early people, side by side. | After signup: your polyp joins the colony |

## 1. Register and axes

**Register: quiet luxury.** A few elements, a lot of dark water, one accent, flawless type. The creature is the only image. This rules out drifting text, glass slabs, bokeh dust and decorative glow. Risk: emptiness without craft reads as unfinished, so every remaining detail must be exact.

| Axis | Decision |
|---|---|
| Structure | One screen. A tool you play (the form grows the creature), not a stack of sections. |
| Pacing | Slow, with air. Five beats (below). |
| Type | One family, Miranda Sans (Alma's own). The display is edge-to-edge, set once; everything else stays small and quiet. No uppercase labels, no eyebrows. |
| Colour | Plum-black water, pearl ink, and one accent with one meaning (§2). |
| Imagery | One creature, no other image. |
| Motion | Liquid and slow for the creature; crisp and fast for the UI (enter 240ms, exit 160ms, strong ease-out). |
| Sound | Opt-in only, off by default. |
| Signature moment | Typing your email grows the polyp into a medusa that rises behind the headline (§3). |

**Beats (5):**
1. **Arrive.** Light comes up and a polyp rests on the sea floor below the headline.
2. **Hand over.** Pick or name a chore. A bud lifts off, takes it, and the headline rewrites to "‹chore›. Never again."
3. **Sign.** Each keystroke is a point of light into the polyp, which grows and rises (the signature).
4. **Joined.** It blooms, buds your polyp into a colony far behind it, and shows "You're in."
5. **Control (optional).** Hold to stop: it folds back to a polyp, and on release it picks up again.

## 2. The system (tokens)

**Colour roles.** Authored in OKLCH, with neutrals tinted toward plum. Each value has one job.

| Role | Value | Job |
|---|---|---|
| `--water` | `oklch(12% 0.035 315)` ≈ `#0B0111` (brand) | The ground. Nothing else is this dark. |
| `--water-2` | `oklch(17% 0.04 305)` | Raised surfaces: the field and dialogs. |
| `--ink` | `oklch(95% 0.012 300)` (pearl) | The headline and primary text. Never pure white. |
| `--ink-2` | `oklch(76% 0.02 300)` | Sub and secondary text, at ≥ 4.5:1 on `--water`. |
| `--ink-3` | `oklch(64% 0.02 300)` | Meta text and the trust line, at ≥ 4.5:1 on `--water`. |
| `--line` | `oklch(95% 0.012 300 / 0.14)` | Hairlines and the field border. |
| `--life` (the accent) | `oklch(70% 0.16 285)` (Alma violet) | **Life:** the creature's light, the keystroke light, focus, and links. One meaning only. |
| **Action** | the decision is in §5 | The one button. |

The gold `#F3CF8A` comes from alma.inc's current CSS. On this page it reads as a second world, which the user flagged ("the gold feels out of place"). Two accents need a written reason, and there isn't one here.

**Type scale** (Miranda Sans):

| Role | Size | Weight · tracking |
|---|---|---|
| Display | edge-to-edge (fluid) | 500 · -0.04em |
| Lead | 20px | 400 |
| Body | 16px | 400 |
| Meta | 13px | 400 (never below 4.5:1) |

**Space:** an 8px base, with the scale 8 / 16 / 24 / 40 / 64 / 96.

**Shape** (the decision is in §5): one radius for controls and one for surfaces, at most.

**Grid:**
- 12 columns, with a gutter of `clamp(20px, 3.6vw, 56px)`.
- The headline locks to both margins, and the copy sits in columns 1–5.
- The creature owns columns 7–12.
- There is exactly one deliberate break: the grown bell crosses behind "it again.".

## 3. Signature moment (specified)

| | |
|---|---|
| **Trigger** | Characters typed into the email field. |
| **Phases** | Each character sends a point of `--life` light from the caret to the bell (600ms ease-in-out arc). On arrival the bell takes a small gulp and grows one step, by a spring (k 120, ζ 0.7). When the address is valid, it is fully grown and sits behind "it again.". |
| **Fallback** (no WebGL) | The page still works as a poster: headline, field and button. |
| **Reduced motion** | No light points; the size steps instantly. |
| **Mobile** | Same mechanic. The creature sits above the headline in the top band. |

Everything else stays quieter than this.

## 4. What gets cut

Cut because the register forbids it:
- the floating chore text and the "Name your own" drifter (chores become a single quiet row of choices under the sub);
- the sunken glass slabs;
- the bokeh and dust discs;
- the frosted-glass pill;
- the corner sound label (it becomes an icon with an accessible name).

## 5. Decisions the user confirms before any build

1. **Action colour:**
   - **(a) Pearl:** an `--ink` button with water-coloured text. The brightest thing on screen is the action. *(recommended)*
   - **(b) Violet:** `--life`. One accent overall, but then the button shares the creature's meaning.
   - **(c) Keep the gold,** used smaller.
2. **Corners:**
   - **(a) 4px controls / 12px surfaces:** precise, quiet. *(recommended)*
   - **(b) 0px:** sharp, editorial, harder.
   - **(c) Pills, kept.**
3. **The creature asset:** the code-built creature as it is, a licensed 3D model, or real footage. This decides the ceiling of beat 3.
