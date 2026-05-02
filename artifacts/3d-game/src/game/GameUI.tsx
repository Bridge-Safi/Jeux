import { useState, useCallback, useEffect, useRef } from "react";
import type { GamePhase } from "./useGameState";
import {
  registerBridgePhone,
  markMenuClaimed,
  getMenuEligibility,
  shortfallDh,
  DIAMONDS_PER_MENU,
  DIAMONDS_PER_DIRHAM,
  REQUIRED_PLAY_DAYS,
  REQUIRED_SECONDS_PER_DAY,
  type MenuEligibility,
} from "../lib/playerProfile";
import type { Profile } from "../lib/supabase";
import { useT, formatNum, t as tStatic } from "../lib/i18n";

/* ─── Configuration Bridge Eats ─────────────────────────────── */
export const BRIDGE_EATS_URL = "https://44474adc-9074-4015-a3b9-4e111cb8be39-00-11nld147gir6y.kirk.replit.dev/";
export { DIAMONDS_PER_MENU };

/* Construit l'URL Bridge Eats avec les paramètres de complément 💎.
   Bridge Eats peut lire ces query params côté serveur pour afficher
   directement la page de paiement (action=topup_diamonds, missing, dh). */
function buildShortfallUrl(missing: number, dh: number): string {
  try {
    const u = new URL(BRIDGE_EATS_URL);
    u.searchParams.set("action", "topup_diamonds");
    u.searchParams.set("missing", String(missing));
    u.searchParams.set("dh", String(dh));
    u.searchParams.set("rate", `1dh_per_${DIAMONDS_PER_DIRHAM}`);
    return u.toString();
  } catch {
    return BRIDGE_EATS_URL;
  }
}

/* ─── Types ──────────────────────────────────────────────────── */
interface GameUIProps {
  phase: GamePhase;
  score: number;
  checkpointNumber: number;
  nextCheckpointAt: number;
  playTime: number;
  profile: Profile | null;        // profil Supabase complet (peut être null en hors-ligne)
  onStart: () => void;
  onRestart: () => void;
  onChangeLane: (dir: 1 | -1) => void;
  onJump: () => void;
}

/* ─── Bouton NFS Mobile — glass, glow néon, anti-double-tap ─── */
function NFSButton({ icon, onClick, glow, size = 76, accent = "#00f0ff" }: {
  icon: string; onClick: () => void; glow: string; size?: number; accent?: string;
}) {
  const [pressed, setPressed] = useState(false);
  const lastFireRef = useRef(0);

  const handleDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastFireRef.current < 60) return;
    lastFireRef.current = now;
    setPressed(true);
    onClick();
  }, [onClick]);

  const handleUp = useCallback(() => setPressed(false), []);

  return (
    <button
      onPointerDown={handleDown}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      onPointerLeave={handleUp}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        width: size, height: size, borderRadius: "50%",
        border: `2px solid ${accent}aa`,
        background: pressed
          ? `radial-gradient(circle at 50% 50%, ${glow}cc, rgba(10,10,30,0.85) 70%)`
          : `radial-gradient(circle at 50% 50%, rgba(10,10,30,0.6), rgba(10,10,30,0.85) 70%)`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        color: accent, fontSize: size * 0.5, fontWeight: 900,
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: pressed
          ? `inset 0 0 24px ${accent}88, 0 0 30px ${accent}aa, 0 0 50px ${glow}66`
          : `inset 0 0 12px ${accent}33, 0 0 18px ${accent}44, 0 4px 14px rgba(0,0,0,0.6)`,
        transform: pressed ? "scale(0.92)" : "scale(1)",
        transition: "transform 0.08s ease, box-shadow 0.08s ease, background 0.1s",
        userSelect: "none", WebkitUserSelect: "none",
        touchAction: "manipulation",
        textShadow: `0 0 12px ${accent}, 0 0 24px ${glow}`,
        fontFamily: "'Bangers', sans-serif",
      }}
    >
      <span style={{ lineHeight: 1, marginTop: -2 }}>{icon}</span>
    </button>
  );
}

/* ─── WhatsApp Bridge Eats — modifiable ──────────────────────────
   Numéro WhatsApp Business à atteindre depuis le jeu (format international
   sans + ni espaces, conformément à wa.me). À remplacer par le vrai n°. */
export const BRIDGE_EATS_WHATSAPP = "212764794856";
const WA_PREFILL = encodeURIComponent(
  "Salam ! J'arrive depuis le jeu Safi Runner 🦈🎮"
);
export const WHATSAPP_URL = `https://wa.me/${BRIDGE_EATS_WHATSAPP}?text=${WA_PREFILL}`;

/* ─── Cluster de boutons flottants TOUJOURS visibles ──────────
   Position : haut-droite, fixé à l'écran, par-dessus le canvas 3D
   et toutes les UIs. 2 raccourcis : Bridge Eats + WhatsApp. */
function FloatingActions() {
  const baseBtn: React.CSSProperties = {
    width: 52, height: 52, borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.3)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 26, cursor: "pointer", textDecoration: "none",
    boxShadow: "0 6px 18px rgba(0,0,0,0.45)",
    transition: "transform 0.15s, box-shadow 0.15s",
    backdropFilter: "blur(8px)",
  };
  return (
    <div
      style={{
        position: "fixed",
        top: "max(12px, env(safe-area-inset-top, 12px))",
        right: "max(12px, env(safe-area-inset-right, 12px))",
        display: "flex", flexDirection: "column", gap: 10,
        zIndex: 9999,
        pointerEvents: "auto",
      }}
    >
      <a
        href={BRIDGE_EATS_URL}
        title="Bridge Eats"
        aria-label="Ouvrir Bridge Eats"
        style={{ ...baseBtn, background: "linear-gradient(135deg,#b71c1c,#e53935)", color: "#fff" }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        <span aria-hidden>🛵</span>
      </a>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp Bridge Eats"
        aria-label="Contacter sur WhatsApp"
        style={{ ...baseBtn, background: "linear-gradient(135deg,#25d366,#128c7e)", color: "#fff" }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        <span aria-hidden>💬</span>
      </a>
    </div>
  );
}

/* ─── Bouton Bridge Eats ─────────────────────────────────────── */
function BridgeEatsButton({ variant = "light" }: { variant?: "light" | "dark" }) {
  const isDark = variant === "dark";
  return (
    <a
      href={BRIDGE_EATS_URL}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: isDark
          ? "linear-gradient(135deg,#b71c1c,#e53935)"
          : "linear-gradient(135deg,rgba(0,0,0,0.6),rgba(20,20,40,0.8))",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.2)",
        color: "#fff",
        borderRadius: 30,
        padding: "10px 20px",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        textDecoration: "none",
        letterSpacing: 0.5,
        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        transition: "transform 0.1s",
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
    >
      <span style={{ fontSize: 16 }}>🛵🚕</span>
      <span>Bridge</span>
    </a>
  );
}

