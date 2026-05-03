-- ════════════════════════════════════════════════════════════════
-- REMISE À ZÉRO GLOBALE — Safi Runner / Bridge Shark
-- ────────────────────────────────────────────────────────────────
-- Efface TOUS les comptes joueurs (email, téléphone, diamants,
-- jours joués, menus réclamés, device fingerprint…).
--
-- ⚠️  IRRÉVERSIBLE — toutes les progressions seront perdues.
--
-- Comment l'exécuter :
--   1. Ouvrir le projet Supabase dans un navigateur
--   2. SQL Editor → New query
--   3. Coller ce script entier puis cliquer "Run"
-- ════════════════════════════════════════════════════════════════

-- Vide la table principale des joueurs.
TRUNCATE TABLE public.profiles RESTART IDENTITY CASCADE;

-- Au cas où d'autres tables référencent profiles, CASCADE les vide
-- automatiquement. Si tu as des tables annexes (par ex. claims,
-- play_days, redemptions), décommente les lignes ci-dessous :
-- TRUNCATE TABLE public.claims        RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE public.play_days     RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE public.redemptions   RESTART IDENTITY CASCADE;

-- Vérification
SELECT COUNT(*) AS remaining_profiles FROM public.profiles;
-- Doit retourner 0.
