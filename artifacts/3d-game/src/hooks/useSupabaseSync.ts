import { useState, useEffect, useRef, useCallback } from "react";
import { ensureProfile, saveScore, addDiamonds, getProfile, type Profile } from "../lib/playerProfile";

const AUTOSAVE_INTERVAL = 10000;

export function useSupabaseSync(score: number, phase: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<"connecting" | "ok" | "error" | "offline">("connecting");
  const lastSyncedScore = useRef(0);
  const sessionDiamonds = useRef(0);
  const initialized = useRef(false);
  const lastScore = useRef(score);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      try {
        const p = await ensureProfile();
        if (p) {
          setProfile(p);
          setStatus("ok");
          console.log("✅ Supabase connecté. Profil:", p);
        } else {
          setStatus("error");
          console.warn("⚠️ Profil Supabase non disponible.");
        }
      } catch {
        setStatus("offline");
      }
    })();
  }, []);

  useEffect(() => {
    const added = score - lastScore.current;
    lastScore.current = score;
    if (added > 0) {
      sessionDiamonds.current += Math.floor(added / 10);
    }
  }, [score]);

  useEffect(() => {
    if (phase !== "playing" && phase !== "checkpoint") return;

    const interval = setInterval(async () => {
      if (sessionDiamonds.current === lastSyncedScore.current) return;
      const toSync = sessionDiamonds.current;
      lastSyncedScore.current = toSync;

      try {
        const updated = await getProfile();
        if (updated) {
          setProfile(updated);
          setStatus("ok");
        }
      } catch {
        setStatus("offline");
      }
    }, AUTOSAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== "gameover") return;

    (async () => {
      const diamondsToSave = Math.floor(score / 10);
      const sardines = Math.floor(score / 50);
      await saveScore(diamondsToSave, sardines);
      const updated = await getProfile();
      if (updated) setProfile(updated);
    })();
  }, [phase, score]);

  const addTestDiamonds = useCallback(async (count: number) => {
    setStatus("connecting");
    try {
      const result = await addDiamonds(count);
      if (result) {
        setProfile(result);
        setStatus("ok");
        console.log(`✅ +${count} diamants ajoutés. Total:`, result.diamonds_collected);
        return { success: true, total: result.diamonds_collected };
      } else {
        setStatus("error");
        return { success: false };
      }
    } catch (err) {
      setStatus("error");
      console.error("addTestDiamonds error:", err);
      return { success: false };
    }
  }, []);

  return { profile, status, addTestDiamonds };
}
