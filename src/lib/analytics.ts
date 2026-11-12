// Thin wrapper over Alma's existing PostHog + meta tracking. Never send raw task text.

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    posthog?: { capture: (event: string, props?: Props) => void };
    almaTrackMetaEvent?: (event: string, props?: Props) => void;
  }
}

export function track(event: string, props: Props = {}): void {
  try {
    window.posthog?.capture?.(event, props);
    window.almaTrackMetaEvent?.(event, props);
  } catch {
    /* analytics must never break the page */
  }
  if (import.meta.env.DEV) console.debug("[track]", event, props);
}

export function trafficContext(): Props {
  const p = new URLSearchParams(location.search);
  return {
    source: p.get("utm_source") ?? (document.referrer ? new URL(document.referrer).hostname : "direct"),
    ref: p.get("ref") ?? undefined,
  };
}
