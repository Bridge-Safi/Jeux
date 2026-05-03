-- ═══════════════════════════════════════════════════════════════
--  SAFI RUNNER — Photo de profil joueur
--  Ajoute la colonne `avatar_url` (TEXT) à la table `profiles`.
--  Stocke une data URL (base64 JPEG ~256px, ~30-50 KB) ou une URL
--  externe (https://...) — le client envoie ce qu'il veut.
--  À coller dans Supabase > SQL Editor > New Query.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Met à jour la fonction RPC `get_player_diamonds` pour qu'elle
-- renvoie aussi la photo de profil — Bridge Eats / Fleurs / Pharmacie /
-- Tabac / Taxi Confort pourront l'afficher partout sans requête séparée.
DROP FUNCTION IF EXISTS get_player_diamonds(TEXT);

CREATE OR REPLACE FUNCTION get_player_diamonds(p_phone TEXT)
RETURNS JSON AS $$
DECLARE
  prof              RECORD;
  required_secs     CONSTANT INTEGER := 10800;
  diamonds_per_menu CONSTANT INTEGER := 15000;
  best_streak       INTEGER := 0;
  menus_earned      INTEGER;
  menus_avail       INTEGER;
  normalized_phone  TEXT;
BEGIN
  normalized_phone := REGEXP_REPLACE(COALESCE(p_phone, ''), '[^0-9+]', '', 'g');

  IF LENGTH(normalized_phone) < 9 THEN
    RETURN json_build_object('ok', false, 'error', 'invalid_phone');
  END IF;

  SELECT diamonds_collected, play_days, menus_claimed, first_play_date,
         updated_at, free_delivery_credits, username, avatar_url
    INTO prof
    FROM profiles
   WHERE bridge_phone = normalized_phone
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'error', 'not_found', 'phone', normalized_phone);
  END IF;

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

  RETURN json_build_object(
    'ok',                    true,
    'phone',                 normalized_phone,
    'username',              prof.username,
    'avatar_url',            prof.avatar_url,
    'diamonds',              COALESCE(prof.diamonds_collected, 0),
    'qualifying_days',       best_streak,
    'menus_earned',          menus_earned,
    'menus_claimed',         COALESCE(prof.menus_claimed, 0),
    'menus_available',       menus_avail,
    'free_delivery_credits', COALESCE(prof.free_delivery_credits, 0),
    'updated_at',            prof.updated_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

REVOKE ALL ON FUNCTION get_player_diamonds(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_player_diamonds(TEXT) TO anon, authenticated, service_role;
