import { Router, type Request, type Response } from "express";

const router = Router();

/* ── Constantes programme Bridge ────────────────────────────── */
const REQUIRED_SECONDS_PER_DAY = 10_800; // 3h
const DIAMONDS_PER_MENU        = 30_000;

/* ── Config depuis les variables d'environnement ────────────── */
const SUPABASE_URL         = process.env["SUPABASE_URL"];
const SUPABASE_SERVICE_KEY = process.env["SUPABASE_SERVICE_KEY"];
const PARTNER_API_KEY      = process.env["PARTNER_API_KEY"];

function normalizePhone(raw: string): string {
  return raw.replace(/[^\d+]/g, "");
}

type ProfileRow = {
  diamonds_collected: number;
  play_days: Array<{ date: string; playSeconds: number }> | null;
  menus_claimed: number | null;
  first_play_date: string | null;
  updated_at: string | null;
};

/* ───────────────────────────────────────────────────────────────
   GET /api/diamonds?phone=+212XXXXXXXXX

   Retourne le solde de 💎 d'un joueur identifié par son téléphone
   Bridge Eats. Conçu pour les apps partenaires (Bridge Eats, taxis,
   pharmacie, etc.) qui veulent afficher le même chiffre que le jeu.

   Auth : header   x-api-key: <PARTNER_API_KEY>
          ou param ?api_key=<PARTNER_API_KEY>

   Réponse 200 :
   {
     "ok": true,
     "phone": "+212600000000",
     "diamonds": 15000,
     "qualifying_days": 2,
     "menus_earned": 0,
     "menus_claimed": 0,
     "menus_available": 0,
     "updated_at": "2026-05-02T12:34:56Z"
   }
─────────────────────────────────────────────────────────────── */
router.get("/diamonds", async (req: Request, res: Response): Promise<void> => {
  /* ── Authentification ── */
  const apiKey = (req.headers["x-api-key"] as string | undefined)
    ?? (typeof req.query["api_key"] === "string" ? req.query["api_key"] : undefined);

  if (!PARTNER_API_KEY || apiKey !== PARTNER_API_KEY) {
    res.status(401).json({ ok: false, error: "Unauthorized — invalid or missing x-api-key" });
    return;
  }

  /* ── Validation du téléphone ── */
  const rawPhone = typeof req.query["phone"] === "string" ? req.query["phone"] : "";
  if (!rawPhone) {
    res.status(400).json({ ok: false, error: "phone parameter required" });
    return;
  }
  const phone = normalizePhone(rawPhone);
  if (phone.length < 9 || phone.length > 15) {
    res.status(400).json({ ok: false, error: "Invalid phone format — expected MA number like +212XXXXXXXXX" });
    return;
  }

  /* ── Supabase configuré ? ── */
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    res.status(503).json({ ok: false, error: "Database not configured (SUPABASE_URL / SUPABASE_SERVICE_KEY missing)" });
    return;
  }

  /* ── Requête Supabase REST ── */
  try {
    const url = new URL(`${SUPABASE_URL}/rest/v1/profiles`);
    url.searchParams.set("bridge_phone", `eq.${phone}`);
    url.searchParams.set("select", "diamonds_collected,play_days,menus_claimed,first_play_date,updated_at");
    url.searchParams.set("limit", "1");

    const resp = await fetch(url.toString(), {
      headers: {
        "apikey":        SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type":  "application/json",
      },
    });

    if (!resp.ok) {
      res.status(502).json({ ok: false, error: "Database query failed" });
      return;
    }

    const rows = await resp.json() as ProfileRow[];

    if (!rows.length) {
      res.status(404).json({ ok: false, error: "Player not found — phone not registered in Safi Runner" });
      return;
    }

    const row = rows[0];
    const diamonds      = row.diamonds_collected ?? 0;
    const playDays      = Array.isArray(row.play_days) ? row.play_days : [];
    const qualifyingDays = playDays.filter((d) => d.playSeconds >= REQUIRED_SECONDS_PER_DAY).length;
    const menusEarned   = Math.floor(diamonds / DIAMONDS_PER_MENU);
    const menusClaimed  = row.menus_claimed ?? 0;
    const menusAvailable = Math.max(0, menusEarned - menusClaimed);

    res.json({
      ok: true,
      phone,
      diamonds,
      qualifying_days:  qualifyingDays,
      menus_earned:     menusEarned,
      menus_claimed:    menusClaimed,
      menus_available:  menusAvailable,
      updated_at:       row.updated_at ?? null,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

/* ───────────────────────────────────────────────────────────────
   GET /api/diamonds/batch  — plusieurs téléphones en une requête

   Body (JSON) : { "phones": ["+212600000001", "+212600000002"] }
   ou Query    : ?phones=+212600000001,+212600000002

   Retourne un tableau indexé par numéro. Max 50 numéros.
─────────────────────────────────────────────────────────────── */
router.get("/diamonds/batch", async (req: Request, res: Response): Promise<void> => {
  const apiKey = (req.headers["x-api-key"] as string | undefined)
    ?? (typeof req.query["api_key"] === "string" ? req.query["api_key"] : undefined);

  if (!PARTNER_API_KEY || apiKey !== PARTNER_API_KEY) {
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return;
  }

  const rawPhones = typeof req.query["phones"] === "string" ? req.query["phones"] : "";
  const phones = rawPhones.split(",").map(normalizePhone).filter((p) => p.length >= 9).slice(0, 50);

  if (!phones.length) {
    res.status(400).json({ ok: false, error: "phones parameter required (comma-separated)" });
    return;
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    res.status(503).json({ ok: false, error: "Database not configured" });
    return;
  }

  try {
    const inFilter = phones.map((p) => encodeURIComponent(p)).join(",");
    const url = new URL(`${SUPABASE_URL}/rest/v1/profiles`);
    url.searchParams.set("bridge_phone", `in.(${phones.join(",")})`);
    url.searchParams.set("select", "bridge_phone,diamonds_collected,play_days,menus_claimed,updated_at");
    url.searchParams.set("limit", "50");

    const resp = await fetch(url.toString(), {
      headers: {
        "apikey":        SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type":  "application/json",
      },
    });

    if (!resp.ok) {
      res.status(502).json({ ok: false, error: "Database query failed" });
      return;
    }

    const rows = await resp.json() as Array<ProfileRow & { bridge_phone: string }>;
    const results: Record<string, object> = {};

    for (const row of rows) {
      const diamonds       = row.diamonds_collected ?? 0;
      const playDays       = Array.isArray(row.play_days) ? row.play_days : [];
      const qualifyingDays = playDays.filter((d) => d.playSeconds >= REQUIRED_SECONDS_PER_DAY).length;
      const menusEarned    = Math.floor(diamonds / DIAMONDS_PER_MENU);
      const menusClaimed   = row.menus_claimed ?? 0;
      results[row.bridge_phone] = {
        diamonds,
        qualifying_days:  qualifyingDays,
        menus_earned:     menusEarned,
        menus_claimed:    menusClaimed,
        menus_available:  Math.max(0, menusEarned - menusClaimed),
        updated_at:       row.updated_at ?? null,
      };
    }

    /* Ajouter les numéros non trouvés */
    for (const p of phones) {
      if (!results[p]) results[p] = { error: "not_found" };
    }

    res.json({ ok: true, results });
  } catch {
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

export default router;
