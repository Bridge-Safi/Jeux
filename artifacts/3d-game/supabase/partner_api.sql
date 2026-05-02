-- ═══════════════════════════════════════════════════════════════
--  SAFI RUNNER — API Partenaires : lecture du solde de 💎
--  À coller dans Supabase > SQL Editor > New Query.
--  À lancer APRÈS bridge_engagement.sql.
--
--  Permet à Bridge Eats, taxis, pharmacie, cigarettes, etc. de lire
--  le solde 💎 d'un joueur via son téléphone, en utilisant la MÊME
--  clé anon que le jeu (aucune clé secrète à partager).
--
--  Sécurité :
--   - SECURITY DEFINER : exécute avec les droits du propriétaire
--     → contourne RLS pour lire profiles, mais retourne UNIQUEMENT
--       des champs publics (jamais d'UUID, email, ou device id).
--   - Le caller doit connaître le téléphone exact (anti-énumération).
--   - Normalise le téléphone côté SQL (anti-bypass).
-- ═══════════════════════════════════════════════════════════════


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  FONCTION RPC : get_player_diamonds(p_phone)                 ║
-- ║  Appelable par n'importe qui avec la clé anon (le caller     ║
-- ║  doit connaître le téléphone du joueur).                     ║
-- ╚══════════════════════════════════════════════════════════════╝

DROP FUNCTION IF EXISTS get_player_diamonds(TEXT);

CREATE OR REPLACE FUNCTION get_player_diamonds(p_phone TEXT)
RETURNS JSON AS $$
DECLARE
  prof              RECORD;
  required_secs     CONSTANT INTEGER := 10800;   -- 3h min/jour
  diamonds_per_menu CONSTANT INTEGER := 15000;   -- nouvelles règles 5j
  best_streak       INTEGER := 0;
  menus_earned      INTEGER;
  menus_avail       INTEGER;
  normalized_phone  TEXT;
BEGIN
  -- Normalisation : ne garder que chiffres et +
  normalized_phone := REGEXP_REPLACE(COALESCE(p_phone, ''), '[^0-9+]', '', 'g');

  IF LENGTH(normalized_phone) < 9 THEN
    RETURN json_build_object('ok', false, 'error', 'invalid_phone');
  END IF;

  SELECT diamonds_collected, play_days, menus_claimed, first_play_date,
         updated_at, free_delivery_credits
    INTO prof
    FROM profiles
   WHERE bridge_phone = normalized_phone
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'error', 'not_found', 'phone', normalized_phone);
  END IF;

  -- Plus longue série de jours CONSÉCUTIFS qualifiants (≥ 3h chacun)
  IF prof.play_days IS NOT NULL AND jsonb_array_length(prof.play_days) > 0 THEN
    WITH q AS (
      SELECT (e->>'date')::date AS d
        FROM jsonb_array_elements(prof.play_days) e
       WHERE (e->>'playSeconds')::int >= required_secs
    ),
    ord AS (
      SELECT d, ROW_NUMBER() OVER (ORDER BY d)::int AS rn FROM q
    ),
    grp AS (
      SELECT d, (d - rn) AS g FROM ord
    )
    SELECT COALESCE(MAX(c), 0) INTO best_streak
      FROM (SELECT g, COUNT(*)::int AS c FROM grp GROUP BY g) s;
  END IF;

  menus_earned := FLOOR(COALESCE(prof.diamonds_collected, 0)::float / diamonds_per_menu);
  menus_avail  := GREATEST(0, menus_earned - COALESCE(prof.menus_claimed, 0));

  -- ATTENTION : ne JAMAIS retourner UUID/email/device_fingerprint ici.
  RETURN json_build_object(
    'ok',                    true,
    'phone',                 normalized_phone,
    'diamonds',              COALESCE(prof.diamonds_collected, 0),
    'qualifying_days',       best_streak,                            -- série consécutive
    'menus_earned',          menus_earned,
    'menus_claimed',         COALESCE(prof.menus_claimed, 0),
    'menus_available',       menus_avail,
    'free_delivery_credits', COALESCE(prof.free_delivery_credits, 0),
    'updated_at',            prof.updated_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Permissions : appelable par anon + authenticated (mêmes droits que le jeu)
REVOKE ALL ON FUNCTION get_player_diamonds(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_player_diamonds(TEXT) TO anon, authenticated, service_role;


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  EXEMPLES D'APPEL                                            ║
-- ╚══════════════════════════════════════════════════════════════╝

-- 1) Test direct en SQL :
-- SELECT get_player_diamonds('+212600000001');

-- 2) Depuis Bridge Eats (HTTP, avec la clé anon Supabase) :
-- POST https://<PROJET>.supabase.co/rest/v1/rpc/get_player_diamonds
-- Headers:
--   apikey: <VITE_SUPABASE_ANON_KEY>
--   Authorization: Bearer <VITE_SUPABASE_ANON_KEY>
--   Content-Type: application/json
-- Body:
--   { "p_phone": "+212600000001" }

-- 3) Depuis Bridge Eats (JS avec @supabase/supabase-js) :
-- const { data } = await supabase.rpc('get_player_diamonds', { p_phone: phone });
-- console.log(data.diamonds, data.menus_available);
