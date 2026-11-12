# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Primary:** AI-curious Mac users who reached Alma through the founders' and team's posts on X. The demos and the hiring article drew about 1.0M views. They have seen what computer use can do and are deciding whether Alma is worth a slot in their Mac.
- **Who the company actually wants:** people who will find "enough value and delight to pay for it". The founders' stated goal is to "fill a small cricket ground" (about 5,000 paying users) to validate the direction. Qualified, intent-rich signups matter more than raw volume. *(Source: founders' X article, reposted on YouMind.)*
- **Secondary:** visitors on Windows or phones arriving from X. They can't use Alma yet (it's Mac only), but they can join and open the invite on a Mac later.

## Product Purpose
Alma is an AI-native interface for the Mac. You describe the outcome; Alma operates the apps you already have (clicking, typing, navigating, waiting) through its own computer-use stack, driven by natural language and voice, with context from your screen, files and recent work. Every action is visible and interruptible. The Mac app is in private testing, and this page exists to fill the next rounds of invites with people likely to keep and pay for it.

**Success for this page:** a qualified waitlist signup. The email is the conversion. What the visitor wants Alma to do first is the qualifier (optional, after signup).

## Positioning
- **Proprietary computer use, built from scratch:** "the perception, grounding, planning and control stack that lets a model actually drive a desktop is ours, not a wrapper on someone else's agent" (llms.txt).
- **Unmodified apps, no integrations:** "If a human can drive it, Alma can drive it."
- **Voice is first-class,** not a dictation box.
- **Visible and interruptible:** you see the cursor and each step, and can stop, correct or take the keyboard back mid-task.
- **Competitive context (2026):** Perplexity Personal Computer, Claude computer use, OpenAI Codex computer use and Meta Muse all run on the Mac. Alma's page has to answer "why Alma?" The Krunker demo (same prompt to ChatGPT's computer use and to Alma, side by side) is the most direct proof.

## Operating Context
Visitors arrive mostly on desktop from X links (often deep links to a specific demo), plus mobile X in-app browsers. The current site, alma.inc, is a single-screen macOS-desktop simulation with a waitlist form (`POST /waitlist` with `{ email }`) and demo windows at `/demos/<slug>/`.

## Capabilities and Constraints
- Mac only (Apple Silicon assumed, unconfirmed). Private testing, with invites in rounds.
- Waitlist endpoint accepts an email only. **Not available yet:** place in line, referral codes, first-task capture. These are prototype mocks and must be labelled as such until the backend exists.
- The site is Astro, vanilla JS and CSS, with self-hosted Miranda Sans.
- No pricing, launch date or plan details are public. Don't invent any.

## Brand Commitments
- **Name:** Alma, by Memfold AI Inc., San Francisco.
- **Identity:** the four-lobe Alma mark and Miranda Sans (400/500). The user asked to keep Alma's branding. Colour roles, verified in alma.inc's CSS:
  - **Base:** plum-black `#0B0111` (`theme-color`).
  - **Atmosphere and creature:** the blue-violet bioluminescence of their wallpaper (jellyfish-shaped Alma marks glowing on deep navy/plum). The exact hue is pending the wallpaper file.
  - **Actions only:** gold `#F3CF8A` → `#FFE6B0`, on the waitlist button, default buttons, links, confirmation, caret and focus.
  - **Not brand:** Apple system blue `#007AFF`/`#0A84FF`, which belongs only to the old macOS imitation.
- **From the user's conversation with the Alma team (binding):** they want an Awwwards-calibre site (references: Lusion v3, Igloo Inc, The Sea We Breathe, Lando Norris, all confirmed Awwwards SOTD) that still converts visitors into registrations.
- **Brief from the user (binding):** the jellyfish is the main motif. The page is one screen with no scrolling, and must be "insanely better" than the current site and convert.
- **Voice:** plain, confident, a little dry (llms.txt and the manifesto).

## Evidence on Hand
- **Six unedited recordings,** each with an mp4, a small mp4 and a poster on alma.inc: Blender, Paint, Krunker (vs ChatGPT), Zerodha Kite, Passwords, Tinder.
- **Real numbers:**
  - Blender rocket: "under two minutes, about $0.30 of inference".
  - Passwords: "all in about a minute".
  - Zerodha: places the order "once the user confirms it".
- **Original X posts:** Blender (rahulxkm), Paint (tiramisurabhi), Passwords (findingnische).
- **Team:** founders Vinod Ganesan (PhD, IIT Madras) and Nischith Shadagopan (BTech CSE, IIT Madras). Both are ex-Microsoft Research and founding members of Sarvam AI, where they helped train OpenHathi.
- **Investors:**
  - **Confirmed:** Peak XV backing, from independent reporting (Entrackr, Feb 2026; YourStory, Surge 12, Sep 2026).
  - Further backers: company-stated only; to be confirmed with Alma before naming them anywhere.
- **Manifesto copy** from the current site.
- **Absences (do not fabricate):** testimonials, user counts, waitlist size, logos of customers, press quotes, launch date, pricing.

## Product Principles
1. **Proof over promise:** real recordings and real numbers carry the argument. Claims without evidence don't ship.
2. **The visitor stays in control:** the page behaves the way Alma does, with everything visible, stoppable and never trapping.
3. **Qualified over many:** every step should help the right people say yes, and let the team learn what they want Alma to do.
4. **Answer "why Alma?"** in a crowded 2026 field: own stack, voice-first, visible, works on unmodified apps.

## Accessibility & Inclusion
WCAG 2.2 AA. Every visual effect has a reduced-motion version and a non-WebGL fallback, and all meaning is carried by real HTML. Sound is opt-in.
