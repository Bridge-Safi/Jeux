-- ─────────────────────────────────────────────────────────────
-- CLASSEMENT TOP 7 — fenêtre glissante de 3 JOURS
-- À EXÉCUTER UNE FOIS dans Supabase SQL Editor.
--
-- Ajoute deux colonnes à `profiles` :
--   • period_diamonds : 💎 collectés DANS LE CYCLE EN COURS
--   • period_start    : date du début du cycle de 3 jours (ISO YYYY-MM-DD)
--
-- Logique côté client (saveScore) :
--   - Calcule le début du cycle courant (ancrage fixe = 2026-01-01,
--     pas de 3 jours).
--   - Si profile.period_start ≠ cycle courant → on RESET period_diamonds
--     à la valeur de la session, on met period_start = cycle courant.
--   - Sinon → on incrémente period_diamonds.
--
-- Le classement TOP 7 ne montre que les profils dont
-- period_start = cycle courant, triés par period_diamonds DESC.
-- ─────────────────────────────────────────────────────────────

BEGIN;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS period_diamonds INTEGER NOT NULL DEFAULT 0;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS period_start DATE;

-- Index pour accélérer la requête du classement (filtre par cycle + tri)
CREATE INDEX IF NOT EXISTS idx_profiles_period
  ON profiles (period_start, period_diamonds DESC);

COMMIT;
