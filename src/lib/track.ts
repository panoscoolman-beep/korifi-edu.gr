import { track as vercelTrack } from "@vercel/analytics";
import type { SiteEventName } from "@/types/database";

/**
 * Μέτρηση μετατροπών (κλικ τηλεφώνου / WhatsApp / Viber / υποβολή φόρμας).
 *
 * Στέλνει το event σε δύο μέρη:
 *  1. Vercel Analytics custom event (όπου το πλάνο το υποστηρίζει).
 *  2. Δικός μας πίνακας `site_events` μέσω `POST /api/track` — χωρίς cookies,
 *     χωρίς IP, χωρίς user id. Τα νούμερα φαίνονται στο /admin/leads.
 *
 * Ποτέ δεν πετάει σφάλμα: η μέτρηση δεν πρέπει να εμποδίσει το ίδιο το κλικ.
 */
export function trackEvent(name: SiteEventName, props: { path?: string; place?: string } = {}) {
  const path = props.path ?? (typeof location !== "undefined" ? location.pathname : undefined);
  const place = props.place;

  try {
    vercelTrack(name, { ...(path ? { path } : {}), ...(place ? { place } : {}) });
  } catch {
    /* ignore */
  }

  try {
    const body = JSON.stringify({ name, path: path ?? null, place: place ?? null });
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else if (typeof fetch === "function") {
      fetch("/api/track", {
        method: "POST",
        body,
        keepalive: true,
        headers: { "Content-Type": "application/json" },
      }).catch(() => {});
    }
  } catch {
    /* ignore */
  }
}