/* ─── Helpers d'affichage ────────────────────────────────────── */
function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return tStatic("bridge.timeRemaining.done");
  const m = Math.ceil(seconds / 60);
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rest = m % 60;
    return tStatic("bridge.timeRemaining.hours", {
      h,
      rest: rest > 0 ? String(rest).padStart(2, "0") : "",
    });
  }
  return tStatic("bridge.timeRemaining.minutes", { m });
}

/* ─── Carte progression Bridge complète (3 critères visibles) ─ */
function EngagementCard({ eligibility, compact = false }: {
  eligibility: MenuEligibility; compact?: boolean;
}) {
  const { t } = useT();
  const {
    qualifyingDays, daysSinceFirstPlay, todaySecondsRemaining,
    diamondsCollected, menusAvailable,
  } = eligibility;

  const diamondPct = Math.min(100, ((diamondsCollected % DIAMONDS_PER_MENU) / DIAMONDS_PER_MENU) * 100);
  const dayPct     = Math.min(100, (qualifyingDays / REQUIRED_PLAY_DAYS) * 100);

  /* Si menu déjà disponible : look vert glorieux */
  if (menusAvailable > 0) {
    return (
      <div style={{
        background: "linear-gradient(135deg,rgba(0,80,0,0.85),rgba(0,140,0,0.7))",
        border: "1.5px solid #4caf50",
        borderRadius: compact ? 14 : 18,
        padding: compact ? "10px 14px" : "14px 18px",
        boxShadow: "0 0 24px #4caf5066",
      }}>
        <div style={{ color: "#fff", fontSize: compact ? 12 : 14, fontWeight: 800, marginBottom: 4 }}>
          {t(menusAvailable > 1 ? "bridge.menusReadyPlural" : "bridge.menusReady", { n: menusAvailable })}
        </div>
        <div style={{ color: "#c8e6c9", fontSize: compact ? 10 : 12 }}>
          {t("bridge.claimHint")}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "linear-gradient(135deg,rgba(0,30,15,0.88),rgba(0,60,30,0.85))",
      backdropFilter: "blur(10px)",
      border: "1.5px solid rgba(0,230,118,0.45)",
      borderRadius: compact ? 12 : 16,
      padding: compact ? "8px 12px" : "12px 16px",
      minWidth: compact ? 200 : 0,
      boxShadow: "0 4px 20px rgba(0,200,80,0.25), 0 0 0 1px rgba(0,230,118,0.15) inset",
    }}>
      <div style={{ color: "#00e676", fontSize: compact ? 10 : 12, fontWeight: 800, marginBottom: 8, letterSpacing: 0.5 }}>
        {t("bridge.programTitle")}
      </div>

      {/* Critère 1 : Diamants */}
      <div style={{ marginBottom: 7 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: compact ? 9 : 11, marginBottom: 3 }}>
          <span style={{ color: "#fff" }}>{t("bridge.diamonds")}</span>
          <span style={{ color: "#ffd54f", fontWeight: 700 }} dir="ltr">
            {formatNum(diamondsCollected)} / {formatNum(DIAMONDS_PER_MENU)}
          </span>
        </div>
        <div style={{ height: compact ? 5 : 6, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${diamondPct}%`,
            background: "linear-gradient(90deg,#00c853,#00e676,#69f0ae)",
            transition: "width 0.5s",
            boxShadow: "0 0 10px rgba(0,230,118,0.6)",
          }} />
        </div>
      </div>

      {/* Critère 2 : Jours consécutifs (3-4h) */}
      <div style={{ marginBottom: 7 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: compact ? 9 : 11, marginBottom: 3 }}>
          <span style={{ color: "#fff" }}>{t("bridge.activeDays")}</span>
          <span style={{ color: "#69f0ae", fontWeight: 700 }} dir="ltr">{qualifyingDays} / {REQUIRED_PLAY_DAYS}</span>
        </div>
        <div style={{ height: compact ? 5 : 6, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${dayPct}%`,
            background: "linear-gradient(90deg,#1b5e20,#4caf50,#a5d6a7)",
            transition: "width 0.5s",
          }} />
        </div>
      </div>

      {/* Critère 3 : aujourd'hui */}
      <div style={{
        fontSize: compact ? 9 : 11, color: "#a5d6a7",
        background: "rgba(0,0,0,0.35)", borderRadius: 6,
        padding: "4px 8px", textAlign: "center", marginTop: 6,
        border: "1px solid rgba(0,230,118,0.15)",
      }}>
        {t("bridge.todayLabel", { time: formatTimeRemaining(todaySecondsRemaining) })}
        {daysSinceFirstPlay > 0 && (
          <span style={{ color: "#888", marginInlineStart: 6 }}>· {t("bridge.dayBadge", { n: daysSinceFirstPlay })}</span>
        )}
      </div>
    </div>
  );
}

