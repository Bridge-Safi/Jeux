-- ============================================================
-- Happy Hour ×2 — multiplicateur global de diamants temporaire
-- À exécuter UNE FOIS dans Supabase SQL Editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS app_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
-- Aucune policy : toutes les lectures/écritures passent par les RPC ci-dessous.

-- Code admin par défaut. Tu peux le changer à tout moment via :
--   UPDATE app_settings SET value='TON_NOUVEAU_CODE' WHERE key='admin_secret';
INSERT INTO app_settings(key, value)
VALUES ('admin_secret', 'BRIDGE-SAFI-2026')
ON CONFLICT (key) DO NOTHING;

-- ── Lecture publique : état actuel du Happy Hour ──────────────
CREATE OR REPLACE FUNCTION get_happy_hour()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_until TIMESTAMPTZ;
  v_secs  INT;
BEGIN
  SELECT (value)::TIMESTAMPTZ INTO v_until
  FROM app_settings WHERE key = 'happy_hour_until';

  IF v_until IS NULL OR v_until <= NOW() THEN
    RETURN json_build_object(
      'active', false, 'until', null, 'secondsLeft', 0, 'multiplier', 1
    );
  END IF;

  v_secs := GREATEST(0, EXTRACT(EPOCH FROM (v_until - NOW()))::INT);
  RETURN json_build_object(
    'active', true, 'until', v_until, 'secondsLeft', v_secs, 'multiplier', 2
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_happy_hour() TO anon, authenticated;

-- ── Activation (admin) ────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_happy_hour(p_minutes INT, p_secret TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_secret TEXT;
  v_until  TIMESTAMPTZ;
BEGIN
  SELECT value INTO v_secret FROM app_settings WHERE key = 'admin_secret';
  IF v_secret IS NULL OR p_secret IS DISTINCT FROM v_secret THEN
    RETURN json_build_object('ok', false, 'error', 'invalid_secret');
  END IF;
  IF p_minutes IS NULL OR p_minutes <= 0 OR p_minutes > 480 THEN
    RETURN json_build_object('ok', false, 'error', 'invalid_minutes');
  END IF;

  v_until := NOW() + make_interval(mins => p_minutes);
  INSERT INTO app_settings(key, value, updated_at)
  VALUES ('happy_hour_until', v_until::TEXT, NOW())
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

  RETURN json_build_object('ok', true, 'until', v_until, 'minutes', p_minutes);
END;
$$;

GRANT EXECUTE ON FUNCTION set_happy_hour(INT, TEXT) TO anon, authenticated;

-- ── Arrêt anticipé (admin) ────────────────────────────────────
CREATE OR REPLACE FUNCTION stop_happy_hour(p_secret TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_secret TEXT;
BEGIN
  SELECT value INTO v_secret FROM app_settings WHERE key = 'admin_secret';
  IF v_secret IS NULL OR p_secret IS DISTINCT FROM v_secret THEN
    RETURN json_build_object('ok', false, 'error', 'invalid_secret');
  END IF;

  DELETE FROM app_settings WHERE key = 'happy_hour_until';
  RETURN json_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION stop_happy_hour(TEXT) TO anon, authenticated;
