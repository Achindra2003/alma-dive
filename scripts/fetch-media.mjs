// Fetch Alma's public demo media from alma.inc into public/media/demos/ (git-ignored: not ours to commit).
// Posters are needed locally: the deep's Macs draw them as WebGL textures, which must be same-origin.
// Usage: npm run media            (posters + small recordings, about 15 MB)
//        npm run media -- --full  (also the full-size recordings, about 60 MB more)
import { mkdir, writeFile, access } from "node:fs/promises";
import { join } from "node:path";

const BASE = "https://alma.inc/media/demos";
const SLUGS = ["passwords", "krunker", "blender", "paint", "zerodha", "tinder"];
const full = process.argv.includes("--full");
const dir = join(process.cwd(), "public", "media", "demos");
await mkdir(dir, { recursive: true });

const files = SLUGS.flatMap((s) => [`${s}-poster.jpg`, `${s}-sm.mp4`, ...(full ? [`${s}.mp4`] : [])]);
let ok = 0;
for (const name of files) {
  const out = join(dir, name);
  try { await access(out); console.log(`have  ${name}`); ok++; continue; } catch { /* not there yet */ }
  try {
    const res = await fetch(`${BASE}/${name}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await writeFile(out, Buffer.from(await res.arrayBuffer()));
    console.log(`got   ${name}`);
    ok++;
  } catch (e) {
    console.warn(`miss  ${name} (${e.message})`);
  }
}
console.log(`\n${ok}/${files.length} files in public/media/demos/.`);
console.log(full
  ? "Run with PUBLIC_ASSET_BASE=\"\" (see .env.example) to play everything locally."
  : "Posters are local. Recordings stream from alma.inc unless you add --full and set PUBLIC_ASSET_BASE=\"\".");
