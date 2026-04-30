-- ═══════════════════════════════════════════════════════════════
--  SAFI RUNNER — Sécurité Supabase Anti-Triche
--  À coller et exécuter dans : Supabase > SQL Editor > New Query
-- ═══════════════════════════════════════════════════════════════


-- ── 1. Activer la sécurité par ligne (RLS) ─────────────────────
--    Seul le propriétaire du profil peut lire/modifier ses données.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;


-- ── 2. Supprimer les anciennes politiques (si elles existent) ──
DROP POLICY IF EXISTS "Users can view own profile"   ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;


-- ── 3. Politiques RLS ───────────────────────────────────────────

-- Lecture : chaque joueur ne voit que son propre profil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Création : on ne peut créer un profil qu'avec son propre uid
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Modification : on ne peut modifier que son propre profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ── 4. Fonction trigger anti-triche ────────────────────────────
--    Valide que l'augmentation de diamants correspond au temps joué.
--    Règle : max 1.8 💎 par seconde + marge de 20 (réseau/clusters).
--    Si quelqu'un essaie d'injecter 5000 💎 via la console → bloqué.

CREATE OR REPLACE FUNCTION validate_diamond_increase()
RETURNS TRIGGER AS $$
DECLARE
  seconds_since_last_save FLOAT;
  max_allowed             FLOAT;
  diamond_increase        INTEGER;
BEGIN

  -- Calculer le temps écoulé depuis la dernière sauvegarde
  IF OLD.updated_at IS NULL THEN
    seconds_since_last_save := 300; -- première save : accorde 5 min par sécurité
  ELSE
    seconds_since_last_save := EXTRACT(EPOCH FROM (NOW() - OLD.updated_at));
  END IF;

  -- Plafond absolu : 1 heure max pour éviter l'overflow
  seconds_since_last_save := LEAST(seconds_since_last_save, 3600);

  -- Max autorisé = temps × 1.8 diamants/s + marge de 20
  max_allowed := (seconds_since_last_save * 1.8) + 20;

  diamond_increase := NEW.diamonds_collected - OLD.diamonds_collected;

  -- Bloquer toute diminution frauduleuse
  IF diamond_increase < 0 THEN
    RAISE EXCEPTION 'Safi Runner : diminution de diamants non autorisée';
  END IF;

  -- Écrêter silencieusement si le gain dépasse le possible
  IF diamond_increase > max_allowed THEN
    NEW.diamonds_collected := OLD.diamonds_collected + FLOOR(max_allowed)::INTEGER;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── 5. Attacher le trigger à la table ──────────────────────────
DROP TRIGGER IF EXISTS anti_cheat_diamonds ON profiles;

CREATE TRIGGER anti_cheat_diamonds
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (NEW.diamonds_collected IS DISTINCT FROM OLD.diamonds_collected)
  EXECUTE FUNCTION validate_diamond_increase();


-- ── 6. Vérification ────────────────────────────────────────────
-- Lance ces requêtes pour confirmer que tout est en place :

-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'profiles';
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';
-- SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'profiles';
