-- ═══════════════════════════════════════════════════════════════
--  SAFI RUNNER — API Partenaires : lecture du solde de 💎
--  À coller dans Supabase > SQL Editor > New Query
--  Permet à Bridge Eats, taxis, pharmacie, etc. de lire le solde
--  d'un joueur via son numéro de téléphone.
-- ═══════════════════════════════════════════════════════════════


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  FONCTION : get_player_diamonds(phone)                       ║
-- ║  Retourne le solde de diamants d'un joueur par téléphone.    ║
-- ║  Appelée par l'API server avec la service role key.          ║
-- ╚══════════════════════════════════════════════════════════════╝

CREATE OR REPLACE FUNCTION get_player_diamonds(p_phone TEXT)
RETURNS JSON AS $$
DECLARE
  prof            RECORD;
  required_secs   CONSTANT INTEGER := 10800;   -- 3h
  diamonds_per_menu CONSTANT INTEGER := 30000;
  qualifying      INTEGER := 0;
  menus_earned    INTEGER;
  menus_avail     INTEGER;
  i               INTEGER;
  entry           JSONB;
  normalized_phone TEXT;
BEGIN
  -- Normaliser le numéro
  normalized_phone := REGEXP_REPLACE(p_phone, '[^0-9+]', '', 'g');

  SELECT diamonds_collected, play_days, menus_claimed, first_play_date, updated_at
    INTO prof
    FROM profiles
   WHERE bridge_phone = normalized_phone
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'error', 'not_found');
  END IF;

  -- Compter les jours qualifiants
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Révocation de tout accès public (appel via service role uniquement)
REVOKE ALL ON FUNCTION get_player_diamonds(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_player_diamonds(TEXT) TO service_role;


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  VUE PARTENAIRE — lecture seule, RLS activé                  ║
-- ║  Les apps partenaires lisent via la clé service role.        ║
-- ╚══════════════════════════════════════════════════════════════╝

-- Vue pour éviter d'exposer l'UUID interne des joueurs
CREATE OR REPLACE VIEW partner_player_view AS
SELECT
  bridge_phone                               AS phone,
  diamonds_collected,
  COALESCE(menus_claimed, 0)                 AS menus_claimed,
  FLOOR(diamonds_collected::float / 30000)   AS menus_earned,
  GREATEST(
    0,
    FLOOR(diamonds_collected::float / 30000) - COALESCE(menus_claimed, 0)
  )                                          AS menus_available,
  play_days,
  first_play_date,
  updated_at
FROM profiles
WHERE bridge_phone IS NOT NULL;

-- Aucun accès public à cette vue
REVOKE ALL ON partner_player_view FROM PUBLIC;
GRANT SELECT ON partner_player_view TO service_role;


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  VÉRIFICATION                                                ║
-- ╚══════════════════════════════════════════════════════════════╝
-- SELECT get_player_diamonds('+212600000001');
-- SELECT * FROM partner_player_view LIMIT 5;