/* ─── HUD en jeu ─────────────────────────────────────────────── */
function HUD({ score, checkpointNumber, playTime, nextCheckpointAt, eligibility }: {
  score: number; checkpointNumber: number; playTime: number;
  nextCheckpointAt: number; eligibility: MenuEligibility;
}) {
  const { t } = useT();
  const timeToNext = Math.max(0, Math.ceil(nextCheckpointAt - playTime));
  const progress = Math.min(1, (40 - timeToNext) / 40);
  const sessionDiamonds = Math.floor(score / 10);

  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0,
      padding: "12px 14px 0",
      display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8,
      pointerEvents: "none",
    }}>
      {/* Diamants session */}
      <div style={{
        background: "linear-gradient(135deg,rgba(0,0,0,0.8),rgba(10,20,60,0.85))",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(100,180,255,0.3)",
        borderRadius: 16, padding: "8px 16px",
        display: "flex", alignItems: "center", gap: 8, minWidth: 110,
        boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
      }}>
        <span style={{ fontSize: 26 }}>🪙</span>
        <div>
          <div style={{ color: "#90caf9", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Fredoka', sans-serif" }}>{t("hud.coins")}</div>
          <div style={{ color: "#ffd54f", fontSize: 28, fontWeight: 900, lineHeight: 1, textShadow: "0 2px 0 #1a1a1a, 0 0 18px #ffa726", fontFamily: "'Bangers', sans-serif", letterSpacing: 1 }}>{sessionDiamonds}</div>
        </div>
      </div>

      {/* Barre checkpoint */}
      <div style={{
        flex: 1, maxWidth: 220,
        background: "linear-gradient(135deg,rgba(0,0,0,0.8),rgba(30,10,0,0.85))",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,140,0,0.35)",
        borderRadius: 14, padding: "8px 14px", textAlign: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
      }}>
        <div style={{ color: "#ffa726", fontSize: 10, fontWeight: 700, letterSpacing: 0.8, marginBottom: 5 }}>
          {t("hud.nextStop", { s: timeToNext })}
        </div>
        <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 6, overflow: "hidden", border: "1px solid rgba(255,140,0,0.2)" }}>
          <div style={{
            height: "100%", width: `${progress * 100}%`,
            background: "linear-gradient(90deg,#ff6f00,#ffd54f)",
            borderRadius: 6, transition: "width 0.4s", boxShadow: "0 0 8px #ff8f00",
          }} />
        </div>
      </div>

      {/* Score */}
      <div style={{
        background: "linear-gradient(135deg,rgba(0,0,0,0.8),rgba(20,30,5,0.85))",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(100,220,80,0.3)",
        borderRadius: 16, padding: "8px 14px", textAlign: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
      }}>
        <div style={{ color: "#a5d6a7", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Fredoka', sans-serif" }}>{t("hud.score")}</div>
        <div style={{ color: "#fff", fontSize: 26, fontWeight: 900, lineHeight: 1.1, textShadow: "0 2px 0 #1a1a1a, 0 0 12px #66bb6a", fontFamily: "'Bangers', sans-serif", letterSpacing: 1 }}>{score}</div>
        {checkpointNumber > 0 && (
          <div style={{ color: "#ffd54f", fontSize: 10, marginTop: 2 }}>🏁 ×{checkpointNumber}</div>
        )}
      </div>

      {/* Carte engagement Bridge — en bas à gauche pendant le jeu */}
      {eligibility.diamondsCollected > 0 && (
        <div style={{
          position: "absolute",
          bottom: -110,
          left: 14,
          pointerEvents: "none",
        }}>
          <EngagementCard eligibility={eligibility} compact />
        </div>
      )}
    </div>
  );
}

/* ─── Zone SWIPE invisible plein écran — gestes NFS Mobile ─── */
function SwipeArea({ onChangeLane, onJump }: {
  onChangeLane: (dir: 1 | -1) => void; onJump: () => void;
}) {
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const firedRef = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    startRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    firedRef.current = false;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!startRef.current || firedRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);
    if (adx > 35 && adx > ady * 1.2) {
      firedRef.current = true;
      onChangeLane(dx > 0 ? 1 : -1);
    } else if (-dy > 35 && ady > adx * 1.2) {
      firedRef.current = true;
      onJump();
    }
  }, [onChangeLane, onJump]);

  const handlePointerUp = useCallback(() => { startRef.current = null; }, []);

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: "absolute", top: 80, bottom: 130,
        left: 0, right: 0, zIndex: 10,
        touchAction: "none", pointerEvents: "auto",
      }}
    />
  );
}

/* ─── Contrôles NFS Mobile : boutons glass + swipe ─────────── */
function TouchControls({ onChangeLane, onJump }: {
  onChangeLane: (dir: 1 | -1) => void; onJump: () => void;
}) {
  return (
    <>
      <SwipeArea onChangeLane={onChangeLane} onJump={onJump} />
      <div dir="ltr" style={{
        position: "absolute", bottom: 22, left: 0, right: 0,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 24px", pointerEvents: "none", zIndex: 20,
      }}>
        <div style={{ pointerEvents: "auto" }}>
          <NFSButton icon="‹" glow="#00f0ff" accent="#00f0ff" onClick={() => onChangeLane(-1)} />
        </div>
        <div style={{ pointerEvents: "auto" }}>
          <NFSButton icon="▲" glow="#ffd700" accent="#ffd700" size={88} onClick={onJump} />
        </div>
        <div style={{ pointerEvents: "auto" }}>
          <NFSButton icon="›" glow="#ff1493" accent="#ff1493" onClick={() => onChangeLane(1)} />
        </div>
      </div>
      <div style={{
        position: "absolute", bottom: 130, left: 0, right: 0,
        textAlign: "center", fontSize: 11,
        color: "rgba(255,255,255,0.5)", letterSpacing: 1.5,
        fontWeight: 600, pointerEvents: "none", zIndex: 15,
        textShadow: "0 0 10px rgba(0,0,0,0.8)",
        animation: "fadeOutSwipe 8s forwards",
      }}>
        {tStatic("controls.swipeHint")}
      </div>
      <style>{`@keyframes fadeOutSwipe{0%,70%{opacity:1}100%{opacity:0}}`}</style>
    </>
  );
}

/* ─── Overlay réclamation menu (téléphone Bridge) ─────────────
   Affiche soit :
     - "Pas encore éligible" + critères restants
     - "Réclame ton menu" + champ tél + bouton
   ─────────────────────────────────────────────────────────────── */
