# Alma: The Dive (landing page prototype)

A redesign concept for alma.inc: one pinned screen where scrolling dives after a jellyfish, Surface → Mid-water → The deep, with the waitlist form always on screen. Design and decisions: `DESIGN.md` and `docs/dive/` (start at `00-INDEX.md`). Tokens: `src/styles/tokens.css`.


## Run it locally
Needs Node 22 (Astro 5.18).
```
npm install
npm run media      # Alma's demo posters + small recordings from alma.inc into public/media/demos/ (not committed)
npm run dev        # http://localhost:4321
```
`npm run media -- --full` also fetches the full-size recordings; then set `PUBLIC_ASSET_BASE=""` (see `.env.example`) to play everything offline. Without `npm run media` the page still works; the Macs in the deep just show dark screens.

Scroll to dive (one depth per gesture); at The deep, click the jellyfish to go home. Live review copy: https://alma-dive.vercel.app

Production-like build: `npm run build && npm run preview` (http://127.0.0.1:4321). Node 22.17 works (Astro 5.18.2 is pinned because Astro 7 needs Node 22.22 or newer).

## Configuration (`.env`)
| Variable | Default | Meaning |
|---|---|---|
| `PUBLIC_WAITLIST_MODE` | `mock` | `live` posts to Alma's `POST /waitlist` (same origin only) |
| `PUBLIC_ASSET_BASE` | `https://alma.inc` | Where the recordings load from. Set to `""` after `npm run media -- --full` |
| `PUBLIC_POSTER_BASE` | `""` (local) | Where posters load from. The deep's Macs draw them as WebGL textures, so they must be same-origin or CORS (alma.inc sends no CORS header) |

**Fonts:** Miranda Sans is self-hosted from `public/fonts/` (it is on Google Fonts, so SIL Open Font License).

**Firewalled networks** may block alma.inc, so recordings show their error state. Use another network or `npm run media -- --full` with local copies.

## Mock test hooks
- `fail@…` simulates a server error
- `exists@…` simulates "already on the list"
- `slow@…` simulates a timeout

## Debug switches
`?depth=mid|deep` opens at that depth. `__conductor.state()` shows the scroll conductor (exact, smooth, the rest a gesture started from). `?debug=nowebgl` shows the no-WebGL page. In the console: `__dive.bench(200)` (frame cost, draw calls), `__dive.probe(x, y, w, h)` (brightest luminance the scene draws behind a rect, for contrast), `__dive.depth(v)` / `__dive.release()` (hold the water at a depth).

## Review deploy (Vercel)
1. `npm run media`, then `PUBLIC_ASSET_BASE=https://alma.inc npx astro build`
2. Copy `dist/` to a clean folder and delete the `.mp4` files (recordings stream from alma.inc; posters ship, since the scene draws them as WebGL textures).
3. In that folder's HTML: add `<meta name="robots" content="noindex, nofollow">` and make `og:image` relative (`/og.jpg`).
4. `vercel deploy <folder> --prod --name alma-dive` → https://alma-dive.vercel.app
5. Rebuild locally afterwards (`npx astro build`) so the preview uses local recordings again.

## Routes
- `/`: the stage
- `/demos/<slug>/`: same stage with that recording opened (shareable)
