-- ═══════════════════════════════════════════════════════════════
--  SAFI RUNNER — Sécurité Supabase : Anti-Triche + Un compte par appareil
--  À coller et exécuter dans : Supabase > SQL Editor > New Query
--  Exécute les blocs dans l'ordre, un par un si besoin.
-- ═══════════════════════════════════════════════════════════════


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  BLOC 1 — Nouvelles colonnes (empreinte + email unique)      ║
-- ╚══════════════════════════════════════════════════════════════╝

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS device_fingerprint TEXT,
  ADD COLUMN IF NOT EXISTS hardware_prefix    TEXT,
  ADD COLUMN IF NOT EXISTS player_email       TEXT;

-- Un seul email par joueur (comme Bridge Eats)
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_player_email_unique;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_player_email_unique UNIQUE (player_email);

-- Index pour retrouver rapidement un joueur par son appareil
CREATE INDEX IF NOT EXISTS idx_profiles_device_fp ON profiles (device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_profiles_hw_prefix  ON profiles (hardware_prefix);


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  BLOC 2 — Sécurité par ligne (RLS)                           ║
-- ║  Chaque joueur ne peut accéder qu'à son propre profil.       ║
-- ╚══════════════════════════════════════════════════════════════╝

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile"   ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  BLOC 3 — Trigger anti-triche (diamants plafonnés)           ║
-- ║  Même si quelqu'un essaie d'injecter des diamants via        ║
-- ║  la console ou l'API, Supabase bloque automatiquement.       ║
-- ╚══════════════════════════════════════════════════════════════╝

CREATE OR REPLACE FUNCTION validate_diamond_increase()
RETURNS TRIGGER AS $$
DECLARE
  seconds_since FLOAT;
  max_allowed   FLOAT;
  increase      INTEGER;
BEGIN
  -- Temps écoulé depuis la dernière sauvegarde
  IF OLD.updated_at IS NULL THEN
    seconds_since := 300;
  ELSE
    seconds_since := EXTRACT(EPOCH FROM (NOW() - OLD.updated_at));
  END IF;
  seconds_since := LEAST(seconds_since, 3600); -- cap 1h

  -- Plafond : 1.8 💎/seconde + marge de 20
  max_allowed := (seconds_since * 1.8) + 20;

  increase := NEW.diamonds_collected - OLD.diamonds_collected;

  -- Bloquer une diminution (tentative de reset)
  IF increase < 0 THEN
    RAISE EXCEPTION 'Safi Runner : modification non autorisée des diamants';
  END IF;

  -- Écrêter silencieusement les gains impossibles
  IF increase > max_allowed THEN
    NEW.diamonds_collected := OLD.diamonds_collected + FLOOR(max_allowed)::INTEGER;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS anti_cheat_diamonds ON profiles;

CREATE TRIGGER anti_cheat_diamonds
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (NEW.diamonds_collected IS DISTINCT FROM OLD.diamonds_collected)
  EXECUTE FUNCTION validate_diamond_increase();


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  BLOC 4 — Trigger anti-doublon email                         ║
-- ║  Un email ne peut être lié qu'à un seul profil.              ║
-- ╚══════════════════════════════════════════════════════════════╝

CREATE OR REPLACE FUNCTION validate_email_unique()
RETURNS TRIGGER AS $$
DECLARE
  existing_id UUID;
BEGIN
  IF NEW.player_email IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT id INTO existing_id
  FROM profiles
  WHERE player_email = LOWER(TRIM(NEW.player_email))
    AND id <> NEW.id
  LIMIT 1;

  IF existing_id IS NOT NULL THEN
    RAISE EXCEPTION 'Safi Runner : un compte existe déjà avec cet email.';
  END IF;

  -- Normaliser l'email en minuscules
  NEW.player_email := LOWER(TRIM(NEW.player_email));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS anti_cheat_email ON profiles;

CREATE TRIGGER anti_cheat_email
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  WHEN (NEW.player_email IS NOT NULL)
  EXECUTE FUNCTION validate_email_unique();


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  VÉRIFICATION — Lance ça après pour confirmer                ║
-- ╚══════════════════════════════════════════════════════════════╝

-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'profiles';
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';
-- SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'profiles';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles';
