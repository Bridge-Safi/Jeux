import { useState, useCallback, useEffect, useRef } from "react";
import type { GamePhase } from "./useGameState";

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

/* ─── Bouton tactile ────────────────────────────────────────── */
function TouchButton({ label, icon, onClick, color, style }: {
  label: string; icon: string; onClick: () => void; color: string; style?: React.CSSProperties;
}) {
  const [pressed, setPressed] = useState(false);

  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setPressed(true);
    onClick();
  }, [onClick]);

  const handleEnd = useCallback(() => setPressed(false), []);

  return (
    <button
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      style={{
        width: 74, height: 74, borderRadius: 18,
        border: `2px solid ${color}`,
        background: pressed ? `${color}55` : `linear-gradient(145deg,rgba(0,0,0,0.7),rgba(0,0,0,0.4))`,
        color: "white", fontSize: 28, fontWeight: 700, cursor: "pointer",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
        boxShadow: pressed ? `0 0 20px ${color}88` : `0 4px 16px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.15)`,
        transform: pressed ? "scale(0.92)" : "scale(1)",
        transition: "all 0.08s ease",
        userSelect: "none", WebkitUserSelect: "none",
        backdropFilter: "blur(6px)",
        ...style,
      }}
    >
      <span style={{ lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: 9, opacity: 0.7, letterSpacing: 0.5, fontWeight: 600 }}>{label}</span>
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
      <span style={{ fontSize: 16 }}>🍔</span>
      <span>Bridge Eats</span>
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
        <span style={{ fontSize: 26 }}>💎</span>
        <div>
          <div style={{ color: "#90caf9", fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Session</div>
          <div style={{ color: "#fff", fontSize: 24, fontWeight: 900, lineHeight: 1, textShadow: "0 0 12px #42a5f5" }}>{sessionDiamonds}</div>
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
        <div style={{ color: "#a5d6a7", fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Score</div>
        <div style={{ color: "#fff", fontSize: 22, fontWeight: 900, lineHeight: 1.1, textShadow: "0 0 10px #66bb6a" }}>{score}</div>
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

/* ─── Contrôles tactiles ─────────────────────────────────────── */
function TouchControls({ onChangeLane, onJump }: {
  onChangeLane: (dir: 1 | -1) => void; onJump: () => void;
}) {
  return (
    <div style={{
      position: "absolute", bottom: 20, left: 0, right: 0,
      display: "flex", justifyContent: "space-between", alignItems: "flex-end",
      padding: "0 18px", pointerEvents: "auto",
    }}>
      <TouchButton icon="◀" label="GAUCHE" color="#42a5f5" onClick={() => onChangeLane(-1)} />
      <TouchButton icon="▲" label="SAUTER" color="#ffd740" onClick={onJump}
        style={{ width: 88, height: 88, borderRadius: 24, fontSize: 32 }} />
      <TouchButton icon="▶" label="DROITE" color="#42a5f5" onClick={() => onChangeLane(1)} />
    </div>
  );
}

/* ─── Overlay récompense menu gratuit ───────────────────────── */
function MenuUnlockOverlay({ menusCount, onClose }: { menusCount: number; onClose: () => void }) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "radial-gradient(ellipse at center,rgba(0,80,0,0.96) 0%,rgba(0,30,0,0.99) 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      zIndex: 200, pointerEvents: "auto",
      animation: "fadeIn 0.4s ease",
    }}>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes bounce{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}`}</style>

      <div style={{ textAlign: "center", padding: "0 30px" }}>
        {/* Emoji */}
        <div style={{ fontSize: 90, marginBottom: 10, animation: "bounce 1s infinite" }}>🎉</div>

        {/* Titre */}
        <div style={{
          fontSize: 36, fontWeight: 900, color: "#fff",
          textShadow: "0 0 30px #4caf50, 0 4px 16px rgba(0,0,0,0.8)",
          letterSpacing: 2, marginBottom: 8, lineHeight: 1.1,
        }}>
          MENU GRATUIT<br />DÉBLOQUÉ !
        </div>

        <div style={{ color: "#a5d6a7", fontSize: 15, marginBottom: 6 }}>
          Tu as collecté <strong style={{ color: "#ffd740" }}>{menusCount * DIAMONDS_PER_MENU} 💎</strong>
        </div>
        <div style={{ color: "#81c784", fontSize: 13, marginBottom: 30, opacity: 0.85 }}>
          Retourne sur Bridge Eats pour réclamer ton menu !
        </div>

        {/* Bouton Bridge Eats */}
        <a
          href={BRIDGE_EATS_URL}
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "linear-gradient(135deg,#2e7d32,#66bb6a)",
            color: "#fff", borderRadius: 50,
            padding: "18px 44px", fontSize: 18, fontWeight: 900,
            textDecoration: "none", letterSpacing: 2,
            boxShadow: "0 0 40px #4caf5088, 0 6px 24px rgba(0,0,0,0.5)",
            marginBottom: 16,
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          🍔 RÉCLAMER MON MENU
        </a>

        <br />
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.1)", color: "#bbb",
            border: "1px solid rgba(255,255,255,0.2)", borderRadius: 30,
            padding: "10px 28px", fontSize: 13, cursor: "pointer", marginTop: 8,
          }}
        >
          Continuer à jouer
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
      position: "absolute", inset: 0,
      backgroundImage: "url(/assets/shark-warrior-night.jpeg)",
      backgroundSize: "cover", backgroundPosition: "center top",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "flex-end",
      paddingBottom: 28, pointerEvents: "auto",
    }}>
      {/* Overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.05) 35%,rgba(0,10,40,0.90) 70%,rgba(0,5,20,0.98) 100%)",
      }} />

      {/* Bouton Bridge Eats en haut à gauche */}
      <div style={{ position: "absolute", top: 16, left: 16, zIndex: 10, pointerEvents: "auto" }}>
        <BridgeEatsButton />
      </div>

      {/* Contenu bas */}
      <div style={{ position: "relative", textAlign: "center", width: "100%", padding: "0 20px" }}>

        {/* Titre */}
        <div style={{
          fontSize: 46, fontWeight: 900, letterSpacing: 3, color: "#fff",
          textShadow: "0 0 40px #1565c0, 0 4px 24px rgba(0,0,0,0.9)",
          lineHeight: 1, marginBottom: 4,
        }}>
          🦈 SAFI RUNNER
        </div>
        <div style={{ fontSize: 13, color: "#90caf9", marginBottom: 14, letterSpacing: 2, fontWeight: 600, textTransform: "uppercase" }}>
          Médina de Safi · Course Infinie 3D
        </div>

        {/* Carte menu gratuit */}
        <div style={{
          display: "inline-flex", flexDirection: "column", alignItems: "center",
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)",
          border: `1px solid ${menusEarned > 0 ? "#4caf50" : "rgba(255,140,0,0.4)"}`,
          borderRadius: 18, padding: "12px 22px", marginBottom: 16, minWidth: 260,
          boxShadow: menusEarned > 0 ? "0 0 20px #4caf5044" : "none",
        }}>
          {menusEarned > 0 ? (
            <>
              <div style={{ color: "#4caf50", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                🎉 {menusEarned} Menu{menusEarned > 1 ? "s" : ""} Gratuit{menusEarned > 1 ? "s" : ""} disponible{menusEarned > 1 ? "s" : ""} !
              </div>
              <a href={BRIDGE_EATS_URL} style={{
                color: "#a5d6a7", fontSize: 11, textDecoration: "underline", cursor: "pointer",
              }}>
                → Réclamer sur Bridge Eats
              </a>
            </>
          ) : (
            <>
              <div style={{ color: "#ffa726", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                🍔 Collecte 💎 pour un menu gratuit Bridge Eats
              </div>
              <div style={{ width: "100%", height: 7, background: "rgba(255,255,255,0.15)", borderRadius: 6, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(progressInCycle / DIAMONDS_PER_MENU) * 100}%`,
                  background: "linear-gradient(90deg,#ff6f00,#ffd54f)",
                  borderRadius: 6, transition: "width 0.5s",
                }} />
              </div>
              <div style={{ color: "#aaa", fontSize: 10, marginTop: 5 }}>
                💎 {progressInCycle} / {DIAMONDS_PER_MENU} pour 1 menu gratuit
              </div>
            </>
          )}
        </div>

        {/* Badges features */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {[
            { icon: "💎", text: "Collecte des diamants" },
            { icon: "🍽️", text: "Pauses toutes les 40s" },
            { icon: "🏆", text: "Score en ligne" },
          ].map((b, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.1)", backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20,
              padding: "5px 12px", fontSize: 11, color: "#e0e0e0",
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <span>{b.icon}</span> {b.text}
            </div>
          ))}
        </div>

        {/* Info contrôles */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 18, color: "#aaa", fontSize: 11 }}>
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
            padding: "18px 60px", fontSize: 22, fontWeight: 900,
            cursor: "pointer", letterSpacing: 3, textTransform: "uppercase",
            boxShadow: "0 0 30px #1565c088, 0 6px 24px rgba(0,0,0,0.6)",
            animation: "pulse 2s infinite", transition: "transform 0.1s",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          ▶ JOUER
        </button>
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
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      pointerEvents: "auto",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom,rgba(60,0,0,0.7) 0%,rgba(10,0,0,0.97) 100%)",
      }} />

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
                🍔 Réclamer sur Bridge Eats
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
    </div>
  );
}

/* ─── Export principal ───────────────────────────────────────── */
export function GameUI({
  phase, score, checkpointNumber, nextCheckpointAt, playTime,
  totalDiamonds, onStart, onRestart, onChangeLane, onJump,
}: GameUIProps) {
  const [showReward, setShowReward] = useState(false);
  const prevMenuCountRef = useRef(Math.floor(totalDiamonds / DIAMONDS_PER_MENU));

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

      {/* Écran démarrage */}
      {phase === "start" && !showReward && (
        <StartScreen onStart={onStart} totalDiamonds={totalDiamonds} />
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
