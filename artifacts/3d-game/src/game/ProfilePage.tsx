import { useEffect, useState } from "react";
import { useT } from "../lib/i18n";
import type { Profile } from "../lib/supabase";
import { getMyRank, updateUsername, type MenuEligibility } from "../lib/playerProfile";

interface Props {
  profile: Profile | null;
  eligibility: MenuEligibility;
  onClose: () => void;
}

function formatNum(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(Math.max(0, Math.floor(n)));
}

function shortId(id: string | undefined): string {
  const code = (id ?? "XXXXXX").toString().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `BR-${code}`;
}

export function ProfilePage({ profile, eligibility, onClose }: Props) {
  const { t } = useT();
  const [name, setName] = useState(profile?.username ?? "");
  const [savedFlash, setSavedFlash] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    setName(profile?.username ?? "");
  }, [profile?.username]);

  useEffect(() => {
    let cancel = false;
    const periodDiamonds = (profile as (Profile & { period_diamonds?: number }) | null)?.period_diamonds ?? 0;
    (async () => {
      const r = await getMyRank(periodDiamonds);
      if (!cancel) setRank(r);
    })();
    return () => { cancel = true; };
  }, [profile]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    const updated = await updateUsername(name);
    setSaving(false);
    if (updated) {
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1800);
    }
  };

  const periodDiamonds = (profile as (Profile & { period_diamonds?: number }) | null)?.period_diamonds ?? 0;
  const totalDiamonds = profile?.diamonds_collected ?? 0;
  const phone = profile?.bridge_phone ?? null;
  const firstPlay = profile?.first_play_date ?? null;

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 90,
      background: "linear-gradient(180deg,rgba(0,30,15,0.96) 0%,rgba(0,15,8,0.99) 60%,rgba(0,8,4,1) 100%)",
      overflowY: "auto", overflowX: "hidden",
      WebkitOverflowScrolling: "touch" as never,
      pointerEvents: "auto",
    }}>
      {/* Bouton × pour fermer — flottant en haut à droite */}
      <button
        onClick={onClose}
        aria-label={t("profile.close")}
        style={{
          position: "absolute", top: 14, right: 14, zIndex: 10,
          width: 38, height: 38, borderRadius: "50%",
          background: "rgba(0,0,0,0.55)", color: "#a5d6a7",
          border: "1px solid rgba(0,230,118,0.35)",
          fontSize: 20, fontWeight: 700, lineHeight: 1,
          cursor: "pointer", fontFamily: "'Segoe UI', sans-serif",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
        }}
      >×</button>

      <div style={{ maxWidth: 500, margin: "0 auto", padding: "24px 18px 80px" }}>

        {/* En-tête : avatar + identifiant uniquement (sobre) */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <div style={{
            position: "relative", width: 78, height: 78, flexShrink: 0,
          }}>
            <div style={{
              position: "absolute", inset: -3, borderRadius: "50%",
              background: "conic-gradient(from 0deg,#00e676,#00c853,#69f0ae,#00e676)",
              animation: "spinProf 6s linear infinite",
            }} />
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: "2px solid rgba(0,230,118,0.85)",
              background: "url(/assets/player-avatar.jpeg) center/cover",
              boxShadow: "0 0 22px rgba(0,230,118,0.5)",
            }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 22, color: "#fff", fontWeight: 900, lineHeight: 1.15,
              textShadow: "0 0 12px rgba(0,230,118,0.4)",
              fontFamily: "'Fredoka', monospace",
              letterSpacing: 1,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }} dir="ltr">
              {shortId(profile?.id)}
            </div>
          </div>
        </div>

        {/* Section IDENTITÉ */}
        <SectionCard title={t("profile.identityTitle")}>
          <Field label={t("profile.idLabel")} value={shortId(profile?.id)} mono />
          <Field label={t("profile.phoneLabel")}
                 value={phone ?? t("profile.phoneNone")}
                 muted={!phone} />

          {/* Edition username */}
          <div style={{ marginTop: 10 }}>
            <div style={{
              fontSize: 10, color: "#69f0ae", fontWeight: 700,
              letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6,
            }}>{t("profile.usernameLabel")}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={24}
                placeholder={t("profile.usernamePlaceholder")}
                style={{
                  flex: 1, minWidth: 0,
                  background: "rgba(0,0,0,0.45)",
                  border: "1px solid rgba(0,230,118,0.3)",
                  borderRadius: 10, padding: "9px 12px",
                  color: "#fff", fontSize: 14, fontWeight: 700,
                  outline: "none", fontFamily: "'Segoe UI', sans-serif",
                }}
              />
              <button
                onClick={handleSave}
                disabled={saving || !name.trim() || name.trim() === (profile?.username ?? "")}
                style={{
                  background: savedFlash
                    ? "linear-gradient(135deg,#00c853,#00e676)"
                    : "linear-gradient(135deg,rgba(0,200,83,0.85),rgba(0,230,118,0.85))",
                  color: "#003311", border: "none", borderRadius: 10,
                  padding: "9px 14px", fontSize: 12, fontWeight: 900,
                  letterSpacing: 0.5, cursor: "pointer",
                  opacity: (saving || !name.trim() || name.trim() === (profile?.username ?? "")) ? 0.55 : 1,
                  whiteSpace: "nowrap",
                }}>
                {savedFlash ? t("profile.usernameSaved") : t("profile.usernameSave")}
              </button>
            </div>
          </div>
        </SectionCard>

        {/* Section STATISTIQUES */}
        <SectionCard title={t("profile.statsTitle")}>
          <BigStat label={t("profile.totalDiamonds")} value={`${formatNum(totalDiamonds)} 💎`} color="#ffd54f" />
          <BigStat label={t("profile.cycleDiamonds")} value={`${formatNum(periodDiamonds)} 💎`} color="#90caf9" />
          <BigStat label={t("profile.rank")}
                   value={rank ? `#${rank}` : t("profile.rankNone")}
                   color={rank ? "#69f0ae" : "#9ec9b3"} />
        </SectionCard>

        {/* Section ENGAGEMENT BRIDGE */}
        <SectionCard title={t("profile.engagementTitle")}>
          <Field label={t("profile.streak")} value={`${eligibility.qualifyingDays} / 3`} />
          <Field label={t("profile.firstPlay")} value={firstPlay ?? "—"} />
          <Field label={t("profile.menusEarned")} value={String(eligibility.menusEarned)} />
          <Field label={t("profile.menusClaimed")} value={String(eligibility.menusClaimed)} />
        </SectionCard>

      </div>

      <style>{`@keyframes spinProf{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "linear-gradient(135deg,rgba(0,40,20,0.92),rgba(0,22,10,0.88))",
      border: "1.5px solid rgba(0,230,118,0.32)",
      borderRadius: 16, padding: "12px 14px 14px",
      marginBottom: 14,
      boxShadow: "0 6px 22px rgba(0,80,40,0.3)",
    }}>
      <div style={{
        fontSize: 12, color: "#00e676", fontWeight: 800, letterSpacing: 1.4,
        textTransform: "uppercase", marginBottom: 10,
      }}>{title}</div>
      {children}
    </div>
  );
}

function Field({ label, value, mono, muted }: { label: string; value: string; mono?: boolean; muted?: boolean }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      gap: 12, padding: "7px 0",
      borderBottom: "1px dashed rgba(0,230,118,0.12)",
    }}>
      <div style={{
        fontSize: 11, color: "#9ec9b3", fontWeight: 600, letterSpacing: 0.4,
      }}>{label}</div>
      <div dir="ltr" style={{
        fontSize: 13, color: muted ? "#5e7a6c" : "#fff", fontWeight: 800,
        fontFamily: mono ? "'Fredoka', monospace" : "'Segoe UI', sans-serif",
        textAlign: "end", maxWidth: "60%",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{value}</div>
    </div>
  );
}

function BigStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      gap: 12, padding: "9px 0",
      borderBottom: "1px dashed rgba(0,230,118,0.12)",
    }}>
      <div style={{
        fontSize: 11, color: "#9ec9b3", fontWeight: 600, letterSpacing: 0.4,
      }}>{label}</div>
      <div dir="ltr" style={{
        fontSize: 18, color, fontWeight: 900, lineHeight: 1.1,
        textShadow: `0 0 10px ${color}55`,
        fontFamily: "'Bangers', sans-serif", letterSpacing: 0.6,
      }}>{value}</div>
    </div>
  );
}
