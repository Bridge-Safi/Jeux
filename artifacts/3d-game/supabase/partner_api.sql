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
  required_secs     CONSTANT INTEGER := 10800;   -- 3h
  diamonds_per_menu CONSTANT INTEGER := 30000;
  qualifying        INTEGER := 0;
  menus_earned      INTEGER;
  menus_avail       INTEGER;
  i                 INTEGER;
  entry             JSONB;
  normalized_phone  TEXT;
BEGIN
  -- Normalisation : ne garder que chiffres et +
  normalized_phone := REGEXP_REPLACE(COALESCE(p_phone, ''), '[^0-9+]', '', 'g');

  IF LENGTH(normalized_phone) < 9 THEN
    RETURN json_build_object('ok', false, 'error', 'invalid_phone');
  END IF;

  SELECT diamonds_collected, play_days, menus_claimed, first_play_date, updated_at
    INTO prof
    FROM profiles
   WHERE bridge_phone = normalized_phone
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'error', 'not_found', 'phone', normalized_phone);
  END IF;

  -- Compter les jours qualifiants (≥ 3h)
  IF prof.play_days IS NOT NULL THEN
    FOR i IN 0 .. (jsonb_array_length(prof.play_days) - 1) LOOP
      entry := prof.play_days -> i;
      IF (entry->>'playSeconds')::int >= required_secs THEN
        qualifying := qualifying + 1;
      END IF;
    END LOOP;
  END IF;

  menus_earned := FLOOR(COALESCE(prof.diamonds_collected, 0)::float / diamonds_per_menu);
  menus_avail  := GREATEST(0, menus_earned - COALESCE(prof.menus_claimed, 0));

  -- ATTENTION : ne JAMAIS retourner UUID/email/device_fingerprint ici.
  RETURN json_build_object(
    'ok',              true,
    'phone',           normalized_phone,
    'diamonds',        COALESCE(prof.diamonds_collected, 0),
    'qualifying_days', qualifying,
    'menus_earned',    menus_earned,
    'menus_claimed',   COALESCE(prof.menus_claimed, 0),
    'menus_available', menus_avail,
    'updated_at',      prof.updated_at
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
