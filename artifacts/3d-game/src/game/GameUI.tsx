import { useState, useCallback, useEffect, useRef } from "react";
import type { GamePhase } from "./useGameState";
import { registerEmail } from "../lib/playerProfile";

/* ─── Configuration Bridge Eats ─────────────────────────────── */
export const BRIDGE_EATS_URL = "https://44474adc-9074-4015-a3b9-4e111cb8be39-00-11nld147gir6y.kirk.replit.dev/";
export const DIAMONDS_PER_MENU = 500; // 500 💎 totaux = 1 menu gratuit

/* ─── Types ──────────────────────────────────────────────────── */
interface GameUIProps {
  phase: GamePhase;
  score: number;
  checkpointNumber: number;
  nextCheckpointAt: number;
  playTime: number;
  totalDiamonds: number;        // total cumulatif depuis Supabase
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

  /* onPointerDown unifie touch+mouse → AUCUN double-fire.
     + debounce 60ms pour éviter le rebond accidentel.       */
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

/* ─── Barre progression menu gratuit ────────────────────────── */
function MenuProgressBar({ totalDiamonds }: { totalDiamonds: number }) {
  const menusEarned = Math.floor(totalDiamonds / DIAMONDS_PER_MENU);
  const progressInCurrentCycle = totalDiamonds % DIAMONDS_PER_MENU;
  const pct = (progressInCurrentCycle / DIAMONDS_PER_MENU) * 100;

  return (
    <div style={{
      background: "linear-gradient(135deg,rgba(0,0,0,0.8),rgba(30,10,0,0.85))",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,140,0,0.35)",
      borderRadius: 14,
      padding: "8px 14px",
      minWidth: 180,
      boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{ color: "#ffa726", fontSize: 11, fontWeight: 700 }}>
          🍽️ Menu gratuit
        </span>
        {menusEarned > 0 && (
          <span style={{
            background: "#4caf50",
            color: "#fff",
            fontSize: 9,
            fontWeight: 800,
            borderRadius: 10,
            padding: "2px 7px",
            letterSpacing: 0.5,
          }}>
            ×{menusEarned} DROIT{menusEarned > 1 ? "S" : ""}
          </span>
        )}
      </div>
      <div style={{ height: 7, background: "rgba(255,255,255,0.1)", borderRadius: 6, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: pct >= 100 ? "#4caf50" : "linear-gradient(90deg,#ff6f00,#ffd54f)",
          borderRadius: 6,
          transition: "width 0.5s",
          boxShadow: `0 0 8px ${pct >= 100 ? "#4caf50" : "#ff8f00"}`,
        }} />
      </div>
      <div style={{ color: "#ccc", fontSize: 10, marginTop: 4, textAlign: "right" }}>
        💎 {progressInCurrentCycle} / {DIAMONDS_PER_MENU}
      </div>
    </div>
  );
}

/* ─── HUD en jeu ─────────────────────────────────────────────── */
function HUD({ score, checkpointNumber, playTime, nextCheckpointAt, totalDiamonds }: {
  score: number; checkpointNumber: number; playTime: number; nextCheckpointAt: number; totalDiamonds: number;
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

      {/* Barre menu gratuit — en bas à gauche pendant le jeu */}
      {totalDiamonds > 0 && (
        <div style={{
          position: "absolute",
          bottom: -70,
          left: 14,
          pointerEvents: "none",
        }}>
          <MenuProgressBar totalDiamonds={totalDiamonds + sessionDiamonds} />
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
    if (e.pointerType === "mouse") return; // souris = clavier seulement
    startRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    firedRef.current = false;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!startRef.current || firedRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);

    /* Swipe horizontal : > 35px et plus horizontal que vertical */
    if (adx > 35 && adx > ady * 1.2) {
      firedRef.current = true;
      onChangeLane(dx > 0 ? 1 : -1);
    }
    /* Swipe vertical haut : > 35px vers le haut */
    else if (-dy > 35 && ady > adx * 1.2) {
      firedRef.current = true;
      onJump();
    }
  }, [onChangeLane, onJump]);

  const handlePointerUp = useCallback(() => {
    startRef.current = null;
  }, []);

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: "absolute",
        top: 80,        // sous le HUD
        bottom: 130,    // au-dessus des boutons
        left: 0, right: 0,
        zIndex: 10,
        touchAction: "none",
        pointerEvents: "auto",
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
      {/* Zone swipe sur tout l'écran de jeu */}
      <SwipeArea onChangeLane={onChangeLane} onJump={onJump} />

      {/* Boutons style NFS Heat Mobile, glassmorphism néon */}
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

      {/* Indice swipe discret au-dessus des boutons (dispar après 8s via animation CSS) */}
      <div style={{
        position: "absolute",
        bottom: 130,
        left: 0, right: 0,
        textAlign: "center",
        fontSize: 11,
        color: "rgba(255,255,255,0.5)",
        letterSpacing: 1.5,
        fontWeight: 600,
        pointerEvents: "none",
        zIndex: 15,
        textShadow: "0 0 10px rgba(0,0,0,0.8)",
        animation: "fadeOutSwipe 8s forwards",
      }}>
        ← SWIPE pour changer de voie · SWIPE ↑ pour sauter →
      </div>
      <style>{`
        @keyframes fadeOutSwipe {
          0%, 70% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </>
  );
}

/* ─── Overlay récompense menu gratuit ───────────────────────── */
function MenuUnlockOverlay({ menusCount, onClose }: { menusCount: number; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "done">("email");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const handleClaim = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrMsg("Entrez un email valide pour réclamer.");
      return;
    }
    setLoading(true);
    setErrMsg("");
    const result = await registerEmail(trimmed);
    setLoading(false);
    if (result.success) {
      setStep("done");
    } else {
      setErrMsg(result.error ?? "Erreur — réessaie.");
    }
  };

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "radial-gradient(ellipse at center,rgba(0,70,0,0.97) 0%,rgba(0,20,0,0.99) 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      zIndex: 200, pointerEvents: "auto",
      animation: "fadeIn 0.4s ease",
    }}>
      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes bounce{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
        .email-input::placeholder{color:#aaa}
      `}</style>

      <div style={{ textAlign: "center", padding: "0 28px", maxWidth: 400, width: "100%" }}>
        <div style={{ fontSize: 80, marginBottom: 8, animation: "bounce 1.2s infinite" }}>🎉</div>

        <div style={{
          fontSize: 34, fontWeight: 900, color: "#fff",
          textShadow: "0 0 30px #4caf50",
          letterSpacing: 2, marginBottom: 6, lineHeight: 1.1,
        }}>
          MENU GRATUIT<br />DÉBLOQUÉ !
        </div>

        <div style={{ color: "#a5d6a7", fontSize: 14, marginBottom: 20 }}>
          Tu as collecté <strong style={{ color: "#ffd740" }}>{menusCount * DIAMONDS_PER_MENU} 💎</strong>
        </div>

        {step === "email" ? (
          <>
            {/* Explication */}
            <div style={{
              background: "rgba(0,0,0,0.4)", border: "1px solid rgba(76,175,80,0.4)",
              borderRadius: 14, padding: "14px 16px", marginBottom: 18, textAlign: "left",
            }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                📧 Entre ton email Bridge Eats
              </div>
              <div style={{ color: "#aaa", fontSize: 11, lineHeight: 1.6 }}>
                Ton email identifie ton compte Bridge Eats. Un seul menu par email — impossible d'utiliser plusieurs comptes.
              </div>
            </div>

            <input
              className="email-input"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrMsg(""); }}
              placeholder="ton@email.com"
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12,
                border: errMsg ? "2px solid #f44336" : "2px solid rgba(76,175,80,0.5)",
                background: "rgba(0,0,0,0.6)", color: "#fff",
                fontSize: 15, marginBottom: 8, boxSizing: "border-box",
                outline: "none",
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
              Continuer à jouer sans réclamer
            </button>
          </>
        ) : (
          <>
            {/* Étape 2 : confirmation → redirection */}
            <div style={{
              background: "rgba(0,0,0,0.45)", border: "1px solid #4caf50",
              borderRadius: 14, padding: "16px", marginBottom: 22,
            }}>
              <div style={{ color: "#4caf50", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                ✅ Email enregistré !
              </div>
              <div style={{ color: "#ccc", fontSize: 12 }}>
                Clique ci-dessous pour réclamer ton menu sur Bridge Eats.
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
        {/* Titre */}
        <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 4, textAlign: "center" }}>
          🦈 COMMENT JOUER
        </div>
        <div style={{ fontSize: 12, color: "#90caf9", marginBottom: 20, letterSpacing: 2 }}>SAFI RUNNER</div>

        {/* Contrôles */}
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

        {/* Système de récompenses */}
        <div style={{
          width: "100%", maxWidth: 420,
          background: "rgba(255,140,0,0.12)", border: "1px solid rgba(255,140,0,0.35)",
          borderRadius: 16, padding: "14px 18px", marginBottom: 16,
        }}>
          <div style={{ color: "#ffa726", fontWeight: 800, fontSize: 14, marginBottom: 8 }}>
            🛵🚕 Système Bridge Eats
          </div>
          {[
            "Collecte 500 💎 = 1 menu gratuit Bridge Eats",
            "Pause publicitaire toutes les 40 secondes",
            "Quiz culture marocaine à chaque pause",
            "Score classement mondial en ligne",
          ].map((t, i) => (
            <div key={i} style={{ color: "#e0e0e0", fontSize: 13, marginBottom: 4 }}>✓ {t}</div>
          ))}
        </div>

        {/* Bouton jouer */}
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
function StartScreen({ onStart, totalDiamonds }: { onStart: () => void; totalDiamonds: number }) {
  const menusEarned = Math.floor(totalDiamonds / DIAMONDS_PER_MENU);
  const progressInCycle = totalDiamonds % DIAMONDS_PER_MENU;

  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "auto",
      backgroundImage: "url(/assets/shark-warrior-night.jpeg)",
      backgroundSize: "cover", backgroundPosition: "center top",
    }}>
      {/* Overlay gradient */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "linear-gradient(to bottom,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.05) 30%,rgba(0,10,40,0.88) 60%,rgba(0,5,20,0.98) 100%)",
      }} />

