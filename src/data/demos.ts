// The six unedited recordings. Copy comes from alma.inc/llms.txt.
// Files are served from Alma's site; override with PUBLIC_ASSET_BASE (e.g. "" when assets are copied into /public).

export const ASSET_BASE: string = import.meta.env.PUBLIC_ASSET_BASE ?? "https://alma.inc";
/** Posters can come from elsewhere than the videos: the scene draws them as WebGL textures, which need same-origin (or
 *  CORS) images, and alma.inc sends no CORS header. A review deploy streams videos from alma.inc and ships posters. */
export const POSTER_BASE: string = import.meta.env.PUBLIC_POSTER_BASE ?? "";   // local by default: `npm run media` fetches them

export type Demo = {
  slug: "passwords" | "blender" | "paint" | "zerodha" | "krunker" | "tinder";
  /** Short task phrasing, used as chip label and stage title */
  task: string;
  /** One-line caption under the video */
  caption: string;
  /** Real figures only (from llms.txt). Empty when none were published. */
  stats: string[];
  /** Intent keywords for the on-device matcher */
  keywords: string[];
  /** Original post on X, if published */
  xUrl?: string;
  /** Voice-driven demos benefit from sound */
  voice: boolean;
  /** Show as a chip in the hero */
  chip: boolean;
  /** Short tab label under the screen */
  tab: string;
  /** Short specimen label */
  label: string;
  /** Personalised close shown after the recording ends */
  want: string;
};

export const DEMOS: Demo[] = [
  {
    slug: "passwords",
    tab: "Passwords",
    label: "Passwords",
    want: "Want Alma to fix your passwords?",
    task: "Fix my weak passwords",
    caption: "Alma reads the weak passwords in the Passwords app, signs in to each site and changes them one by one.",
    stats: ["About a minute"],
    keywords: ["password", "passwords", "security", "secure", "login", "logins", "account", "accounts", "weak", "keychain", "change", "reset"],
    xUrl: "https://x.com/findingnische/status/2103454708086313197",
    voice: false,
    chip: true,
  },
  {
    slug: "blender",
    tab: "Blender",
    label: "Blender",
    want: "Want Alma building in Blender for you?",
    task: "Build a rocket in Blender",
    caption: "Alma opens Blender and models a rocket end to end with computer use.",
    stats: ["Under 2 minutes", "About $0.30 of inference"],
    keywords: ["blender", "3d", "model", "modeling", "modelling", "render", "rocket", "mesh", "design", "cad", "build"],
    xUrl: "https://x.com/rahulxkm/status/2096182164501188886",
    voice: false,
    chip: true,
  },
  {
    slug: "paint",
    tab: "Paint",
    label: "Paint",
    want: "Want Alma to paint for you?",
    task: "Paint me something",
    caption: "Keep talking until there is a painting. Alma drives the brush, the palette and the fill tool by voice.",
    stats: ["Voice only"],
    keywords: ["paint", "painting", "draw", "drawing", "sketch", "art", "picture", "image", "illustrate", "colour", "color", "brush"],
    xUrl: "https://x.com/tiramisurabhi/status/2092165148140360064",
    voice: true,
    chip: true,
  },
  {
    slug: "zerodha",
    tab: "Trading",
    label: "Trading",
    want: "Want Alma running your charts?",
    task: "Trade NIFTY options by voice",
    caption: "By voice, Alma adds indicators to the NIFTY 50 chart, snapshots four timeframes, reads the option chain and places an order once you confirm.",
    stats: ["Waits for your confirmation"],
    keywords: ["stock", "stocks", "trade", "trading", "chart", "charts", "option", "options", "nifty", "portfolio", "market", "zerodha", "kite", "invest", "order"],
    voice: true,
    chip: true,
  },
  {
    slug: "krunker",
    tab: "Alma vs ChatGPT",
    label: "Gaming",
    want: "Want Alma to play for you?",
    task: "Play Krunker in Chrome",
    caption: "The same prompt to ChatGPT's computer use and to Alma, filmed side by side.",
    stats: ["Alma vs ChatGPT, same prompt, side by side"],
    keywords: ["game", "games", "gaming", "play", "fps", "shoot", "shooter", "krunker", "chrome", "browser"],
    voice: false,
    chip: false,
  },
  {
    slug: "tinder",
    tab: "Tinder",
    label: "Tinder",
    want: "Want Alma to swipe for you?",
    task: "Swipe on Tinder",
    caption: "Alma operates Tinder in the browser, the way you would.",
    stats: [],
    keywords: ["dating", "date", "swipe", "match", "matches", "tinder", "profile"],
    voice: false,
    chip: false,
  },
];

export const DEFAULT_DEMO: Demo["slug"] = "passwords";

export const demoBySlug = (slug: string): Demo | undefined => DEMOS.find((d) => d.slug === slug);

export const demoFiles = (slug: Demo["slug"]) => ({
  poster: `${POSTER_BASE}/media/demos/${slug}-poster.jpg`,
  src: `${ASSET_BASE}/media/demos/${slug}.mp4`,
  srcSmall: `${ASSET_BASE}/media/demos/${slug}-sm.mp4`,
});

/** Agent steps for the "Transparent by design" section, summarised from the passwords recording description. */
export const PASSWORD_STEPS = [
  "Open the Passwords app",
  "Find the accounts flagged as weak",
  "Open the first website and sign in",
  "Go to account settings and change the password",
  "Save the new password back to Passwords",
  "Move on to the next account",
];
