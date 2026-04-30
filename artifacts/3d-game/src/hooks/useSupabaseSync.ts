import { useState, useEffect, useRef, useCallback } from "react";
import { isSupabaseConfigured } from "../lib/supabase";
import { ensureProfile, saveScore, addDiamonds, getProfile } from "../lib/playerProfile";
import type { Profile } from "../lib/supabase";

const AUTOSAVE_INTERVAL = 10000;

export function useSupabaseSync(score: number, phase: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<"connecting" | "ok" | "error" | "offline">(
    isSupabaseConfigured ? "connecting" : "offline"
  );
  const lastSyncedScore = useRef(0);
  const initialized = useRef(false);
  const lastScore = useRef(score);

  useEffect(() => {
    if (!isSupabaseConfigured || initialized.current) return;
    initialized.current = true;

    (async () => {
      try {
        const p = await ensureProfile();
        if (p) {
          setProfile(p);
          setStatus("ok");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("offline");
      }
    })();
  }, []);

  useEffect(() => {
    lastScore.current = score;
  }, [score]);

  useEffect(() => {
    if (!isSupabaseConfigured || (phase !== "playing" && phase !== "checkpoint")) return;

    const interval = setInterval(async () => {
      if (lastScore.current === lastSyncedScore.current) return;
      lastSyncedScore.current = lastScore.current;

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
    if (!isSupabaseConfigured || phase !== "gameover") return;

    (async () => {
      const diamondsToSave = Math.floor(score / 10);
      const sardines = Math.floor(score / 50);
      await saveScore(diamondsToSave, sardines);
      const updated = await getProfile();
      if (updated) setProfile(updated);
    })();
  }, [phase, score]);

  const addTestDiamonds = useCallback(async (count: number) => {
    if (!isSupabaseConfigured) {
      return { success: false, total: 0 };
    }
    setStatus("connecting");
    try {
      const result = await addDiamonds(count);
      if (result) {
        setProfile(result);
        setStatus("ok");
        return { success: true, total: result.diamonds_collected };
      } else {
        setStatus("error");
        return { success: false };
      }
    } catch {
      setStatus("error");
      return { success: false };
    }
  }, []);

  return { profile, status, addTestDiamonds };
}
