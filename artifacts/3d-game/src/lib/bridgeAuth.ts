/* ──────────────────────────────────────────────────────────────────
   AUTHENTIFICATION VIA BRIDGE EATS — single sign-on
   ─────────────────────────────────────────────────────────────────
   Le joueur DOIT être connecté sur Bridge Eats avec son email + n°.
   Bridge Eats ouvre le jeu en embarquant ces identifiants en query
   params : `?email=foo@bar.com&phone=212600000000` (ou via postMessage
   si embarqué en iframe). Le jeu :
     1. Lit les params à l'ouverture, les valide, les persiste en
        localStorage et nettoie l'URL (pour ne pas les exposer dans
        l'historique navigateur).
     2. Sans identifiants → écran de blocage avec bouton "Se connecter
        sur Bridge Eats" (rester dans la même appli, voir inAppNav).
     3. Avec identifiants → la session reste persistée tant que le
        joueur n'efface pas son storage navigateur.
   ────────────────────────────────────────────────────────────── */

const STORAGE_KEY = "safi_runner_bridge_auth";
export const EVENT_NAME = "safi:bridge-auth";

export type BridgeAuth = {
  email: string;
  phone: string;
};

/* Format MA : +212XXXXXXXXX, 212XXXXXXXXX ou 0XXXXXXXXX (9-15 chiffres). */
function normalizePhone(raw: string): string | null {
  const cleaned = raw.replace(/[^\d+]/g, "");
  if (cleaned.length < 9 || cleaned.length > 15) return null;
  return cleaned;
}

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/* Lit les query params éventuels et persiste l'auth. À appeler une
   fois au tout début (avant le rendu de l'application). */
export function consumeUrlAuth(): BridgeAuth | null {
  try {
    const url = new URL(window.location.href);
    const email = (url.searchParams.get("email") || "").trim().toLowerCase();
    const phoneRaw = (url.searchParams.get("phone") || "").trim();
    const phone = normalizePhone(phoneRaw);
    if (!email || !isValidEmail(email) || !phone) return null;

    const auth: BridgeAuth = { email, phone };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));

    /* Nettoie l'URL — on ne veut pas l'email dans l'historique. */
    url.searchParams.delete("email");
    url.searchParams.delete("phone");
    window.history.replaceState({}, "", url.toString());

    window.dispatchEvent(new Event(EVENT_NAME));
    return auth;
  } catch {
    return null;
  }
}

/* Récupère l'auth en cours (URL > localStorage). */
export function getBridgeAuth(): BridgeAuth | null {
  try {
    /* Tentative URL d'abord — pour les liens directs avec params. */
    const fromUrl = consumeUrlAuth();
    if (fromUrl) return fromUrl;

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BridgeAuth>;
    if (!parsed?.email || !parsed?.phone) return null;
    return { email: parsed.email, phone: parsed.phone };
  } catch {
    return null;
  }
}

export function clearBridgeAuth(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    /* ignore */
  }
}

/* Permet à Bridge Eats parent d'envoyer l'auth via postMessage
   (utile quand le jeu est embarqué en iframe). Format attendu :
   `{ type: "bridge-auth", email, phone }`. */
export function listenForParentAuth(onUpdate: (auth: BridgeAuth) => void): () => void {
  const handler = (e: MessageEvent) => {
    const d = e.data as { type?: string; email?: string; phone?: string };
    if (d?.type !== "bridge-auth" || !d.email || !d.phone) return;
    const phone = normalizePhone(d.phone);
    if (!isValidEmail(d.email) || !phone) return;
    const auth: BridgeAuth = { email: d.email.toLowerCase(), phone };
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth)); } catch { /* ignore */ }
    window.dispatchEvent(new Event(EVENT_NAME));
    onUpdate(auth);
  };
  window.addEventListener("message", handler);
  return () => window.removeEventListener("message", handler);
}
