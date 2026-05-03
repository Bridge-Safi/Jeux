-- ════════════════════════════════════════════════════════════════════
-- FUSION DES PROFILS EN DOUBLE — Safi Runner
-- ════════════════════════════════════════════════════════════════════
-- Pour chaque bridge_phone qui apparaît dans plusieurs profils :
--   • on garde le profil le plus récent (updated_at DESC) comme
--     "canonique" — c'est celui dont l'auth.users.id est utilisé par
--     l'appareil actuellement connecté.
--   • on additionne diamonds_collected + sardines_points de tous les
--     doublons dans le canonique.
--   • on prend MIN(first_play_date), MAX(menus_claimed),
--     MAX(free_delivery_credits) — c'est l'état le plus avancé.
--   • on fusionne play_days (somme des secondes par date) et
--     bonus_days (union des dates).
--   • on supprime les autres lignes.
--
-- Idempotent : sans effet si plus aucun doublon n'existe.
-- À exécuter dans Supabase → SQL Editor → Run.
-- ════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. Aperçu AVANT (pour info) ────────────────────────────────────
SELECT '── AVANT ──' AS step;
SELECT bridge_phone, COUNT(*) AS nb_profils,
       SUM(diamonds_collected) AS total_diamants,
       SUM(sardines_points)    AS total_sardines
FROM profiles
WHERE bridge_phone IS NOT NULL
GROUP BY bridge_phone
HAVING COUNT(*) > 1
ORDER BY bridge_phone;

-- ── 2. Identifie le profil canonique pour chaque numéro en double ──
CREATE TEMP TABLE merge_plan ON COMMIT DROP AS
SELECT
  bridge_phone,
  (array_agg(id ORDER BY updated_at DESC NULLS LAST, created_at DESC))[1] AS keep_id,
  SUM(diamonds_collected)          AS total_diamonds,
  SUM(sardines_points)             AS total_sardines,
  MIN(first_play_date)             AS first_play_date,
  MAX(COALESCE(menus_claimed, 0))  AS menus_claimed,
  MAX(COALESCE(free_delivery_credits, 0)) AS free_delivery_credits
FROM profiles
WHERE bridge_phone IS NOT NULL
GROUP BY bridge_phone
HAVING COUNT(*) > 1;

-- ── 3. Fusionne play_days (somme par date) ─────────────────────────
CREATE TEMP TABLE play_days_merged ON COMMIT DROP AS
SELECT bridge_phone,
       jsonb_agg(
         jsonb_build_object('date', d, 'playSeconds', secs)
         ORDER BY d
       ) AS play_days
FROM (
  SELECT p.bridge_phone,
         (elem->>'date') AS d,
         SUM((elem->>'playSeconds')::int) AS secs
  FROM profiles p
       JOIN merge_plan mp ON mp.bridge_phone = p.bridge_phone,
       LATERAL jsonb_array_elements(COALESCE(p.play_days, '[]'::jsonb)) elem
  WHERE elem->>'date' IS NOT NULL
  GROUP BY p.bridge_phone, (elem->>'date')
) sub
GROUP BY bridge_phone;

-- ── 4. Fusionne bonus_days (union des dates) ───────────────────────
CREATE TEMP TABLE bonus_days_merged ON COMMIT DROP AS
SELECT bridge_phone,
       jsonb_agg(DISTINCT d ORDER BY d) AS bonus_days
FROM (
  SELECT p.bridge_phone, day_value::text AS d
  FROM profiles p
       JOIN merge_plan mp ON mp.bridge_phone = p.bridge_phone,
       LATERAL jsonb_array_elements_text(COALESCE(p.bonus_days, '[]'::jsonb)) day_value
) sub
GROUP BY bridge_phone;

-- ── 5. Met à jour le profil canonique avec les totaux fusionnés ────
UPDATE profiles p
SET diamonds_collected    = mp.total_diamonds,
    sardines_points       = mp.total_sardines,
    first_play_date       = mp.first_play_date,
    menus_claimed         = mp.menus_claimed,
    free_delivery_credits = mp.free_delivery_credits,
    play_days             = COALESCE(pdm.play_days, p.play_days),
    bonus_days            = COALESCE(bdm.bonus_days, p.bonus_days),
    updated_at            = NOW()
FROM merge_plan mp
LEFT JOIN play_days_merged  pdm ON pdm.bridge_phone = mp.bridge_phone
LEFT JOIN bonus_days_merged bdm ON bdm.bridge_phone = mp.bridge_phone
WHERE p.id = mp.keep_id;

-- ── 6. Supprime les doublons ───────────────────────────────────────
DELETE FROM profiles
WHERE bridge_phone IN (SELECT bridge_phone FROM merge_plan)
  AND id NOT IN (SELECT keep_id FROM merge_plan);

-- ── 7. Aperçu APRÈS ────────────────────────────────────────────────
SELECT '── APRÈS ──' AS step;
SELECT bridge_phone, username,
       diamonds_collected, sardines_points,
       menus_claimed, first_play_date, updated_at
FROM profiles
WHERE bridge_phone IN (SELECT bridge_phone FROM merge_plan)
ORDER BY bridge_phone;

COMMIT;
