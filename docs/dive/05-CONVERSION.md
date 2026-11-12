# 05 · User conversion priority

See `00-INDEX.md` for tags. Product facts come from `PRODUCT.md`; nothing here may add to them.

## 1. What the page is for

**A qualified waitlist signup.** The email is the conversion. What the visitor wants Alma to do first is the qualifier, optional, after signup [PRODUCT: success for this page].

"Qualified" matters more than "many": the founders want people who will find "enough value and delight to pay for it" [PRODUCT: who the company actually wants].

## 2. Priority order (when goals conflict, the higher one wins)

1. **The email field works and is reachable.** From the first frame, before WebGL loads, at every depth, on every device, with JavaScript off.
2. **Clarity in three seconds.** A visitor who reads only the Surface knows what Alma is and what to do.
3. **Proof one action away.** "Watch it work" is available at the Surface and at Mid-water, and never takes the visitor away from the form for good.
4. **Trust.** Who built it and who backs it, stated plainly, with nothing unconfirmed.
5. **Qualification.** The first-chore question, after signup only.
6. **Referral.** The invite link, after signup only, labelled mock until the backend exists.
7. **The experience** (the dive, the creature, the craft).

**The dive is last on this list on purpose.** It is what makes the page memorable; it never gets to cost anything above it. If a design choice lowers 1, 2 or 3, the design choice loses.

## 3. Who arrives, and what they need

- **Who** [PRODUCT]: AI-curious Mac users from the team's posts on X, mostly on desktop, some in the X in-app browser on phones, often via deep links to one demo. They have already seen what computer use can do. In 2026 they have also seen Perplexity, Claude, OpenAI and Meta do it.
- **What they need, in order:** proof it works on a real Mac; what it is, quickly; a reason it is not a wrapper; one field.
- **Secondary** [PRODUCT]: people on Windows or phones. They cannot use Alma yet; they can join and open the invite on a Mac.

## 4. Copy by depth [OPEN: proposed; confirm with the user, then Alma]

Every claim below is traceable to `PRODUCT.md`.

| Depth | Line | Role | Source |
|---|---|---|---|
| Surface | **Never do it again.** | Display | Headline used since v3 [USER] |
| Surface | Alma operates your Mac for you. Any app, while you watch. | Lead | Mechanism-led sub [USER, 2026-11-12] |
| Surface, Mid-water | Watch it work | Link | Opens the theatre |
| Mid-water | It works in the apps you already have. You see every step, and you can stop it any time. | Lead | Positioning: unmodified apps; visible and interruptible [PRODUCT] |
| The deep | Built by founding engineers of Sarvam AI, ex‑Microsoft Research. Backed by Peak XV. | Lead | Team and confirmed investor [PRODUCT] |
| Again | **And again.** | Display | The idea, unnamed |
| Dock helper (Mac) | Mac app in private testing. Invites go out in waves. | Meta | [PRODUCT] |
| Dock helper (other) | Alma runs on Mac. Join now and open your invite there. | Meta | [PRODUCT secondary audience] |
| Button | Get early access | Body 500 | Existing |
| Joined | **You're in.** / We'll email you when your invite is ready. | Display / Lead | Existing |
| Joined | Hand it the first one: Rename 200 screenshots · Copy invoices into a spreadsheet · Reset that password again · Name your own | Body | Invented examples of the *visitor's own* chores; their answer goes to the team |

**Never on the page** [PRODUCT absences and unconfirmed items]: angel investors' names, user or waitlist counts, testimonials, press quotes, pricing, a launch date, "Apple Silicon", the species name.

## 5. The three objections, and where each is answered

| Objection | Answer | Where |
|---|---|---|
| What is it? | The sub line | Surface |
| Does it really work? | The unedited recordings, with their real figures (Blender: under two minutes, about $0.30 of inference; Passwords: about a minute; Zerodha: waits for your confirmation) [PRODUCT] | Theatre, from "Watch it work" |
| Why Alma and not the others? | The same prompt to ChatGPT's computer use and to Alma, side by side (the Krunker recording) [PRODUCT: "the most direct proof"]. It is listed first after Passwords in the theatre. | Theatre |
| Can I trust it? | Who built it; Peak XV; "you can stop it any time" | The deep; Mid-water |
| Is it for me? | The dock helper (Mac, private testing; or join now, open on a Mac) | Dock, always |

