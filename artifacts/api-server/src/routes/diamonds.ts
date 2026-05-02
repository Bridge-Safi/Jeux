import { Router, type Request, type Response } from "express";

const router = Router();

/* ── Config Supabase (mêmes clés que le jeu — pas de service key) ─ */
const SUPABASE_URL      = process.env["VITE_SUPABASE_URL"] ?? process.env["SUPABASE_URL"];
const SUPABASE_ANON_KEY = process.env["VITE_SUPABASE_ANON_KEY"] ?? process.env["SUPABASE_ANON_KEY"];

/* PARTNER_API_KEY est OPTIONNEL : si défini, l'API server vérifie le
   header x-api-key (rate-limiting / anti-abus). Sinon, la sécurité
   repose sur le fait qu'il faut connaître le numéro de téléphone
   exact du joueur (anti-énumération côté SQL). */
const PARTNER_API_KEY = process.env["PARTNER_API_KEY"];

function normalizePhone(raw: string): string {
  return raw.replace(/[^\d+]/g, "");
}

/* Appelle la RPC Supabase get_player_diamonds via la clé anon. */
async function callRpc(phone: string): Promise<{ status: number; body: unknown }> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      status: 503,
      body: { ok: false, error: "Database not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing)" },
    };
  }

  const resp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_player_diamonds`, {
    method: "POST",
    headers: {
      "apikey":        SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({ p_phone: phone }),
  });

  if (!resp.ok) {
    return { status: 502, body: { ok: false, error: `Supabase RPC failed (HTTP ${resp.status})` } };
  }

  const data = await resp.json() as { ok: boolean; error?: string } & Record<string, unknown>;

  if (data?.ok === false && data.error === "not_found") {
    return { status: 404, body: data };
  }
  if (data?.ok === false && data.error === "invalid_phone") {
    return { status: 400, body: data };
  }

  return { status: 200, body: data };
}

/* ───────────────────────────────────────────────────────────────
   GET /api/diamonds?phone=+212XXXXXXXXX

   Header (optionnel si PARTNER_API_KEY non défini) :
     x-api-key: <PARTNER_API_KEY>

   Réponse 200 :
   {
     "ok": true,
     "phone": "+212600000000",
     "diamonds": 15000,
     "qualifying_days": 2,
     "menus_earned": 0,
     "menus_claimed": 0,
     "menus_available": 0,
     "updated_at": "2026-05-02T..."
   }
─────────────────────────────────────────────────────────────── */
router.get("/diamonds", async (req: Request, res: Response): Promise<void> => {
  /* Authentification optionnelle (recommandée en prod) */
  if (PARTNER_API_KEY) {
    const apiKey = (req.headers["x-api-key"] as string | undefined)
      ?? (typeof req.query["api_key"] === "string" ? req.query["api_key"] : undefined);
    if (apiKey !== PARTNER_API_KEY) {
      res.status(401).json({ ok: false, error: "Unauthorized — invalid x-api-key" });
      return;
    }
  }

  const rawPhone = typeof req.query["phone"] === "string" ? req.query["phone"] : "";
  if (!rawPhone) {
    res.status(400).json({ ok: false, error: "phone parameter required" });
    return;
  }
  const phone = normalizePhone(rawPhone);
  if (phone.length < 9 || phone.length > 15) {
    res.status(400).json({ ok: false, error: "Invalid phone format" });
    return;
  }

  try {
    const { status, body } = await callRpc(phone);
    res.status(status).json(body);
  } catch {
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

/* ───────────────────────────────────────────────────────────────
   GET /api/diamonds/batch?phones=+212XXX,+212YYY
   Max 50 numéros — exécute des appels RPC en parallèle.
─────────────────────────────────────────────────────────────── */
router.get("/diamonds/batch", async (req: Request, res: Response): Promise<void> => {
  if (PARTNER_API_KEY) {
    const apiKey = (req.headers["x-api-key"] as string | undefined)
      ?? (typeof req.query["api_key"] === "string" ? req.query["api_key"] : undefined);
    if (apiKey !== PARTNER_API_KEY) {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return;
    }
  }

  const rawPhones = typeof req.query["phones"] === "string" ? req.query["phones"] : "";
  const phones = rawPhones.split(",").map((p) => normalizePhone(p)).filter((p) => p.length >= 9).slice(0, 50);
  if (!phones.length) {
    res.status(400).json({ ok: false, error: "phones parameter required (comma-separated)" });
    return;
  }

  try {
    const responses = await Promise.all(phones.map(async (p) => {
      const { body } = await callRpc(p);
      return [p, body] as const;
    }));

    const results: Record<string, unknown> = {};
    for (const [p, body] of responses) results[p] = body;

    res.json({ ok: true, results });
  } catch {
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

export default router;
