-- ═══════════════════════════════════════════════════════════════
--  SAFI RUNNER — Programme d'engagement Bridge (3 jours / 30 000 💎)
--  À coller et exécuter dans : Supabase > SQL Editor > New Query
--  À lancer APRÈS anti_cheat.sql.
-- ═══════════════════════════════════════════════════════════════


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  BLOC 1 — Nouvelles colonnes : tél Bridge + suivi journalier ║
-- ╚══════════════════════════════════════════════════════════════╝

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bridge_phone           TEXT,        -- n° de téléphone Bridge Eats
  ADD COLUMN IF NOT EXISTS first_play_date        DATE,        -- 1ᵉʳ jour personnel
  ADD COLUMN IF NOT EXISTS play_days              JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS menus_claimed          INTEGER DEFAULT 0,
  -- Bonus 2026 : 2h DE PLUS qu'une session normale (≥ 5h dans la journée)
  -- → +2 000 💎 + 1 livraison gratuite. Plafonné à 1 fois par date.
  ADD COLUMN IF NOT EXISTS bonus_days             JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS free_delivery_credits  INTEGER DEFAULT 0;

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
  -- Seuils du programme 2026
  bonus_trigger    CONSTANT INTEGER := 18000;   -- 5h = 3h normales + 2h bonus
  bonus_diamonds   CONSTANT INTEGER := 2000;
  today_date       DATE     := CURRENT_DATE;     -- date serveur
  current_days     JSONB;
  new_days         JSONB    := '[]'::jsonb;
  entry            JSONB;
  found            BOOLEAN  := FALSE;
  capped           INTEGER;
  i                INTEGER;
  bonus_arr        JSONB;
  daily_total      INTEGER  := 0;
  award_bonus      BOOLEAN  := FALSE;
  today_text       TEXT     := today_date::text;
BEGIN
  IF p_seconds < 1 THEN RETURN; END IF;

  -- Plafonner à 4h pour bloquer une session falsifiée
  capped := LEAST(p_seconds, 14400);

  SELECT play_days, bonus_days
    INTO current_days, bonus_arr
    FROM profiles WHERE id = p_id FOR UPDATE;
  IF current_days IS NULL THEN current_days := '[]'::jsonb; END IF;
  IF bonus_arr    IS NULL THEN bonus_arr    := '[]'::jsonb; END IF;

  FOR i IN 0 .. (jsonb_array_length(current_days) - 1) LOOP
    entry := current_days -> i;
    IF (entry->>'date') = today_text THEN
      entry := jsonb_set(
        entry,
        '{playSeconds}',
        to_jsonb(LEAST(86400, (entry->>'playSeconds')::int + capped))
      );
      found := TRUE;
      daily_total := (entry->>'playSeconds')::int;
    END IF;
    new_days := new_days || entry;
  END LOOP;

  IF NOT found THEN
    daily_total := capped;
    new_days := new_days || jsonb_build_object('date', today_text, 'playSeconds', capped);
  END IF;

  -- Bonus : si total quotidien ≥ 5h ET pas déjà attribué pour cette date
  IF daily_total >= bonus_trigger AND NOT (bonus_arr ? today_text) THEN
    award_bonus := TRUE;
    bonus_arr   := bonus_arr || to_jsonb(today_text);
  END IF;

  UPDATE profiles
  SET play_days             = new_days,
      first_play_date       = COALESCE(first_play_date, today_date),
      bonus_days            = bonus_arr,
      diamonds_collected    = COALESCE(diamonds_collected, 0)
                              + (CASE WHEN award_bonus THEN bonus_diamonds ELSE 0 END),
      free_delivery_credits = COALESCE(free_delivery_credits, 0)
                              + (CASE WHEN award_bonus THEN 1 ELSE 0 END),
      updated_at            = NOW()
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  BLOC 4 — RPC atomique : réclamer un menu                    ║
-- ║  Vérifie côté SERVEUR les 3 conditions :                     ║
-- ║   1. ≥ DIAMONDS_PER_MENU 💎 disponibles                      ║
-- ║   2. ≥ 3 jours actifs (≥ 3h chacun)                          ║
-- ║   3. ≥ 4 jours calendaires depuis le 1ᵉʳ jour personnel      ║
-- ║  Retourne TRUE si débloqué + incrémenté atomiquement.        ║
-- ╚══════════════════════════════════════════════════════════════╝

CREATE OR REPLACE FUNCTION claim_menu(p_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  -- Nouvelles règles 2026 : 5 jours consécutifs, 15 000 💎, claim J6
  diamonds_per_menu CONSTANT INTEGER := 15000;
  required_days     CONSTANT INTEGER := 5;
  required_secs     CONSTANT INTEGER := 10800;   -- 3h min/jour
  required_delay    CONSTANT INTEGER := 6;       -- réclame au 6ᵉ jour

  prof           RECORD;
  best_streak    INTEGER := 0;
  days_since     INTEGER;
  menus_avail    INTEGER;
BEGIN
  SELECT diamonds_collected, play_days, first_play_date, menus_claimed
    INTO prof
    FROM profiles
   WHERE id = p_id
    FOR UPDATE;

  IF NOT FOUND OR prof.first_play_date IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Plus longue série de jours CONSÉCUTIFS qualifiants (≥ 3h chacun)
  -- Astuce classique : (date - row_number) constante ⇒ même série.
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

  -- Délai calendaire SERVEUR (immune à la triche d'horloge client)
  days_since := (CURRENT_DATE - prof.first_play_date) + 1;

  -- Menus disponibles
  menus_avail := FLOOR(COALESCE(prof.diamonds_collected, 0) / diamonds_per_menu)
               - COALESCE(prof.menus_claimed, 0);

  -- Toutes les conditions doivent être réunies (5 jours CONSÉCUTIFS)
  IF menus_avail < 1 OR best_streak < required_days OR days_since < required_delay THEN
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