## 6. Rules

- **C1. The dock never moves and is never covered** by the creature, a line block, or a transition. Only a dialog the visitor opened may sit over it.
- **C2. The Surface is a complete page.** Headline, mechanism line, email, proof link. A visitor who never scrolls misses nothing they need. The dive rewards; it does not gate.
- **C3. One primary action.** One pearl button on the page. Everything else is text.
- **C4. One field.** Email only. No name, no role, no checkbox. No modal before signup.
- **C5. Errors are inline and name the fix.** Offline input is kept and sent on reconnect. A duplicate email is a success ("You're already on the list").
- **C6. The theatre always offers the way back:** a "Get early access" action that closes it and focuses the email field. A recording ending returns the visitor to the page, not to another video.
- **C7. Deep links** `/demos/<slug>/` open that recording in the theatre over the Surface; closing it leaves the visitor at the form.
- **C8. Nothing after signup asks for what was already given.** A chosen chore becomes the first-task answer; the invite sheet does not ask again.
- **C9. Mocks are labelled** (position in line, referral credit, first-task delivery) until Alma's backend exists [PRODUCT constraints].
- **C10. No dark patterns.** No fake scarcity, no countdown, no invented counts, no pre-ticked anything.
- **C11. Never trap.** Native scroll, visible progress, Esc closes every layer, sound never starts by itself [PRODUCT principle 2].
- **C12. The page works before it is beautiful:** form usable before the scene loads, with reduced motion, without WebGL, without JavaScript (the form posts natively to `/waitlist`).

## 7. Measurement

`track()` in `src/lib/analytics.ts` wraps Alma's PostHog and meta tracking; it must never send raw task text.

**Events that exist in the code** (checked 2026-11-12): `page_view`, `demo_select`, `demo_complete`, `demo_sound`, `demo_fullscreen`, `cta_click`, `waitlist_submit`, `waitlist_success`, `waitlist_error`, `chore_pick`, `chore_name_own`, `first_task_answer`, `invite_copy`, `invite_share_x`.

**Events to add for the dive** (they do not exist yet): `depth_reached` (surface / mid / deep / again, once each per visit), `demo_open` (which recording, from which depth), `field_focus` (first focus only), and a `depth` property on `waitlist_submit`.

**Funnel:** `page_view` → `depth_reached` → `demo_open` → `demo_complete` → `field_focus` → `waitlist_submit` → `waitlist_success` → `first_task_answer` → `invite_copy` / `invite_share_x`.

**Questions the data must answer:**
1. Do people who dive convert more or less than people who do not? (`waitlist_success` rate by deepest `depth_reached`)
2. Does watching a recording raise signups? (`waitlist_success` rate with and without `demo_open`)
3. Where do people sign up? (`depth` on `waitlist_submit`)
4. Is the lead quality holding? (`first_task_answer` ÷ `waitlist_success`)

**Tests to run before launch, one at a time:**
- A: dock at the bottom-left vs. under the Surface text.
- B: the mechanism-led sub vs. a promise-led one.
- C: "Watch it work" at the Surface vs. a short muted preview there.

**Decision rule:** keep whatever raises `waitlist_success` without lowering `first_task_answer ÷ waitlist_success`.

**Honest limit:** none of this has real visitor data behind it yet. Until it does, these are reasoned priorities, not results.

## 8. Conversion risks specific to the dive

| Risk | Guard |
|---|---|
| Visitors play with the dive and leave | C1, C2; the dock; question 1 above tells us |
| The Surface text is hard to read over bright water | `04-DESIGN-SYSTEM.md` §2 contrast rules, measured |
| Slow first load on phones in the X in-app browser | Text and form paint first; scene is progressive; budgets in `04` §9 |
| Scroll feels hijacked | Native scroll only; depth line; `01-PLAN.md` §3 |
| Proof is one click away instead of on screen | The user found the on-page recording made the page worse; test C checks whether a small preview earns its place |
