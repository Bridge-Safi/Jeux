import { useState, useEffect, useCallback } from "react";
import { getBridgeAuth, listenForParentAuth, setBridgeAuthManual, EVENT_NAME, type BridgeAuth } from "../lib/bridgeAuth";
import { navigateInApp } from "../lib/inAppNav";
import { BRIDGE_EATS_URL } from "./GameUI";
import { useT } from "../lib/i18n";
import { LanguageSelector } from "../components/LanguageSelector";

/* Écran de blocage : affiché tant que le joueur n'a pas son auth
   Bridge Eats (email + n°). Un gros bouton renvoie l'utilisateur sur
   Bridge Eats DANS LA MÊME APPLI (postMessage si iframe, même onglet
   sinon — jamais de nouvel onglet). */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { t } = useT();
  const [auth, setAuth] = useState<BridgeAuth | null>(() => getBridgeAuth());
  const [manualOpen, setManualOpen] = useState(false);
  const [manualPhone, setManualPhone] = useState("");
  const [manualErr, setManualErr] = useState(false);

  /* Re-sync si Bridge Eats parent envoie un postMessage avec l'auth. */
  useEffect(() => {
    const sync = () => setAuth(getBridgeAuth());
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener("storage", sync);
    const off = listenForParentAuth((a) => setAuth(a));
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
      off();
    };
  }, []);

  const handleLogin = useCallback(() => {
    /* On signale à Bridge Eats qu'on attend une auth — il pourra
       réembarquer le jeu avec ?email=...&phone=... après login. */
    const url = new URL(BRIDGE_EATS_URL);
    url.searchParams.set("return_to", "safi-runner");
    navigateInApp(url.toString(), "bridge-eats");
  }, []);

  const handleManualSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const a = setBridgeAuthManual(manualPhone);
    if (!a) { setManualErr(true); return; }
    setManualErr(false);
    setAuth(a);
  }, [manualPhone]);

  if (auth) return <>{children}</>;

  return (
    <div style={{
      width: "100vw", height: "100vh", minHeight: "100dvh" as never,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#0d1b2a 0%,#1b263b 50%,#000814 100%)",
      padding: 20, boxSizing: "border-box",
      fontFamily: "'Fredoka', sans-serif",
      position: "relative",
    }}>
      {/* Sélecteur de langue — visible même quand bloqué (FR · EN · AR) */}
      <LanguageSelector position="topRight" />

      <div style={{
        maxWidth: 460, width: "100%",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(14px)",
        border: "2px solid rgba(0,230,118,0.4)",
        borderRadius: 24, padding: "32px 26px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,230,118,0.1) inset",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 12 }} aria-hidden>🔒</div>
        <div style={{
          color: "#00e676", fontSize: 11, fontWeight: 800, letterSpacing: 2,
          textTransform: "uppercase", marginBottom: 8,
        }}>{t("auth.locked.kicker")}</div>
        <div style={{
          color: "#fff", fontSize: 22, fontWeight: 900, marginBottom: 14,
          fontFamily: "'Bangers', sans-serif", letterSpacing: 1,
          textShadow: "0 2px 0 #003311, 0 0 24px rgba(0,230,118,0.4)",
        }}>{t("auth.locked.title")}</div>
        <div style={{
          color: "#cfe9d6", fontSize: 14, lineHeight: 1.55, marginBottom: 22,
        }}>{t("auth.locked.body")}</div>

        <button
          onClick={handleLogin}
          type="button"
          style={{
            display: "block", width: "100%", maxWidth: 340, margin: "0 auto",
            background: "linear-gradient(135deg,#00c853 0%,#00e676 50%,#00c853 100%)",
            color: "#003311", border: "none", borderRadius: 50,
            padding: "16px 24px", fontSize: 16, fontWeight: 900,
            cursor: "pointer", letterSpacing: 1.5, textTransform: "uppercase",
            boxShadow: "0 0 36px rgba(0,230,118,0.55), 0 8px 24px rgba(0,80,40,0.6)",
            transition: "transform 0.1s",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          🛵 {t("auth.locked.cta")}
        </button>

        <div style={{
          color: "#7aa28a", fontSize: 11, marginTop: 20, lineHeight: 1.5,
        }}>{t("auth.locked.why")}</div>

        {/* ─── Plan B : saisie manuelle (déjà connecté à Bridge Eats) ─── */}
        <button
          type="button"
          onClick={() => setManualOpen((v) => !v)}
          style={{
            display: "block", margin: "16px auto 0",
            background: "transparent", border: "none",
            color: "#80cbc4", fontSize: 12, fontWeight: 700,
            textDecoration: "underline", cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {t("auth.manual.toggle")}
        </button>

        {manualOpen && (
          <form onSubmit={handleManualSubmit} style={{
            marginTop: 14,
            background: "rgba(0,30,15,0.6)",
            border: "1px solid rgba(0,230,118,0.25)",
            borderRadius: 14, padding: 14,
            textAlign: "start",
          }}>
            <div style={{
              color: "#00e676", fontSize: 11, fontWeight: 800, letterSpacing: 1.5,
              textTransform: "uppercase", marginBottom: 6, textAlign: "center",
            }}>
              {t("auth.manual.title")}
            </div>
            <div style={{
              color: "#9ec9b3", fontSize: 11, lineHeight: 1.45,
              marginBottom: 10, textAlign: "center",
            }}>
              {t("auth.manual.hint")}
            </div>
            <input
              type="tel"
              value={manualPhone}
              onChange={(e) => { setManualPhone(e.target.value); setManualErr(false); }}
              placeholder={t("auth.manual.phone")}
              autoComplete="tel"
              inputMode="tel"
              required
              autoFocus
              style={{
                width: "100%", boxSizing: "border-box", marginBottom: 10,
                background: "rgba(0,0,0,0.5)", color: "#fff",
                border: `1px solid ${manualErr ? "#ef5350" : "rgba(0,230,118,0.4)"}`,
                borderRadius: 10, padding: "10px 12px", fontSize: 14,
                fontFamily: "inherit", outline: "none",
              }}
            />
            {manualErr && (
              <div style={{ color: "#ef5350", fontSize: 11, marginBottom: 8, textAlign: "center" }}>
                {t("auth.manual.error")}
              </div>
            )}
            <button
              type="submit"
              style={{
                width: "100%",
                background: "linear-gradient(135deg,#00c853 0%,#00e676 50%,#00c853 100%)",
                color: "#003311", border: "none", borderRadius: 50,
                padding: "12px 20px", fontSize: 14, fontWeight: 900,
                cursor: "pointer", letterSpacing: 1.2, textTransform: "uppercase",
                fontFamily: "inherit",
                boxShadow: "0 0 24px rgba(0,230,118,0.4)",
              }}
            >
              ▶ {t("auth.manual.submit")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
