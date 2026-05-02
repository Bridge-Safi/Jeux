-- ═══════════════════════════════════════════════════════════════
--  SAFI RUNNER — Programme d'engagement Bridge (3 jours / 30 000 💎)
--  À coller et exécuter dans : Supabase > SQL Editor > New Query
--  À lancer APRÈS anti_cheat.sql.
-- ═══════════════════════════════════════════════════════════════


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  BLOC 1 — Nouvelles colonnes : tél Bridge + suivi journalier ║
-- ╚══════════════════════════════════════════════════════════════╝

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bridge_phone     TEXT,        -- n° de téléphone Bridge Eats
  ADD COLUMN IF NOT EXISTS first_play_date  DATE,        -- 1ᵉʳ jour personnel
  ADD COLUMN IF NOT EXISTS play_days        JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS menus_claimed    INTEGER DEFAULT 0;

-- Format de play_days :
-- [
--   { "date": "2026-05-02", "playSeconds": 3720 },
--   { "date": "2026-05-03", "playSeconds": 4100 },
--   ...
-- ]

-- Un téléphone = un seul compte Bridge
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_bridge_phone_unique;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_bridge_phone_unique UNIQUE (bridge_phone);

CREATE INDEX IF NOT EXISTS idx_profiles_bridge_phone ON profiles (bridge_phone);


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  BLOC 2 — Trigger anti-doublon téléphone Bridge              ║
-- ║  Un n° de téléphone ne peut être lié qu'à un seul compte.    ║
-- ╚══════════════════════════════════════════════════════════════╝

CREATE OR REPLACE FUNCTION validate_bridge_phone_unique()
RETURNS TRIGGER AS $$
DECLARE
  existing_id UUID;
BEGIN
  IF NEW.bridge_phone IS NULL THEN
    RETURN NEW;
  END IF;

  -- Normaliser : conserver uniquement les chiffres et le +
  NEW.bridge_phone := REGEXP_REPLACE(NEW.bridge_phone, '[^0-9+]', '', 'g');

  IF LENGTH(NEW.bridge_phone) < 9 THEN
    RAISE EXCEPTION 'Safi Runner : numéro de téléphone Bridge invalide.';
  END IF;

  SELECT id INTO existing_id
  FROM profiles
  WHERE bridge_phone = NEW.bridge_phone
    AND id <> NEW.id
  LIMIT 1;

  IF existing_id IS NOT NULL THEN
    RAISE EXCEPTION 'Safi Runner : un compte Bridge utilise déjà ce numéro.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS anti_dup_bridge_phone ON profiles;

CREATE TRIGGER anti_dup_bridge_phone
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  WHEN (NEW.bridge_phone IS NOT NULL)
  EXECUTE FUNCTION validate_bridge_phone_unique();


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  BLOC 3 — RPC atomique : enregistrer une session de jeu      ║
-- ║  Utilise CURRENT_DATE côté serveur → impossible de tricher   ║
-- ║  en changeant l'horloge du téléphone.                        ║
-- ║  Append/increment atomique dans play_days (anti-race).       ║
-- ╚══════════════════════════════════════════════════════════════╝

CREATE OR REPLACE FUNCTION add_play_session(p_id UUID, p_seconds INTEGER)
RETURNS VOID AS $$
DECLARE
  today_date  DATE := CURRENT_DATE;          -- date serveur
  current_days JSONB;
  new_days     JSONB := '[]'::jsonb;
  entry        JSONB;
  found        BOOLEAN := FALSE;
  capped       INTEGER;
  i            INTEGER;
BEGIN
  IF p_seconds < 1 THEN RETURN; END IF;

  -- Plafonner à 4h pour bloquer une session falsifiée
  capped := LEAST(p_seconds, 14400);

  SELECT play_days INTO current_days FROM profiles WHERE id = p_id FOR UPDATE;
  IF current_days IS NULL THEN current_days := '[]'::jsonb; END IF;

  FOR i IN 0 .. (jsonb_array_length(current_days) - 1) LOOP
    entry := current_days -> i;
    IF (entry->>'date') = today_date::text THEN
      entry := jsonb_set(
        entry,
        '{playSeconds}',
        to_jsonb(LEAST(86400, (entry->>'playSeconds')::int + capped))
      );
      found := TRUE;
    END IF;
    new_days := new_days || entry;
  END LOOP;

  IF NOT found THEN
    new_days := new_days || jsonb_build_object('date', today_date::text, 'playSeconds', capped);
  END IF;

  UPDATE profiles
  SET play_days       = new_days,
      first_play_date = COALESCE(first_play_date, today_date),
      updated_at      = NOW()
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  BLOC 4 — RPC atomique : réclamer un menu                    ║
-- ║  Vérifie côté SERVEUR les 3 conditions :                     ║
-- ║   1. ≥ DIAMONDS_PER_MENU 💎 disponibles                      ║
-- ║   2. ≥ 3 jours actifs (≥ 1h chacun)                          ║
-- ║   3. ≥ 4 jours calendaires depuis le 1ᵉʳ jour personnel      ║
-- ║  Retourne TRUE si débloqué + incrémenté atomiquement.        ║
-- ╚══════════════════════════════════════════════════════════════╝

CREATE OR REPLACE FUNCTION claim_menu(p_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  diamonds_per_menu CONSTANT INTEGER := 30000;
  required_days     CONSTANT INTEGER := 3;
  required_secs     CONSTANT INTEGER := 3600;
  required_delay    CONSTANT INTEGER := 4;

  prof          RECORD;
  qualifying    INTEGER := 0;
  days_since    INTEGER;
  menus_avail   INTEGER;
  i             INTEGER;
  entry         JSONB;
BEGIN
  SELECT diamonds_collected, play_days, first_play_date, menus_claimed
    INTO prof
    FROM profiles
   WHERE id = p_id
    FOR UPDATE;

  IF NOT FOUND OR prof.first_play_date IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Compte les jours qualifiants (≥ 1h)
  IF prof.play_days IS NOT NULL THEN
    FOR i IN 0 .. (jsonb_array_length(prof.play_days) - 1) LOOP
      entry := prof.play_days -> i;
      IF (entry->>'playSeconds')::int >= required_secs THEN
        qualifying := qualifying + 1;
      END IF;
    END LOOP;
  END IF;

  -- Délai calendaire SERVEUR (immune à la triche d'horloge client)
  days_since := (CURRENT_DATE - prof.first_play_date) + 1;

  -- Menus disponibles
  menus_avail := FLOOR(COALESCE(prof.diamonds_collected, 0) / diamonds_per_menu)
               - COALESCE(prof.menus_claimed, 0);

  IF menus_avail < 1 OR qualifying < required_days OR days_since < required_delay THEN
    RETURN FALSE;
  END IF;

  UPDATE profiles
  SET menus_claimed = COALESCE(menus_claimed, 0) + 1,
      updated_at    = NOW()
  WHERE id = p_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  VÉRIFICATION                                                ║
-- ╚══════════════════════════════════════════════════════════════╝
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'profiles' AND column_name IN
--     ('bridge_phone','first_play_date','play_days','menus_claimed');
-- SELECT routine_name FROM information_schema.routines
--   WHERE routine_name IN ('add_play_session','claim_menu');
