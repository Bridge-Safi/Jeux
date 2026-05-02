import { useState, useCallback, useEffect, useRef } from "react";
import type { GamePhase } from "./useGameState";
import {
  registerBridgePhone,
  markMenuClaimed,
  getMenuEligibility,
  DIAMONDS_PER_MENU,
  REQUIRED_PLAY_DAYS,
  REQUIRED_SECONDS_PER_DAY,
  type MenuEligibility,
} from "../lib/playerProfile";
import type { Profile } from "../lib/supabase";

/* ─── Configuration Bridge Eats ─────────────────────────────── */
export const BRIDGE_EATS_URL = "https://44474adc-9074-4015-a3b9-4e111cb8be39-00-11nld147gir6y.kirk.replit.dev/";
export { DIAMONDS_PER_MENU };

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
  if (seconds <= 0) return "✓ jour validé";
  const m = Math.ceil(seconds / 60);
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rest = m % 60;
    return `${h}h${rest > 0 ? String(rest).padStart(2, "0") : ""} restantes`;
  }
  return `${m} min restantes`;
}

/* ─── Carte progression Bridge complète (3 critères visibles) ─ */
function EngagementCard({ eligibility, compact = false }: {
  eligibility: MenuEligibility; compact?: boolean;
}) {
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
          🎉 {menusAvailable} menu{menusAvailable > 1 ? "s" : ""} gratuit{menusAvailable > 1 ? "s" : ""} prêt{menusAvailable > 1 ? "s" : ""} !
        </div>
        <div style={{ color: "#c8e6c9", fontSize: compact ? 10 : 12 }}>
          Réclame ton menu sur Bridge Eats avec ton n° de téléphone
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "linear-gradient(135deg,rgba(0,0,0,0.78),rgba(30,10,0,0.85))",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,140,0,0.35)",
      borderRadius: compact ? 12 : 16,
      padding: compact ? "8px 12px" : "12px 16px",
      minWidth: compact ? 200 : 0,
      boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
    }}>
      <div style={{ color: "#ffa726", fontSize: compact ? 10 : 12, fontWeight: 800, marginBottom: 8, letterSpacing: 0.5 }}>
        🛵🚕 Programme Bridge — Menu gratuit
      </div>

      {/* Critère 1 : Diamants */}
      <div style={{ marginBottom: 7 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: compact ? 9 : 11, marginBottom: 3 }}>
          <span style={{ color: "#fff" }}>💎 Diamants</span>
          <span style={{ color: "#ffd54f", fontWeight: 700 }}>
            {diamondsCollected.toLocaleString("fr-FR")} / {DIAMONDS_PER_MENU.toLocaleString("fr-FR")}
          </span>
        </div>
        <div style={{ height: compact ? 5 : 6, background: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${diamondPct}%`,
            background: "linear-gradient(90deg,#ff6f00,#ffd54f)",
            transition: "width 0.5s",
          }} />
        </div>
      </div>

      {/* Critère 2 : Jours qualifiés (≥ 1h) */}
      <div style={{ marginBottom: 7 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: compact ? 9 : 11, marginBottom: 3 }}>
          <span style={{ color: "#fff" }}>📅 Jours actifs (≥ 1h)</span>
          <span style={{ color: "#90caf9", fontWeight: 700 }}>{qualifyingDays} / {REQUIRED_PLAY_DAYS}</span>
        </div>
        <div style={{ height: compact ? 5 : 6, background: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${dayPct}%`,
            background: "linear-gradient(90deg,#1565c0,#42a5f5)",
            transition: "width 0.5s",
          }} />
        </div>
      </div>

      {/* Critère 3 : aujourd'hui */}
      <div style={{
        fontSize: compact ? 9 : 11, color: "#a5d6a7",
        background: "rgba(0,0,0,0.3)", borderRadius: 6,
        padding: "4px 8px", textAlign: "center", marginTop: 6,
      }}>
        ⏱️ Aujourd'hui : {formatTimeRemaining(todaySecondsRemaining)}
        {daysSinceFirstPlay > 0 && (
          <span style={{ color: "#888", marginLeft: 6 }}>· J{daysSinceFirstPlay}</span>
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
          <div style={{ color: "#90caf9", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Fredoka', sans-serif" }}>Pièces</div>
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
          🍽️ Prochain arrêt · {timeToNext}s
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
        <div style={{ color: "#a5d6a7", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Fredoka', sans-serif" }}>Score</div>
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
      <div style={{
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
        ← SWIPE pour changer de voie · SWIPE ↑ pour sauter →
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
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "done">("phone");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const canClaim = eligibility.eligible;

  const handleClaim = async () => {
    const trimmed = phone.trim();
    if (!trimmed) {
      setErrMsg("Entre ton numéro Bridge Eats.");
      return;
    }
    setLoading(true); setErrMsg("");
    const reg = await registerBridgePhone(trimmed);
    if (!reg.success) {
      setLoading(false);
      setErrMsg(reg.error ?? "Erreur — réessaie.");
      return;
    }
    /* Téléphone OK → on consomme un menu */
    const claim = await markMenuClaimed();
    setLoading(false);
    if (!claim.success) {
      setErrMsg(claim.error ?? "Erreur — réessaie.");
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
            }}>
              MENU GRATUIT<br />DÉBLOQUÉ !
            </div>
            <div style={{ color: "#a5d6a7", fontSize: 13, marginBottom: 18 }}>
              Tu as joué <strong style={{ color: "#fff" }}>{eligibility.qualifyingDays} jours</strong> et collecté{" "}
              <strong style={{ color: "#ffd740" }}>{eligibility.diamondsCollected.toLocaleString("fr-FR")} 💎</strong>
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
              Pas encore prêt
            </div>
            <div style={{ color: "#ffcc80", fontSize: 13, marginBottom: 18 }}>
              {eligibility.blockerReason}
            </div>
            <div style={{ marginBottom: 18 }}>
              <EngagementCard eligibility={eligibility} />
            </div>
          </>
        )}

        {step === "phone" && canClaim && (
          <>
            <div style={{
              background: "rgba(0,0,0,0.4)", border: "1px solid rgba(76,175,80,0.4)",
              borderRadius: 14, padding: "14px 16px", marginBottom: 18, textAlign: "left",
            }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                📱 Ton n° de téléphone Bridge Eats
              </div>
              <div style={{ color: "#aaa", fontSize: 11, lineHeight: 1.6 }}>
                Ce numéro identifie ton compte Bridge — c'est lui qui recevra ton menu gratuit. Un seul menu par numéro.
              </div>
            </div>

            <input
              className="phone-input"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={e => { setPhone(e.target.value); setErrMsg(""); }}
              placeholder="+212 6XX XXXXXX  ou  06XX XXXXXX"
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
              {loading ? "Vérification…" : "🛵🚕 RÉCLAMER MON MENU"}
            </button>

            <button onClick={onClose} style={{
              background: "transparent", color: "#888",
              border: "none", fontSize: 12, cursor: "pointer",
            }}>
              Continuer à jouer
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
                ✅ Numéro enregistré !
              </div>
              <div style={{ color: "#ccc", fontSize: 12 }}>
                Ton menu sera lié à ton compte Bridge Eats. Clique ci-dessous pour le commander.
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
              🛵🚕 ALLER SUR BRIDGE EATS
            </a>
            <br />
            <button onClick={onClose} style={{
              background: "transparent", color: "#888",
              border: "none", fontSize: 12, cursor: "pointer",
            }}>
              Continuer à jouer
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
            ▶ Continuer à jouer
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Écran d'instructions (1ère fois) ──────────────────────── */
function InstructionsScreen({ onStart }: { onStart: () => void }) {
  const handlePlay = () => {
    localStorage.setItem("safi_runner_saw_instructions", "1");
    onStart();
  };
  const hours = Math.round((REQUIRED_SECONDS_PER_DAY / 3600) * 10) / 10;
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
          🦈 COMMENT JOUER
        </div>
        <div style={{ fontSize: 12, color: "#90caf9", marginBottom: 20, letterSpacing: 2 }}>SAFI RUNNER</div>

        <div style={{ width: "100%", maxWidth: 420, marginBottom: 16 }}>
          {[
            { icon: "◀ ▶", label: "Changer de voie", desc: "Boutons GAUCHE / DROITE ou flèches clavier" },
            { icon: "▲", label: "Sauter", desc: "Bouton SAUTER, flèche ↑ ou Espace" },
            { icon: "💎", label: "Collecte les diamants", desc: "Cours sur les diamants bleus pour les ramasser" },
            { icon: "🚧", label: "Évite les obstacles", desc: "Change de voie ou saute par-dessus" },
          ].map((c, i) => (
            <div key={i} style={{
              display: "flex", gap: 14, alignItems: "center",
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14, padding: "12px 16px", marginBottom: 10,
            }}>
              <div style={{ fontSize: 24, minWidth: 40, textAlign: "center" }}>{c.icon}</div>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{c.label}</div>
                <div style={{ color: "#aaa", fontSize: 12, marginTop: 2 }}>{c.desc}</div>
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
            🛵🚕 Comment gagner un menu Bridge Eats
          </div>
          {[
            `Collecte ${DIAMONDS_PER_MENU.toLocaleString("fr-FR")} 💎 au total`,
            `Joue au moins ${hours}h par jour pendant ${REQUIRED_PLAY_DAYS} jours différents`,
            `Le 4ᵉ jour : entre ton n° Bridge Eats pour réclamer le menu`,
            "Pause publicitaire toutes les 40 secondes",
          ].map((t, i) => (
            <div key={i} style={{ color: "#e0e0e0", fontSize: 13, marginBottom: 4 }}>✓ {t}</div>
          ))}
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
          ▶ LANCER LE JEU
        </button>
      </div>
    </div>
  );
}

/* ─── Écran de démarrage ─────────────────────────────────────── */
function StartScreen({ onStart, eligibility, onClaim }: {
  onStart: () => void; eligibility: MenuEligibility; onClaim: () => void;
}) {
  const hasMenu = eligibility.menusAvailable > 0;

  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "auto",
      backgroundImage: "url(/assets/shark-warrior-night.jpeg)",
      backgroundSize: "cover", backgroundPosition: "center top",
    }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "linear-gradient(to bottom,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.05) 30%,rgba(0,10,40,0.88) 60%,rgba(0,5,20,0.98) 100%)",
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
        <div style={{ flex: 1, minHeight: 160 }} />

        <div style={{ width: "100%", maxWidth: 500, padding: "0 20px 32px", textAlign: "center" }}>
          <div style={{
            fontFamily: "'Bangers', sans-serif",
            fontSize: "clamp(40px,12vw,58px)", letterSpacing: 4, color: "#ffeb3b",
            textShadow: "3px 3px 0 #1a1a1a, 6px 6px 0 #c62828, 0 0 40px #ff8f00",
            lineHeight: 1, marginBottom: 4, transform: "rotate(-2deg)",
          }}>
            🦈 SAFI RUNNER
          </div>
          <div style={{ fontSize: 12, color: "#90caf9", marginBottom: 14, letterSpacing: 2, fontWeight: 600, textTransform: "uppercase" }}>
            Médina de Safi · Course Infinie 3D
          </div>

          {/* Carte engagement Bridge */}
          <div style={{ marginBottom: 14 }}>
            <EngagementCard eligibility={eligibility} />
          </div>

          {/* Bouton Réclamer si menu disponible */}
          {hasMenu && (
            <button onClick={onClaim} style={{
              background: "linear-gradient(135deg,#2e7d32,#66bb6a)",
              color: "#fff", border: "none", borderRadius: 50,
              padding: "12px 30px", fontSize: 15, fontWeight: 900,
              cursor: "pointer", letterSpacing: 1.5, marginBottom: 14,
              boxShadow: "0 0 30px #4caf5088",
              width: "100%", maxWidth: 340,
            }}>
              🛵🚕 RÉCLAMER MON MENU
            </button>
          )}

          {/* Badges */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            {[
              { icon: "💎", text: "Collecte des diamants" },
              { icon: "📅", text: `${REQUIRED_PLAY_DAYS} jours de jeu` },
              { icon: "🛵🚕", text: "Menu offert au 4ᵉ jour" },
            ].map((b, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.1)", backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20,
                padding: "4px 10px", fontSize: 10, color: "#e0e0e0",
                display: "flex", alignItems: "center", gap: 4,
              }}>
                {b.icon} {b.text}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8, marginBottom: 18, color: "#aaa", fontSize: 10 }}>
            <span>◀ ▶ Voies</span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>↑ / Espace Sauter</span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>Boutons tactiles ✓</span>
          </div>

          <button
            onClick={onStart}
            style={{
              background: "linear-gradient(135deg,#1565c0 0%,#42a5f5 50%,#1565c0 100%)",
              color: "#fff", border: "none", borderRadius: 50,
              padding: "16px 52px", fontSize: "clamp(18px,5vw,22px)", fontWeight: 900,
              cursor: "pointer", letterSpacing: 3, textTransform: "uppercase",
              boxShadow: "0 0 30px #1565c088, 0 6px 24px rgba(0,0,0,0.6)",
              animation: "pulse 2s infinite", transition: "transform 0.1s",
              width: "100%", maxWidth: 340,
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            ▶ JOUER
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Écran Game Over ────────────────────────────────────────── */
function GameOverScreen({ score, checkpointNumber, eligibility, onRestart, onClaim }: {
  score: number; checkpointNumber: number; eligibility: MenuEligibility;
  onRestart: () => void; onClaim: () => void;
}) {
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
            GAME OVER
          </div>
          <div style={{ color: "#ff8a80", fontSize: 13, marginBottom: 20, opacity: 0.8 }}>
            Le Requin Guerrier s'est arrêté !
          </div>

          {/* Cartes stats */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 18, flexWrap: "wrap" }}>
            {[
              { icon: "💎", label: "Session", value: sessionDiamonds, color: "#42a5f5" },
              { icon: "🏆", label: "Score", value: score, color: "#ffd740" },
              { icon: "🍽️", label: "Pauses", value: checkpointNumber, color: "#66bb6a" },
              { icon: "🐟", label: "Sardines", value: sardines, color: "#80cbc4" },
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
              🛵🚕 RÉCLAMER MON MENU
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
            🔄 RECOMMENCER
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
          <TouchControls onChangeLane={onChangeLane} onJump={onJump} />
        </>
      )}
    </div>
  );
}