function MenuUnlockOverlay({ eligibility, onClose }: {
  eligibility: MenuEligibility; onClose: () => void;
}) {
  const { t } = useT();
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "done">("phone");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const canClaim = eligibility.eligible;

  /* Les codes d'erreur retournés par playerProfile sont des clés i18n
     ("claim.phone.invalid", "claim.error.generic", ...). On essaie de
     les traduire ; si ce n'est pas une clé connue, on garde le texte tel quel. */
  const localizeErr = (raw?: string): string => {
    if (!raw) return t("claim.error.generic");
    const translated = t(raw);
    return translated === raw && !raw.includes(".") ? raw : translated;
  };

  const handleClaim = async () => {
    const trimmed = phone.trim();
    if (!trimmed) {
      setErrMsg(t("claim.phone.empty"));
      return;
    }
    setLoading(true); setErrMsg("");
    const reg = await registerBridgePhone(trimmed);
    if (!reg.success) {
      setLoading(false);
      setErrMsg(localizeErr(reg.error));
      return;
    }
    /* Téléphone OK → on consomme un menu */
    const claim = await markMenuClaimed();
    setLoading(false);
    if (!claim.success) {
      setErrMsg(localizeErr(claim.error));
      return;
    }
    setStep("done");
  };

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: canClaim
        ? "radial-gradient(ellipse at center,rgba(0,70,0,0.97) 0%,rgba(0,20,0,0.99) 100%)"
        : "radial-gradient(ellipse at center,rgba(40,20,0,0.97) 0%,rgba(15,5,0,0.99) 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      zIndex: 200, pointerEvents: "auto",
      animation: "fadeIn 0.4s ease",
      overflowY: "auto",
      padding: "20px 0",
    }}>
      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes bounce{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
        .phone-input::placeholder{color:#aaa}
      `}</style>

      <div style={{ textAlign: "center", padding: "0 28px", maxWidth: 420, width: "100%" }}>
        {canClaim ? (
          <>
            <div style={{ fontSize: 80, marginBottom: 8, animation: "bounce 1.2s infinite" }}>🎉</div>
            <div style={{
              fontSize: 32, fontWeight: 900, color: "#fff",
              textShadow: "0 0 30px #4caf50",
              letterSpacing: 2, marginBottom: 6, lineHeight: 1.1,
              whiteSpace: "pre-line",
            }}>
              {t("claim.unlocked.title")}
            </div>
            <div style={{ color: "#a5d6a7", fontSize: 13, marginBottom: 18 }}>
              {t(eligibility.qualifyingDays > 1 ? "claim.unlocked.body" : "claim.unlocked.daySingular", {
                days: eligibility.qualifyingDays,
                diamonds: formatNum(eligibility.diamondsCollected),
              })}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 70, marginBottom: 8 }}>⏳</div>
            <div style={{
              fontSize: 26, fontWeight: 900, color: "#ffa726",
              textShadow: "0 0 28px #ff6f00",
              letterSpacing: 1.5, marginBottom: 6, lineHeight: 1.15,
            }}>
              {t("claim.notReady.title")}
            </div>
            <div style={{ color: "#ffcc80", fontSize: 13, marginBottom: 18 }}>
              {eligibility.blocker ? t(eligibility.blocker.key, { n: formatNum(eligibility.blocker.n) }) : ""}
            </div>
            <div style={{ marginBottom: 18 }}>
              <EngagementCard eligibility={eligibility} />
            </div>

            {/* Complément payant : 1 DH = 1 000 💎 manquants.
                Visible uniquement quand le blocage vient des 💎. */}
            {eligibility.blocker?.key === "blocker.diamonds" && (() => {
              const miss = eligibility.blocker.n;
              const dh = shortfallDh(miss);
              if (dh <= 0) return null;
              return (
                <div style={{
                  background: "linear-gradient(135deg,rgba(76,175,80,0.18),rgba(56,142,60,0.28))",
                  border: "1.5px solid rgba(102,187,106,0.6)",
                  borderRadius: 16, padding: "14px 16px",
                  marginBottom: 18, textAlign: "start",
                  boxShadow: "0 0 24px rgba(76,175,80,0.25)",
                }}>
                  <div style={{ color: "#a5d6a7", fontWeight: 800, fontSize: 14, marginBottom: 6 }}>
                    {t("shortfall.title")}
                  </div>
                  <div style={{ color: "#e0f2e0", fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}>
                    {t("shortfall.body", { miss: formatNum(miss), dh: formatNum(dh) })}
                  </div>
                  <a
                    href={buildShortfallUrl(miss, dh)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block", textAlign: "center",
                      background: "linear-gradient(135deg,#2e7d32,#66bb6a)",
                      color: "#fff", borderRadius: 50,
                      padding: "13px 18px", fontSize: 15, fontWeight: 900,
                      textDecoration: "none", letterSpacing: 1,
                      boxShadow: "0 0 24px rgba(76,175,80,0.55)",
                      marginBottom: 8,
                    }}
                  >
                    {t("shortfall.cta", { dh: formatNum(dh) })}
                  </a>
                  <div style={{ color: "#aaa", fontSize: 10, lineHeight: 1.5 }}>
                    {t("shortfall.help")}
                  </div>
                </div>
              );
            })()}
          </>
        )}

        {step === "phone" && canClaim && (
          <>
            <div style={{
              background: "rgba(0,0,0,0.4)", border: "1px solid rgba(76,175,80,0.4)",
              borderRadius: 14, padding: "14px 16px", marginBottom: 18, textAlign: "left",
            }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                {t("claim.phone.label")}
              </div>
              <div style={{ color: "#aaa", fontSize: 11, lineHeight: 1.6 }}>
                {t("claim.phone.help")}
              </div>
            </div>

            <input
              className="phone-input"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              dir="ltr"
              value={phone}
              onChange={e => { setPhone(e.target.value); setErrMsg(""); }}
              placeholder={t("claim.phone.placeholder")}
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12,
                border: errMsg ? "2px solid #f44336" : "2px solid rgba(76,175,80,0.5)",
                background: "rgba(0,0,0,0.6)", color: "#fff",
                fontSize: 15, marginBottom: 8, boxSizing: "border-box",
                outline: "none", letterSpacing: 1,
              }}
              onKeyDown={e => { if (e.key === "Enter") handleClaim(); }}
            />

            {errMsg && (
              <div style={{ color: "#ef9a9a", fontSize: 12, marginBottom: 10 }}>{errMsg}</div>
            )}

            <button
              onClick={handleClaim}
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "#555" : "linear-gradient(135deg,#2e7d32,#66bb6a)",
                color: "#fff", border: "none", borderRadius: 50,
                padding: "16px", fontSize: 17, fontWeight: 900,
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: 1, marginBottom: 12,
                boxShadow: loading ? "none" : "0 0 30px #4caf5077",
              }}
            >
              {loading ? t("claim.button.checking") : t("claim.button.claim")}
            </button>

            <button onClick={onClose} style={{
              background: "transparent", color: "#888",
              border: "none", fontSize: 12, cursor: "pointer",
            }}>
              {t("claim.button.continue")}
            </button>
          </>
        )}

        {step === "done" && (
          <>
            <div style={{
              background: "rgba(0,0,0,0.45)", border: "1px solid #4caf50",
              borderRadius: 14, padding: "16px", marginBottom: 22,
            }}>
              <div style={{ color: "#4caf50", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                {t("claim.done.title")}
              </div>
              <div style={{ color: "#ccc", fontSize: 12 }}>
                {t("claim.done.body")}
              </div>
            </div>

            <a
              href={BRIDGE_EATS_URL}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: "linear-gradient(135deg,#2e7d32,#66bb6a)",
                color: "#fff", borderRadius: 50,
                padding: "18px 44px", fontSize: 18, fontWeight: 900,
                textDecoration: "none", letterSpacing: 2,
                boxShadow: "0 0 40px #4caf5088",
                marginBottom: 14,
              }}
            >
              {t("claim.done.cta")}
            </a>
            <br />
            <button onClick={onClose} style={{
              background: "transparent", color: "#888",
              border: "none", fontSize: 12, cursor: "pointer",
            }}>
              {t("claim.button.continue")}
            </button>
          </>
        )}

        {!canClaim && (
          <button onClick={onClose} style={{
            marginTop: 6,
            background: "linear-gradient(135deg,#1565c0,#42a5f5)",
            color: "#fff", border: "none", borderRadius: 50,
            padding: "14px 36px", fontSize: 15, fontWeight: 800,
            cursor: "pointer", letterSpacing: 1,
            boxShadow: "0 0 24px #1565c088",
          }}>
            {t("claim.button.continuePlay")}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Écran d'instructions (1ère fois) ──────────────────────── */
function InstructionsScreen({ onStart }: { onStart: () => void }) {
  const { t } = useT();
  const handlePlay = () => {
    localStorage.setItem("safi_runner_saw_instructions", "1");
    onStart();
  };
  const hours = Math.round((REQUIRED_SECONDS_PER_DAY / 3600) * 10) / 10;
  const rows: { icon: string; labelKey: string; descKey: string }[] = [
    { icon: "◀ ▶", labelKey: "instr.row.lanes.label",     descKey: "instr.row.lanes.desc" },
    { icon: "▲",   labelKey: "instr.row.jump.label",      descKey: "instr.row.jump.desc" },
    { icon: "🎮",  labelKey: "instr.row.gamepad.label",   descKey: "instr.row.gamepad.desc" },
    { icon: "💎",  labelKey: "instr.row.diamonds.label",  descKey: "instr.row.diamonds.desc" },
    { icon: "🚧",  labelKey: "instr.row.obstacles.label", descKey: "instr.row.obstacles.desc" },
  ];
  const bullets: string[] = [
    t("instr.how.collect", { n: formatNum(DIAMONDS_PER_MENU) }),
    t("instr.how.play",    { h: hours, d: REQUIRED_PLAY_DAYS }),
    t("instr.how.day4"),
    t("instr.how.shortfall"),
    t("instr.how.ads"),
  ];
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 50, pointerEvents: "auto",
      background: "rgba(0,5,20,0.97)",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <div style={{
        position: "absolute", inset: 0, zIndex: 10,
        overflowY: "auto", overflowX: "hidden",
        WebkitOverflowScrolling: "touch" as never,
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "24px 20px 32px",
      }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 4, textAlign: "center" }}>
          {t("instr.title")}
        </div>
        <div style={{ fontSize: 12, color: "#90caf9", marginBottom: 20, letterSpacing: 2 }}>{t("instr.subtitle")}</div>

        <div style={{ width: "100%", maxWidth: 420, marginBottom: 16 }}>
          {rows.map((c, i) => (
            <div key={i} style={{
              display: "flex", gap: 14, alignItems: "center",
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14, padding: "12px 16px", marginBottom: 10,
            }}>
              <div style={{ fontSize: 24, minWidth: 40, textAlign: "center" }}>{c.icon}</div>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{t(c.labelKey)}</div>
                <div style={{ color: "#aaa", fontSize: 12, marginTop: 2 }}>{t(c.descKey)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Système de récompenses détaillé */}
        <div style={{
          width: "100%", maxWidth: 420,
          background: "rgba(255,140,0,0.12)", border: "1px solid rgba(255,140,0,0.35)",
          borderRadius: 16, padding: "14px 18px", marginBottom: 16,
        }}>
          <div style={{ color: "#ffa726", fontWeight: 800, fontSize: 14, marginBottom: 8 }}>
            {t("instr.howTitle")}
          </div>
          {bullets.map((line, i) => (
            <div key={i} style={{ color: "#e0e0e0", fontSize: 13, marginBottom: 4 }}>✓ {line}</div>
          ))}
        </div>

        <div style={{
          width: "100%", maxWidth: 420,
          background: "rgba(100,180,255,0.08)", border: "1px solid rgba(100,180,255,0.25)",
          borderRadius: 12, padding: "8px 14px", marginBottom: 14,
          color: "#90caf9", fontSize: 11, textAlign: "center", letterSpacing: 0.4,
        }}>
          {t("instr.responsive")}
        </div>

        <button
          onClick={handlePlay}
          style={{
            background: "linear-gradient(135deg,#1565c0,#42a5f5)",
            color: "#fff", border: "none", borderRadius: 50,
            padding: "16px 52px", fontSize: 20, fontWeight: 900,
            cursor: "pointer", letterSpacing: 3, width: "100%", maxWidth: 340,
            boxShadow: "0 0 30px #1565c088",
          }}
        >
          {t("instr.launch")}
        </button>
      </div>
    </div>
  );
}

/* ─── Écran de démarrage — thème "Bridge Shark" vert ─────────── */
function StartScreen({ onStart, eligibility, onClaim }: {
  onStart: () => void; eligibility: MenuEligibility; onClaim: () => void;
}) {
  const { t } = useT();
  const hasMenu = eligibility.menusAvailable > 0;
  const diamondPct = Math.min(100, ((eligibility.diamondsCollected % DIAMONDS_PER_MENU) / DIAMONDS_PER_MENU) * 100);

  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "auto",
      backgroundImage: "url(/assets/shark-warrior-night.jpeg)",
      backgroundSize: "cover", backgroundPosition: "center top",
    }}>
      {/* Voile sombre teinté vert (au lieu de bleu) */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "linear-gradient(to bottom,rgba(0,30,15,0.45) 0%,rgba(0,20,10,0.7) 35%,rgba(0,15,8,0.94) 65%,rgba(0,10,5,0.99) 100%)",
      }} />

      <div style={{ position: "absolute", top: 16, left: 16, zIndex: 20, pointerEvents: "auto" }}>
        <BridgeEatsButton />
      </div>

      <div style={{
        position: "absolute", inset: 0, zIndex: 10,
        overflowY: "auto", overflowX: "hidden",
        WebkitOverflowScrolling: "touch" as never,
        display: "flex", flexDirection: "column",
        alignItems: "center",
      }}>
        <div style={{ flex: 1, minHeight: 130 }} />

        <div style={{ width: "100%", maxWidth: 500, padding: "0 20px 32px", textAlign: "center" }}>

          {/* Avatar circulaire avec anneau vert + badge LIVE */}
          <div style={{
            position: "relative", width: 156, height: 156, margin: "0 auto 14px",
          }}>
            <div style={{
              position: "absolute", inset: -6, borderRadius: "50%",
              background: "conic-gradient(from 0deg,#00e676,#00c853,#69f0ae,#00e676)",
              animation: "spin 6s linear infinite",
              filter: "blur(0.5px)",
              opacity: 0.9,
            }} />
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: "3px solid rgba(0,230,118,0.85)",
              background: "url(/assets/shark-warrior-night.jpeg) center/cover",
              boxShadow: "0 0 32px rgba(0,230,118,0.55), 0 0 0 6px rgba(0,30,15,0.85) inset",
            }} />
            <div style={{
              position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)",
              background: "linear-gradient(135deg,#00c853,#00e676)",
              color: "#003311", fontWeight: 900, fontSize: 10, letterSpacing: 1.5,
              padding: "3px 12px", borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,200,80,0.55)",
            }}>● LIVE</div>
          </div>

          {/* Titre SAFI RUNNER */}
          <div style={{
            fontFamily: "'Bangers', sans-serif",
            fontSize: "clamp(38px,11vw,54px)", letterSpacing: 4, color: "#ffeb3b",
            textShadow: "3px 3px 0 #003311, 6px 6px 0 #00c853, 0 0 40px rgba(0,230,118,0.5)",
            lineHeight: 1, marginBottom: 2, transform: "rotate(-2deg)",
          }}>
            {t("start.title")}
          </div>
          <div style={{
            display: "inline-block",
            fontSize: 11, color: "#69f0ae", marginBottom: 16, letterSpacing: 3,
            fontWeight: 700, textTransform: "uppercase",
            borderTop: "1px solid rgba(0,230,118,0.4)",
            borderBottom: "1px solid rgba(0,230,118,0.4)",
            padding: "3px 10px",
          }}>
            ─ {t("start.subtitle")} ─
          </div>

          {/* Cartes ID JOUEUR + SESSION (style Bridge Shark) */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12, textAlign: "start",
          }}>
            <div style={{
              background: "linear-gradient(135deg,rgba(0,40,20,0.9),rgba(0,25,12,0.85))",
              border: "1px solid rgba(0,230,118,0.3)", borderRadius: 14,
              padding: "10px 12px", boxShadow: "0 4px 16px rgba(0,80,40,0.3)",
            }}>
              <div style={{ fontSize: 9, color: "#69f0ae", letterSpacing: 1.5, fontWeight: 700, marginBottom: 4 }}>ID JOUEUR</div>
              <div style={{ fontSize: 14, color: "#fff", fontWeight: 800, letterSpacing: 1, fontFamily: "'Fredoka', monospace" }} dir="ltr">
                BR-{(eligibility.diamondsCollected.toString(36).toUpperCase() + "XXXXXX").slice(0, 6)}
              </div>
            </div>
            <div style={{
              background: "linear-gradient(135deg,rgba(40,30,0,0.9),rgba(25,18,0,0.85))",
              border: "1px solid rgba(255,193,7,0.3)", borderRadius: 14,
              padding: "10px 12px", boxShadow: "0 4px 16px rgba(80,60,0,0.3)",
            }}>
              <div style={{ fontSize: 9, color: "#ffd54f", letterSpacing: 1.5, fontWeight: 700, marginBottom: 4 }}>⏱ SESSION</div>
              <div style={{ fontSize: 13, color: "#fff", fontWeight: 800 }}>
                {t("bridge.session")}
              </div>
            </div>
          </div>

          {/* Carte MES DIAMANTS / OBJECTIF */}
          <div style={{
            background: "linear-gradient(135deg,rgba(0,40,20,0.92),rgba(0,25,12,0.88))",
            border: "1.5px solid rgba(0,230,118,0.4)", borderRadius: 16,
            padding: "12px 14px", marginBottom: 12,
            boxShadow: "0 6px 24px rgba(0,100,50,0.35), 0 0 0 1px rgba(0,230,118,0.1) inset",
            textAlign: "start",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 9, color: "#69f0ae", letterSpacing: 1.5, fontWeight: 700 }}>{t("bridge.myDiamonds").toUpperCase()}</div>
                <div style={{ fontSize: 24, color: "#ffd54f", fontWeight: 900, lineHeight: 1, textShadow: "0 0 12px rgba(255,213,79,0.5)" }} dir="ltr">
                  {formatNum(eligibility.diamondsCollected)} 💎
                </div>
              </div>
              <div style={{ textAlign: "end" }}>
                <div style={{ fontSize: 9, color: "#69f0ae", letterSpacing: 1.5, fontWeight: 700 }}>{t("bridge.objective").toUpperCase()}</div>
                <div style={{ fontSize: 18, color: "#a5d6a7", fontWeight: 900, lineHeight: 1.2 }} dir="ltr">
                  {formatNum(DIAMONDS_PER_MENU)} 💎
                </div>
              </div>
            </div>
            <div style={{ height: 8, background: "rgba(0,0,0,0.4)", borderRadius: 6, overflow: "hidden", marginBottom: 4 }}>
              <div style={{
                height: "100%", width: `${diamondPct}%`,
                background: "linear-gradient(90deg,#00c853,#00e676,#69f0ae)",
                transition: "width 0.6s",
                boxShadow: "0 0 12px rgba(0,230,118,0.7)",
              }} />
            </div>
            <div style={{ fontSize: 10, color: "#a5d6a7", textAlign: "center", letterSpacing: 1 }}>
              {Math.round(diamondPct)}% · {t("bridge.progress").toUpperCase()}
            </div>
          </div>

          {/* Bouton Réclamer si menu disponible */}
          {hasMenu && (
            <button onClick={onClaim} style={{
              background: "linear-gradient(135deg,#1b5e20,#388e3c,#1b5e20)",
              color: "#fff", border: "2px solid #66bb6a", borderRadius: 50,
              padding: "12px 30px", fontSize: 15, fontWeight: 900,
              cursor: "pointer", letterSpacing: 1.5, marginBottom: 12,
              boxShadow: "0 0 30px rgba(76,175,80,0.6)",
              width: "100%", maxWidth: 340,
            }}>
              {t("claim.button.claim")}
            </button>
          )}

          {/* GROS BOUTON JOUER MAINTENANT (style Bridge Shark) */}
          <button
            onClick={onStart}
            style={{
              background: "linear-gradient(135deg,#00c853 0%,#00e676 50%,#00c853 100%)",
              color: "#003311", border: "none", borderRadius: 50,
              padding: "16px 32px", fontSize: "clamp(16px,4.5vw,20px)", fontWeight: 900,
              cursor: "pointer", letterSpacing: 2, textTransform: "uppercase",
              boxShadow: "0 0 36px rgba(0,230,118,0.65), 0 8px 24px rgba(0,80,40,0.6)",
              animation: "pulse 2s infinite", transition: "transform 0.1s",
              width: "100%", maxWidth: 340, marginBottom: 16,
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            {t("bridge.playNow")}
          </button>

          {/* Section "COMMENT GAGNER ?" — nouvelles règles */}
          <div style={{
            background: "linear-gradient(135deg,rgba(0,30,15,0.92),rgba(0,20,10,0.88))",
            border: "1px solid rgba(0,230,118,0.25)", borderRadius: 16,
            padding: "12px 14px", textAlign: "start", marginBottom: 12,
          }}>
            <div style={{
              fontSize: 12, color: "#00e676", fontWeight: 800, letterSpacing: 1.5,
              marginBottom: 10, textTransform: "uppercase",
            }}>
              {t("bridge.howTitle")}
            </div>
            {[
              t("bridge.how.duration"),
              t("bridge.how.rate"),
              t("bridge.how.shortfall"),
              t("bridge.how.bonus"),
              t("bridge.how.claim"),
            ].map((line, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 8,
                fontSize: 11, color: "#e0f2e7", marginBottom: 7, lineHeight: 1.45,
              }}>
                <div style={{
                  flexShrink: 0, width: 18, height: 18, borderRadius: "50%",
                  background: "linear-gradient(135deg,#00c853,#00e676)",
                  color: "#003311", fontSize: 10, fontWeight: 900,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginTop: 1,
                }}>{i + 1}</div>
                <div style={{ flex: 1 }}>{line}</div>
              </div>
            ))}
          </div>

          {/* Contrôles (footer discret) */}
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8, color: "#666", fontSize: 10 }}>
            <span>{t("start.controls.lanes")}</span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>{t("start.controls.jump")}</span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>{t("start.controls.touch")}</span>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ─── Écran Game Over ────────────────────────────────────────── */
function GameOverScreen({ score, checkpointNumber, eligibility, onRestart, onClaim }: {
  score: number; checkpointNumber: number; eligibility: MenuEligibility;
  onRestart: () => void; onClaim: () => void;
}) {
  const { t } = useT();
  const sessionDiamonds = Math.floor(score / 10);
  const sardines = Math.floor(score / 50);
  const hasMenu = eligibility.menusAvailable > 0;

  return (
    <div style={{
      position: "absolute", inset: 0,
      backgroundImage: "url(/assets/shark-warrior-night.jpeg)",
      backgroundSize: "cover", backgroundPosition: "center top",
      pointerEvents: "auto",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom,rgba(60,0,0,0.7) 0%,rgba(10,0,0,0.97) 100%)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "absolute", inset: 0, zIndex: 10,
        overflowY: "auto", overflowX: "hidden",
        WebkitOverflowScrolling: "touch" as never,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "20px 0",
      }}>
        <div style={{ position: "relative", textAlign: "center", padding: "0 24px", width: "100%", maxWidth: 440 }}>

          <div style={{ marginBottom: 18 }}>
            <BridgeEatsButton variant="dark" />
          </div>

          <div style={{
            fontSize: 52, fontWeight: 900, color: "#ef5350",
            textShadow: "0 0 40px #b71c1c, 0 4px 16px rgba(0,0,0,0.9)",
            letterSpacing: 3, lineHeight: 1, marginBottom: 4,
          }}>
            {t("over.title")}
          </div>
          <div style={{ color: "#ff8a80", fontSize: 13, marginBottom: 20, opacity: 0.8 }}>
            {t("over.subtitle")}
          </div>

          {/* Cartes stats */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 18, flexWrap: "wrap" }}>
            {[
              { icon: "💎", label: t("over.stat.session"),  value: sessionDiamonds,    color: "#42a5f5" },
              { icon: "🏆", label: t("over.stat.score"),    value: score,              color: "#ffd740" },
              { icon: "🍽️", label: t("over.stat.stops"),    value: checkpointNumber,   color: "#66bb6a" },
              { icon: "🐟", label: t("over.stat.sardines"), value: sardines,           color: "#80cbc4" },
            ].map((stat, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.06)", backdropFilter: "blur(8px)",
                border: `1px solid ${stat.color}40`, borderRadius: 14,
                padding: "10px 8px", minWidth: 68,
              }}>
                <div style={{ fontSize: 20, marginBottom: 3 }}>{stat.icon}</div>
                <div style={{ color: stat.color, fontSize: 18, fontWeight: 900, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ color: "#888", fontSize: 9, marginTop: 3, letterSpacing: 0.5 }}>{stat.label.toUpperCase()}</div>
              </div>
            ))}
          </div>

          {/* Carte engagement Bridge */}
          <div style={{ marginBottom: 18 }}>
            <EngagementCard eligibility={eligibility} />
          </div>

          {hasMenu && (
            <button onClick={onClaim} style={{
              background: "linear-gradient(135deg,#2e7d32,#66bb6a)",
              color: "#fff", border: "none", borderRadius: 50,
              padding: "14px 32px", fontSize: 15, fontWeight: 900,
              cursor: "pointer", letterSpacing: 1.5, marginBottom: 14,
              boxShadow: "0 0 30px #4caf5088",
            }}>
              {t("claim.button.claim")}
            </button>
          )}
          <br />

          <button
            onClick={onRestart}
            style={{
              background: "linear-gradient(135deg,#b71c1c,#ef5350)",
              color: "#fff", border: "none", borderRadius: 50,
              padding: "16px 50px", fontSize: 18, fontWeight: 900,
              cursor: "pointer", letterSpacing: 2, textTransform: "uppercase",
              boxShadow: "0 0 28px #b71c1c88, 0 6px 24px rgba(0,0,0,0.6)",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            {t("over.restart")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Export principal ───────────────────────────────────────── */
export function GameUI({
  phase, score, checkpointNumber, nextCheckpointAt, playTime,
  profile, onStart, onRestart, onChangeLane, onJump,
}: GameUIProps) {
  const [showReward, setShowReward] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  /* Éligibilité = profile + diamants estimés de la session en cours */
  const sessionDiamonds = Math.floor(score / 10);
  const profileForCalc: Profile | null = profile
    ? { ...profile, diamonds_collected: (profile.diamonds_collected ?? 0) + sessionDiamonds }
    : null;
  const eligibility = getMenuEligibility(profileForCalc);

  /* Détection du PASSAGE de menusEarned :
     on N'INTERROMPT PAS la partie en cours — on attend le game over
     pour proposer la réclamation. */
  const prevMenusEarnedRef = useRef(eligibility.menusEarned);
  useEffect(() => {
    if (
      eligibility.menusEarned > prevMenusEarnedRef.current &&
      (phase === "gameover" || phase === "checkpoint")
    ) {
      setShowReward(true);
    }
    prevMenusEarnedRef.current = eligibility.menusEarned;
  }, [eligibility.menusEarned, phase]);

  const handleStart = () => {
    const saw = localStorage.getItem("safi_runner_saw_instructions");
    if (!saw) setShowInstructions(true);
    else onStart();
  };

  const handleInstructionsDone = () => {
    setShowInstructions(false);
    onStart();
  };

  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: "'Segoe UI','Arial',sans-serif", overflow: "hidden" }}>
      <style>{`
        @keyframes pulse {
          0%,100%{box-shadow:0 0 30px #1565c088,0 6px 24px rgba(0,0,0,0.6)}
          50%{box-shadow:0 0 50px #42a5f5cc,0 8px 32px rgba(0,0,0,0.7)}
        }
      `}</style>

      {/* Boutons flottants TOUJOURS accessibles : Bridge Eats + WhatsApp */}
      <FloatingActions />

      {showReward && (
        <MenuUnlockOverlay
          eligibility={eligibility}
          onClose={() => setShowReward(false)}
        />
      )}

      {showInstructions && (
        <InstructionsScreen onStart={handleInstructionsDone} />
      )}

      {phase === "start" && !showReward && !showInstructions && (
        <StartScreen
          onStart={handleStart}
          eligibility={eligibility}
          onClaim={() => setShowReward(true)}
        />
      )}

      {phase === "gameover" && !showReward && (
        <GameOverScreen
          score={score}
          checkpointNumber={checkpointNumber}
          eligibility={eligibility}
          onRestart={onRestart}
          onClaim={() => setShowReward(true)}
        />
      )}

      {phase === "playing" && !showReward && (
        <>
          <HUD
            score={score}
            checkpointNumber={checkpointNumber}
            playTime={playTime}
            nextCheckpointAt={nextCheckpointAt}
            eligibility={eligibility}
          />
          {/* Touch controls visibles sur tactile (mobile/tablette).
              Sur PC/TV avec souris ou manette : masqués via media query
              pour ne pas encombrer l'écran. */}
          <div className="touch-only">
            <TouchControls onChangeLane={onChangeLane} onJump={onJump} />
          </div>
          <style>{`
            @media (hover: hover) and (pointer: fine) {
              .touch-only { display: none !important; }
            }
          `}</style>
        </>
      )}
    </div>
  );
}