      {/* Bouton Bridge Eats fixe en haut */}
      <div style={{ position: "absolute", top: 16, left: 16, zIndex: 20, pointerEvents: "auto" }}>
        <BridgeEatsButton />
      </div>

      {/* Zone scrollable — couvre tout l'écran */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 10,
        overflowY: "auto", overflowX: "hidden",
        WebkitOverflowScrolling: "touch" as never,
        display: "flex", flexDirection: "column",
        alignItems: "center",
      }}>
        {/* Spacer hero — pousse le contenu vers le bas */}
        <div style={{ flex: 1, minHeight: 160 }} />

        {/* Contenu principal */}
        <div style={{ width: "100%", maxWidth: 500, padding: "0 20px 32px", textAlign: "center" }}>

          {/* Titre */}
          <div style={{
            fontFamily: "'Bangers', sans-serif",
            fontSize: "clamp(40px,12vw,58px)", letterSpacing: 4, color: "#ffeb3b",
            textShadow: "3px 3px 0 #1a1a1a, 6px 6px 0 #c62828, 0 0 40px #ff8f00",
            lineHeight: 1, marginBottom: 4,
            transform: "rotate(-2deg)",
          }}>
            🦈 SAFI RUNNER
          </div>
          <div style={{ fontSize: 12, color: "#90caf9", marginBottom: 14, letterSpacing: 2, fontWeight: 600, textTransform: "uppercase" }}>
            Médina de Safi · Course Infinie 3D
          </div>

          {/* Carte menu gratuit */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            background: "rgba(0,0,0,0.65)", backdropFilter: "blur(10px)",
            border: `1px solid ${menusEarned > 0 ? "#4caf50" : "rgba(255,140,0,0.4)"}`,
            borderRadius: 18, padding: "12px 20px", marginBottom: 14,
            boxShadow: menusEarned > 0 ? "0 0 20px #4caf5044" : "none",
          }}>
            {menusEarned > 0 ? (
              <>
                <div style={{ color: "#4caf50", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                  🎉 {menusEarned} Menu{menusEarned > 1 ? "s" : ""} Gratuit{menusEarned > 1 ? "s" : ""} disponible{menusEarned > 1 ? "s" : ""} !
                </div>
                <a href={BRIDGE_EATS_URL} target="_blank" rel="noreferrer" style={{
                  color: "#a5d6a7", fontSize: 12, textDecoration: "underline", cursor: "pointer",
                }}>
                  → Réclamer sur Bridge Eats
                </a>
              </>
            ) : (
              <>
                <div style={{ color: "#ffa726", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                  🛵🚕 Collecte 💎 pour un menu gratuit Bridge Eats
                </div>
                <div style={{ width: "100%", height: 7, background: "rgba(255,255,255,0.15)", borderRadius: 6, overflow: "hidden", marginBottom: 5 }}>
                  <div style={{
                    height: "100%",
                    width: `${(progressInCycle / DIAMONDS_PER_MENU) * 100}%`,
                    background: "linear-gradient(90deg,#ff6f00,#ffd54f)",
                    borderRadius: 6, transition: "width 0.5s",
                  }} />
                </div>
                <div style={{ color: "#aaa", fontSize: 10 }}>
                  💎 {progressInCycle} / {DIAMONDS_PER_MENU} pour 1 menu gratuit
                </div>
              </>
            )}
          </div>

          {/* Badges */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            {[
              { icon: "💎", text: "Collecte des diamants" },
              { icon: "🍽️", text: "Pauses toutes les 40s" },
              { icon: "🏆", text: "Score en ligne" },
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

          {/* Contrôles */}
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8, marginBottom: 18, color: "#aaa", fontSize: 10 }}>
            <span>◀ ▶ Voies</span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>↑ / Espace Sauter</span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>Boutons tactiles ✓</span>
          </div>

          {/* Bouton JOUER */}
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
function GameOverScreen({ score, checkpointNumber, totalDiamonds, onRestart }: {
  score: number; checkpointNumber: number; totalDiamonds: number; onRestart: () => void;
}) {
  const sessionDiamonds = Math.floor(score / 10);
  const totalNow = totalDiamonds + sessionDiamonds;
  const menusEarned = Math.floor(totalNow / DIAMONDS_PER_MENU);
  const progressInCycle = totalNow % DIAMONDS_PER_MENU;
  const sardines = Math.floor(score / 50);

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

      {/* Zone scrollable */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 10,
        overflowY: "auto", overflowX: "hidden",
        WebkitOverflowScrolling: "touch" as never,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "20px 0",
      }}>
      <div style={{ position: "relative", textAlign: "center", padding: "0 24px", width: "100%", maxWidth: 440 }}>

        {/* Bouton Bridge Eats en haut */}
        <div style={{ marginBottom: 18 }}>
          <BridgeEatsButton variant="dark" />
        </div>

        {/* Titre GAME OVER */}
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
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 18 }}>
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

        {/* Progression menu gratuit */}
        <div style={{
          background: menusEarned > 0 ? "rgba(0,80,0,0.5)" : "rgba(0,0,0,0.55)",
          backdropFilter: "blur(8px)",
          border: `1px solid ${menusEarned > 0 ? "#4caf50" : "rgba(255,140,0,0.35)"}`,
          borderRadius: 16, padding: "14px 18px", marginBottom: 20,
          boxShadow: menusEarned > 0 ? "0 0 20px #4caf5044" : "none",
        }}>
          {menusEarned > 0 ? (
            <>
              <div style={{ color: "#4caf50", fontSize: 15, fontWeight: 800, marginBottom: 8 }}>
                🎉 {menusEarned} menu{menusEarned > 1 ? "s" : ""} gratuit{menusEarned > 1 ? "s" : ""} disponible{menusEarned > 1 ? "s" : ""} !
              </div>
              <a href={BRIDGE_EATS_URL} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "linear-gradient(135deg,#2e7d32,#66bb6a)",
                color: "#fff", borderRadius: 30, padding: "10px 24px",
                fontSize: 13, fontWeight: 800, textDecoration: "none", letterSpacing: 1,
              }}>
                🛵🚕 Réclamer sur Bridge Eats
              </a>
            </>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#ffa726", fontSize: 12, fontWeight: 700 }}>💎 Total : {totalNow}</span>
                <span style={{ color: "#aaa", fontSize: 11 }}>{progressInCycle}/{DIAMONDS_PER_MENU} → menu gratuit</span>
              </div>
              <div style={{ height: 8, background: "rgba(255,255,255,0.12)", borderRadius: 6, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(progressInCycle / DIAMONDS_PER_MENU) * 100}%`,
                  background: "linear-gradient(90deg,#ff6f00,#ffd54f)",
                  borderRadius: 6, boxShadow: "0 0 8px #ff8f00",
                }} />
              </div>
            </>
          )}
        </div>

        {/* Bouton rejouer */}
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
      </div>  {/* fin zone scrollable */}
    </div>
  );
}

/* ─── Export principal ───────────────────────────────────────── */
export function GameUI({
  phase, score, checkpointNumber, nextCheckpointAt, playTime,
  totalDiamonds, onStart, onRestart, onChangeLane, onJump,
}: GameUIProps) {
  const [showReward, setShowReward] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const prevMenuCountRef = useRef(Math.floor(totalDiamonds / DIAMONDS_PER_MENU));

  const handleStart = () => {
    const saw = localStorage.getItem("safi_runner_saw_instructions");
    if (!saw) {
      setShowInstructions(true);
    } else {
      onStart();
    }
  };

  const handleInstructionsDone = () => {
    setShowInstructions(false);
    onStart();
  };

  const sessionDiamonds = Math.floor(score / 10);
  const totalNow = totalDiamonds + sessionDiamonds;
  const currentMenuCount = Math.floor(totalNow / DIAMONDS_PER_MENU);

  useEffect(() => {
    if (currentMenuCount > prevMenuCountRef.current && phase === "playing") {
      setShowReward(true);
      prevMenuCountRef.current = currentMenuCount;
    }
  }, [currentMenuCount, phase]);

  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: "'Segoe UI','Arial',sans-serif", overflow: "hidden" }}>
      <style>{`
        @keyframes pulse {
          0%,100%{box-shadow:0 0 30px #1565c088,0 6px 24px rgba(0,0,0,0.6)}
          50%{box-shadow:0 0 50px #42a5f5cc,0 8px 32px rgba(0,0,0,0.7)}
        }
      `}</style>

      {/* Récompense menu gratuit */}
      {showReward && (
        <MenuUnlockOverlay
          menusCount={currentMenuCount}
          onClose={() => setShowReward(false)}
        />
      )}

      {/* Instructions (1ère fois) */}
      {showInstructions && (
        <InstructionsScreen onStart={handleInstructionsDone} />
      )}

      {/* Écran démarrage */}
      {phase === "start" && !showReward && !showInstructions && (
        <StartScreen onStart={handleStart} totalDiamonds={totalDiamonds} />
      )}

      {/* Game Over */}
      {phase === "gameover" && !showReward && (
        <GameOverScreen
          score={score}
          checkpointNumber={checkpointNumber}
          totalDiamonds={totalDiamonds}
          onRestart={onRestart}
        />
      )}

      {/* HUD en jeu */}
      {phase === "playing" && !showReward && (
        <>
          <HUD
            score={score}
            checkpointNumber={checkpointNumber}
            playTime={playTime}
            nextCheckpointAt={nextCheckpointAt}
            totalDiamonds={totalDiamonds}
          />
          <TouchControls onChangeLane={onChangeLane} onJump={onJump} />
        </>
      )}
    </div>
  );
}
