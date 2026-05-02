import { useState, useEffect, useRef, useMemo } from "react";
import { useT } from "../lib/i18n";

interface CheckpointUIProps {
  checkpointNumber: number;
  score: number;
  onResume: () => void;
}

const OVERLAY: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0,0,0,0.70)",
  backdropFilter: "blur(6px)",
  zIndex: 100,
  fontFamily: "'Segoe UI', sans-serif",
  padding: 24,
};

const CARD: React.CSSProperties = {
  background: "linear-gradient(145deg, #fff8f0, #fff)",
  borderRadius: 24,
  padding: "32px 36px",
  maxWidth: 520,
  width: "100%",
  boxShadow: "0 12px 48px rgba(0,0,0,0.35)",
  border: "3px solid #ffd700",
  color: "#1a1a1a",
  overflowY: "auto",
  maxHeight: "88vh",
};

const BTN_PRIMARY: React.CSSProperties = {
  background: "linear-gradient(135deg, #e65100, #ff7043)",
  color: "#fff",
  border: "none",
  borderRadius: 40,
  padding: "14px 44px",
  fontSize: 17,
  fontWeight: 800,
  cursor: "pointer",
  letterSpacing: 1,
  boxShadow: "0 4px 16px rgba(230,81,0,0.4)",
  marginTop: 20,
};

const BTN_OPTION: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "start",
  background: "#fff",
  border: "2px solid #e0e0e0",
  borderRadius: 12,
  padding: "12px 18px",
  fontSize: 15,
  cursor: "pointer",
  marginBottom: 10,
  transition: "all 0.15s",
  fontFamily: "'Segoe UI', sans-serif",
  color: "#1a1a1a",
};

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  border: "2px solid #e0e0e0",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 14,
  fontFamily: "'Segoe UI', sans-serif",
  outline: "none",
  marginBottom: 12,
  color: "#1a1a1a",
  background: "#fafafa",
};

// ——————————————————————————————————————————————
// QUIZ DE CULTURE MAROCAINE
// ——————————————————————————————————————————————
const quizBank = [
  {
    q: "Quelle est la couleur dominante des zelliges de la mosquée de Safi ?",
    options: ["Rouge", "Vert", "Bleu", "Jaune"],
    answer: 2,
  },
  {
    q: "Safi est une ville côtière connue pour quelle industrie ?",
    options: ["Le textile", "La pêche et les sardines", "Le pétrole", "Le tourisme uniquement"],
    answer: 1,
  },
  {
    q: "Quelle est la langue officielle du Maroc ?",
    options: ["Français", "Espagnol", "Arabe", "Amazigh"],
    answer: 2,
  },
  {
    q: "Quel monument historique marque l'entrée de la médina de Safi ?",
    options: ["Bab Doukkala", "Kechla (château de la mer)", "Borj Nord", "Dar Jamai"],
    answer: 1,
  },
  {
    q: "Le potier de Safi est célèbre dans tout le Maroc. De quelle couleur est principalement sa céramique ?",
    options: ["Blanche et noire", "Verte et blanche", "Bleu et multicolore", "Beige uniquement"],
    answer: 2,
  },
  {
    q: "La médina de Safi est inscrite au patrimoine de quelle organisation ?",
    options: ["UNESCO", "Union Africaine", "Ligue Arabe", "ONU"],
    answer: 0,
  },
  {
    q: "Quelle épice est incontournable dans la cuisine marocaine ?",
    options: ["Curcuma", "Paprika", "Ras el hanout", "Safran uniquement"],
    answer: 2,
  },
  {
    q: "Qu'est-ce qu'un 'souk' dans la médina ?",
    options: ["Un palais", "Un marché traditionnel", "Une fontaine", "Un cimetière"],
    answer: 1,
  },
];

function QuizActivity({ onComplete }: { onComplete: () => void }) {
  const { t } = useT();
  const questions = useMemo(() => {
    const shuffled = [...quizBank].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, []);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const handleOption = (i: number) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === questions[current].answer) setCorrect((c) => c + 1);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  if (done) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 52 }}>{correct === 3 ? "🏆" : correct >= 2 ? "⭐" : "📚"}</div>
        <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8, color: "#e65100" }}>
          {t("quiz.score", { n: correct, total: 3 })}
        </div>
        <div style={{ color: "#555", marginTop: 6, fontSize: 14 }}>
          {correct === 3
            ? t("quiz.feedback.perfect")
            : correct >= 2
              ? t("quiz.feedback.good")
              : t("quiz.feedback.try")}
        </div>
        <button style={BTN_PRIMARY} onClick={onComplete}>
          {t("cp.resume")}
        </button>
      </div>
    );
  }

  const q = questions[current];
  return (
    <div>
      <div style={{ fontSize: 12, color: "#999", marginBottom: 8 }}>
        {t("quiz.questionOf", { n: current + 1, total: questions.length })}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 18, color: "#1a1a1a", lineHeight: 1.5 }}>
        {q.q}
      </div>
      {q.options.map((opt, i) => {
        let bg = "#fff";
        let border = "2px solid #e0e0e0";
        let color = "#1a1a1a";
        if (answered) {
          if (i === q.answer) { bg = "#e8f5e9"; border = "2px solid #4caf50"; color = "#2e7d32"; }
          else if (i === selected) { bg = "#ffebee"; border = "2px solid #f44336"; color = "#c62828"; }
        }
        if (!answered && selected === i) { bg = "#e3f2fd"; border = "2px solid #1976d2"; }
        return (
          <button
            key={i}
            style={{ ...BTN_OPTION, background: bg, border, color }}
            onClick={() => handleOption(i)}
          >
            <span style={{ fontWeight: 600, marginInlineEnd: 8 }}>{["A", "B", "C", "D"][i]}.</span>
            {opt}
            {answered && i === q.answer && " ✓"}
            {answered && i === selected && i !== q.answer && " ✗"}
          </button>
        );
      })}
      {answered && (
        <button style={{ ...BTN_PRIMARY, marginTop: 10 }} onClick={handleNext}>
          {current + 1 >= questions.length ? t("cp.seeResult") : t("cp.next")}
        </button>
      )}
    </div>
  );
}

// ——————————————————————————————————————————————
// FORMULAIRE DE SONDAGE
// ——————————————————————————————————————————————
function FormActivity({ onComplete }: { onComplete: () => void }) {
  const { t } = useT();
  const surveyQuestions: { id: string; labelKey: string; phKey: string; type: "text" | "email" | "textarea" }[] = [
    { id: "name",    labelKey: "form.field.name",    phKey: "form.field.namePh",    type: "text" },
    { id: "city",    labelKey: "form.field.city",    phKey: "form.field.cityPh",    type: "text" },
    { id: "email",   labelKey: "form.field.email",   phKey: "form.field.emailPh",   type: "email" },
    { id: "opinion", labelKey: "form.field.opinion", phKey: "form.field.opinionPh", type: "textarea" },
  ];

  const [values, setValues] = useState<Record<string, string>>({});
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = () => {
    const errs: string[] = [];
    if (!values.name?.trim()) errs.push(t("form.error.name"));
    if (!values.city?.trim()) errs.push(t("form.error.city"));
    if (rating === 0) errs.push(t("form.error.rating"));
    setErrors(errs);
    if (errs.length === 0) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 52 }}>🙏</div>
        <div style={{ fontSize: 20, fontWeight: 800, marginTop: 8, color: "#e65100" }}>
          {t("form.thanks.title")}
        </div>
        <div style={{ color: "#555", marginTop: 6, fontSize: 14 }}>
          {t("form.thanks.body")}
        </div>
        <button style={BTN_PRIMARY} onClick={onComplete}>
          {t("cp.resume")}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>
        {t("form.intro")}
      </div>
      {surveyQuestions.map((q) => (
        <div key={q.id} style={{ marginBottom: 4 }}>
          <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#444", marginBottom: 4 }}>
            {t(q.labelKey)}
          </label>
          {q.type === "textarea" ? (
            <textarea
              style={{ ...INPUT_STYLE, height: 72, resize: "vertical" }}
              placeholder={t(q.phKey)}
              value={values[q.id] || ""}
              onChange={(e) => setValues((v) => ({ ...v, [q.id]: e.target.value }))}
            />
          ) : (
            <input
              type={q.type}
              style={INPUT_STYLE}
              placeholder={t(q.phKey)}
              value={values[q.id] || ""}
              onChange={(e) => setValues((v) => ({ ...v, [q.id]: e.target.value }))}
            />
          )}
        </div>
      ))}

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#444", marginBottom: 8 }}>
          {t("form.rating")}
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              style={{ fontSize: 30, cursor: "pointer", color: star <= rating ? "#ffd700" : "#ccc", transition: "color 0.15s" }}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      {errors.length > 0 && (
        <div style={{ background: "#ffebee", borderRadius: 8, padding: "8px 14px", marginBottom: 8 }}>
          {errors.map((e, i) => <div key={i} style={{ color: "#c62828", fontSize: 13 }}>• {e}</div>)}
        </div>
      )}

      <button style={BTN_PRIMARY} onClick={handleSubmit}>
        {t("form.submit")}
      </button>
    </div>
  );
}

// ——————————————————————————————————————————————
// VIDÉO PUBLICITAIRE (SPONSOR)
// ——————————————————————————————————————————————
const sponsors = [
  {
    name: "Café Atlas – Safi",
    tagline: "Le meilleur café de la médina depuis 1952",
    color: "#4e342e",
    emoji: "☕",
    description:
      "Situé au cœur de la médina de Safi, le Café Atlas vous accueille avec un thé à la menthe frais, des pastillas maison et une vue imprenable sur les remparts historiques. Une pause authentique garantie !",
    offer: "Offre spéciale : Thé + pastilla offerts sur présentation du jeu 🎮",
  },
  {
    name: "Sardines de Safi 🐟",
    tagline: "Fraîcheur de l'Atlantique, saveur du terroir",
    color: "#1565c0",
    emoji: "🐟",
    description:
      "La conserverie El Bahr vous propose les meilleures sardines pêchées chaque matin dans les eaux de Safi. Nos produits sont exportés dans 40 pays. Goûtez l'authenticité directement à la source !",
    offer: "Visite guidée de la conserverie gratuite pour les joueurs de Safi Runner !",
  },
  {
    name: "Poterie Zine – Médina",
    tagline: "Art zellige depuis 5 générations",
    color: "#1b5e20",
    emoji: "🏺",
    description:
      "La famille Zine perpétue l'art de la poterie de Safi depuis 1890. Chaque pièce est faite à la main, décorée avec les motifs géométriques traditionnels de la région. Des cadeaux uniques pour vos proches.",
    offer: "-20% sur tout le magasin avec le code : SAFIRRUNNER",
  },
];

function VideoActivity({ onComplete }: { onComplete: () => void }) {
  const { t } = useT();
  const [timeLeft, setTimeLeft] = useState(15);
  const [canSkip, setCanSkip] = useState(false);
  const [finished, setFinished] = useState(false);
  const sponsor = useMemo(() => sponsors[Math.floor(Math.random() * sponsors.length)], []);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          setCanSkip(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, []);

  if (finished) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48 }}>✅</div>
        <div style={{ fontSize: 19, fontWeight: 800, color: "#e65100", marginTop: 8 }}>
          {t("ad.thanks")}
        </div>
        <div style={{ color: "#555", fontSize: 14, marginTop: 6, marginBottom: 4 }}>
          {sponsor.offer}
        </div>
        <button style={BTN_PRIMARY} onClick={onComplete}>
          {t("cp.resume")}
        </button>
      </div>
    );
  }

  const progress = ((15 - timeLeft) / 15) * 100;

  return (
    <div>
      {/* Sponsor card */}
      <div style={{
        background: sponsor.color,
        borderRadius: 16,
        padding: "24px",
        color: "white",
        marginBottom: 18,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative zellige pattern */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.08,
          backgroundImage: "repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)",
          backgroundSize: "12px 12px",
        }} />
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>
          {t("ad.sponsored")}
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>
          {sponsor.emoji} {sponsor.name}
        </div>
        <div style={{ fontSize: 14, fontStyle: "italic", opacity: 0.9, marginBottom: 12 }}>
          "{sponsor.tagline}"
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.95 }}>
          {sponsor.description}
        </div>
      </div>

      {/* Offer banner */}
      <div style={{
        background: "#fff8e1",
        border: "2px dashed #ffd700",
        borderRadius: 12,
        padding: "12px 16px",
        fontSize: 13,
        color: "#e65100",
        fontWeight: 700,
        marginBottom: 16,
      }}>
        🎁 {sponsor.offer}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#777", marginBottom: 4 }}>
          <span>{t("ad.playing")}</span>
          <span>{timeLeft > 0 ? t("ad.timeLeft", { s: timeLeft }) : t("ad.done")}</span>
        </div>
        <div style={{ height: 8, background: "#e0e0e0", borderRadius: 8, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #ffd700, #ff7043)",
            borderRadius: 8,
            transition: "width 1s linear",
          }} />
        </div>
      </div>

      {canSkip ? (
        <button style={BTN_PRIMARY} onClick={() => setFinished(true)}>
          {t("ad.continue")}
        </button>
      ) : (
        <button style={{ ...BTN_PRIMARY, opacity: 0.4, cursor: "not-allowed" }} disabled>
          {t("ad.wait", { s: timeLeft })}
        </button>
      )}
    </div>
  );
}

// ——————————————————————————————————————————————
// QUIZ RAPIDE SPONSOR
// ——————————————————————————————————————————————
const sponsorQuiz = [
  {
    brand: "🏺 Poterie de Safi",
    color: "#4caf50",
    q: "Depuis combien d'années la poterie est-elle une tradition à Safi ?",
    options: ["50 ans", "200 ans", "Plus de 500 ans", "30 ans"],
    answer: 2,
    funFact: "La poterie de Safi date de l'époque médiévale, soit plus de 500 ans de tradition !",
  },
  {
    brand: "☕ Thé à la Menthe du Maroc",
    color: "#2196f3",
    q: "Combien de sucre met-on traditionnellement dans un thé à la menthe marocain ?",
    options: ["Peu ou pas", "Beaucoup — il est très sucré", "Du miel uniquement", "Jamais de sucre"],
    answer: 1,
    funFact: "Le thé marocain est traditionnellement très sucré — c'est le secret de son goût incomparable !",
  },
  {
    brand: "🐟 Sardines de Safi",
    color: "#ff7043",
    q: "Safi est l'un des premiers ports de pêche à la sardine du monde. Dans combien de pays exporte-t-elle ?",
    options: ["5 pays", "15 pays", "Plus de 40 pays", "Uniquement au Maroc"],
    answer: 2,
    funFact: "Les sardines de Safi sont exportées dans plus de 40 pays à travers le monde !",
  },
  {
    brand: "🕌 Médina de Safi",
    color: "#9c27b0",
    q: "Comment s'appelle la forteresse portugaise emblématique de Safi ?",
    options: ["Ksar el-Bahr", "Borj Doukkala", "Dar Jamai", "Agadir"],
    answer: 0,
    funFact: "Ksar el-Bahr (Château de la Mer) est une forteresse portugaise du XVIe siècle !",
  },
];

function SponsorQuizActivity({ onComplete }: { onComplete: () => void }) {
  const { t } = useT();
  const quiz = useMemo(() => sponsorQuiz[Math.floor(Math.random() * sponsorQuiz.length)], []);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleOption = (i: number) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
  };

  return (
    <div>
      {/* Sponsor banner */}
      <div style={{
        background: quiz.color,
        borderRadius: 12,
        padding: "12px 18px",
        color: "white",
        fontWeight: 800,
        fontSize: 16,
        marginBottom: 18,
        textAlign: "center",
      }}>
        {t("spq.sponsoredBy", { brand: quiz.brand })}
      </div>

      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#1a1a1a", lineHeight: 1.5 }}>
        {quiz.q}
      </div>

      {quiz.options.map((opt, i) => {
        let bg = "#fff";
        let border = "2px solid #e0e0e0";
        let color = "#1a1a1a";
        if (answered) {
          if (i === quiz.answer) { bg = "#e8f5e9"; border = "2px solid #4caf50"; color = "#2e7d32"; }
          else if (i === selected) { bg = "#ffebee"; border = "2px solid #f44336"; color = "#c62828"; }
        }
        return (
          <button
            key={i}
            style={{ ...BTN_OPTION, background: bg, border, color }}
            onClick={() => handleOption(i)}
          >
            <span style={{ fontWeight: 600, marginInlineEnd: 8 }}>{["A", "B", "C", "D"][i]}.</span>
            {opt}
            {answered && i === quiz.answer && " ✓"}
            {answered && i === selected && i !== quiz.answer && " ✗"}
          </button>
        );
      })}

      {answered && (
        <>
          <div style={{
            background: "#f3e5f5",
            borderRadius: 10,
            padding: "12px 16px",
            fontSize: 13,
            color: "#6a1b9a",
            fontWeight: 600,
            marginTop: 6,
            marginBottom: 4,
          }}>
            {t("spq.didYouKnow", { fact: quiz.funFact })}
          </div>
          <button style={BTN_PRIMARY} onClick={onComplete}>
            {t("cp.resume")}
          </button>
        </>
      )}
    </div>
  );
}

// ——————————————————————————————————————————————
// SUIVRE LES RÉSEAUX (3 TAPS RAPIDES)
// ——————————————————————————————————————————————
const socialAccounts = [
  {
    name: "Bridge Eats",
    handle: "@bridge.eats",
    insta: "https://www.instagram.com/bridge.eats",
    facebook: "https://www.facebook.com/bridge.eats",
    tiktok: "https://www.tiktok.com/@bridge.eats",
  },
  {
    name: "Safi Runner",
    handle: "@safirunner",
    insta: "https://www.instagram.com/safirunner",
    facebook: "https://www.facebook.com/safirunner",
    tiktok: "https://www.tiktok.com/@safirunner",
  },
  {
    name: "Médina Safi",
    handle: "@medina.safi",
    insta: "https://www.instagram.com/medina.safi",
    facebook: "https://www.facebook.com/medina.safi",
    tiktok: "https://www.tiktok.com/@medina.safi",
  },
];

function SocialFollowActivity({ onComplete }: { onComplete: () => void }) {
  const { t } = useT();
  const account = useMemo(
    () => socialAccounts[Math.floor(Math.random() * socialAccounts.length)],
    []
  );
  const [followed, setFollowed] = useState({ insta: false, facebook: false, tiktok: false });

  const handleFollow = (platform: "insta" | "facebook" | "tiktok", url: string) => {
    setFollowed((f) => ({ ...f, [platform]: true }));
    try { window.open(url, "_blank", "noopener"); } catch {}
  };

  const allDone = followed.insta && followed.facebook && followed.tiktok;
  const count = Number(followed.insta) + Number(followed.facebook) + Number(followed.tiktok);

  const platforms = [
    { key: "insta" as const, label: "Instagram", icon: "📸", color: "linear-gradient(135deg,#fd1d1d,#fcb045,#833ab4)", url: account.insta },
    { key: "facebook" as const, label: "Facebook", icon: "👍", color: "linear-gradient(135deg,#1877f2,#0a4ea3)", url: account.facebook },
    { key: "tiktok" as const, label: "TikTok", icon: "🎵", color: "linear-gradient(135deg,#000,#25f4ee 60%,#fe2c55)", url: account.tiktok },
  ];

  if (allDone) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 52 }}>💖</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: "#e65100", marginTop: 8, fontFamily: "'Bangers', sans-serif", letterSpacing: 1 }}>
          {t("soc.thanks.title")}
        </div>
        <div style={{ color: "#555", marginTop: 6, fontSize: 14 }}>
          {t("soc.thanks.body")}
        </div>
        <button style={BTN_PRIMARY} onClick={onComplete}>
          {t("cp.resume")}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a" }}>
          {t("soc.followCta", { handle: account.handle })}
        </div>
        <div style={{ fontSize: 13, color: "#777", marginTop: 4 }}>
          {t("soc.tapAll", { n: count })}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
        {platforms.map((p) => (
          <button
            key={p.key}
            onClick={() => handleFollow(p.key, p.url)}
            disabled={followed[p.key]}
            style={{
              background: followed[p.key] ? "linear-gradient(135deg,#43a047,#2e7d32)" : p.color,
              color: "white",
              border: "3px solid #1a1a1a",
              borderRadius: 16,
              padding: "16px 18px",
              fontSize: 17,
              fontWeight: 800,
              cursor: followed[p.key] ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              boxShadow: followed[p.key] ? "0 2px 0 #1a1a1a" : "0 4px 0 #1a1a1a, 0 6px 16px rgba(0,0,0,0.3)",
              transform: followed[p.key] ? "translateY(2px)" : "translateY(0)",
              transition: "all 0.1s",
              fontFamily: "'Fredoka', sans-serif",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 26 }}>{p.icon}</span>
              <span>{p.label}</span>
            </span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>
              {followed[p.key] ? t("soc.followedBtn") : t("soc.followBtn")}
            </span>
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ height: 10, background: "#eee", borderRadius: 8, overflow: "hidden", marginBottom: 6 }}>
        <div style={{
          height: "100%",
          width: `${(count / 3) * 100}%`,
          background: "linear-gradient(90deg,#fd1d1d,#fcb045,#833ab4)",
          transition: "width 0.3s",
        }} />
      </div>
      <div style={{ fontSize: 11, color: "#999", textAlign: "center" }}>
        {t("soc.closeHint")}
      </div>
    </div>
  );
}

// ——————————————————————————————————————————————
// REEL RESTAURANT (mini vidéo verticale)
// ——————————————————————————————————————————————
const reelRestos = [
  {
    name: "Snack So Safi",
    handle: "@so.safi",
    tagline: "Le tajine de poisson le plus frais de Safi 🐟",
    bg: "linear-gradient(180deg,#1a237e 0%,#7e57c2 50%,#ff7043 100%)",
    items: ["Tajine sardine", "Pastilla poisson", "Couscous mer"],
    offer: "Code SAFIRUNNER → -15%",
    emoji: "🍽️",
  },
  {
    name: "Café Atlas",
    handle: "@cafe.atlas.safi",
    tagline: "Thé à la menthe & pâtisseries marocaines depuis 1952 ☕",
    bg: "linear-gradient(180deg,#3e2723 0%,#6d4c41 50%,#bf360c 100%)",
    items: ["Thé à la menthe", "Cornes de gazelle", "Briouates"],
    offer: "Thé offert pour les joueurs Safi Runner",
    emoji: "☕",
  },
  {
    name: "Pizzeria El Bahar",
    handle: "@elbahar.pizza",
    tagline: "Pizza croustillante au bord de l'océan 🌊",
    bg: "linear-gradient(180deg,#01579b 0%,#0288d1 50%,#ffd54f 100%)",
    items: ["Pizza thon Safi", "Calzone aux fruits de mer", "Salade Atlas"],
    offer: "1 pizza achetée = 1 boisson offerte",
    emoji: "🍕",
  },
  {
    name: "Burger Médina",
    handle: "@burger.medina",
    tagline: "Le smash burger fait main de la médina 🍔",
    bg: "linear-gradient(180deg,#bf360c 0%,#ff5722 50%,#ffeb3b 100%)",
    items: ["Smash classic", "Double cheese", "Burger kefta"],
    offer: "Menu maxi à 49 DH avec le code SAFI",
    emoji: "🍔",
  },
];

function ReelActivity({ onComplete }: { onComplete: () => void }) {
  const { t } = useT();
  const reel = useMemo(() => reelRestos[Math.floor(Math.random() * reelRestos.length)], []);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setProgress((p) => Math.min(100, p + 100 / 80)), 100);
    return () => clearInterval(id);
  }, []);

  const canContinue = progress >= 100;

  return (
    <div>
      {/* Phone frame style reel vertical */}
      <div style={{
        background: "#000",
        borderRadius: 24,
        padding: 6,
        margin: "0 auto 14px",
        maxWidth: 280,
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
      }}>
        <div style={{
          background: reel.bg,
          borderRadius: 20,
          height: 360,
          position: "relative",
          overflow: "hidden",
          color: "white",
        }}>
          {/* Progress bar reel */}
          <div style={{ position: "absolute", top: 8, left: 10, right: 10, height: 3, background: "rgba(255,255,255,0.3)", borderRadius: 2 }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "white", borderRadius: 2, transition: "width 0.1s linear" }} />
          </div>

          {/* Decorative emoji center */}
          <div style={{
            position: "absolute", top: "30%", left: 0, right: 0,
            textAlign: "center", fontSize: 100,
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
            animation: "pulse 2s infinite",
          }}>
            {reel.emoji}
          </div>

          {/* Bottom info */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 14px",
            background: "linear-gradient(0deg,rgba(0,0,0,0.7),transparent)" }}>
            <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Fredoka', sans-serif" }}>
              {reel.name}
            </div>
            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 6 }}>{reel.handle}</div>
            <div style={{ fontSize: 12, lineHeight: 1.4, marginBottom: 8 }}>{reel.tagline}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {reel.items.map((it, i) => (
                <span key={i} style={{
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: 8, padding: "3px 8px",
                  fontSize: 10, fontWeight: 600,
                  backdropFilter: "blur(4px)",
                }}>
                  {it}
                </span>
              ))}
            </div>
          </div>

          {/* Right action buttons (insta style) */}
          <div style={{ position: "absolute", right: 10, bottom: 100, display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
            <div onClick={() => setLiked(true)} style={{ cursor: "pointer", textAlign: "center" }}>
              <div style={{ fontSize: 30, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
                {liked ? "❤️" : "🤍"}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700 }}>{liked ? "1.2k" : "1.1k"}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>💬</div>
              <div style={{ fontSize: 10, fontWeight: 700 }}>89</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>📤</div>
              <div style={{ fontSize: 10, fontWeight: 700 }}>{t("reel.share")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Offer banner */}
      <div style={{
        background: "#fff8e1",
        border: "2px dashed #ffd700",
        borderRadius: 12,
        padding: "10px 14px",
        fontSize: 13,
        color: "#e65100",
        fontWeight: 700,
        marginBottom: 12,
        textAlign: "center",
      }}>
        🎁 {reel.offer}
      </div>

      {canContinue ? (
        <button style={BTN_PRIMARY} onClick={onComplete}>
          {t("cp.resume")}
        </button>
      ) : (
        <button style={{ ...BTN_PRIMARY, opacity: 0.4, cursor: "not-allowed" }} disabled>
          {t("reel.wait", { s: Math.ceil((100 - progress) / 12.5) })}
        </button>
      )}
    </div>
  );
}

// ——————————————————————————————————————————————
// CHECKPOINT UI PRINCIPAL
// ——————————————————————————————————————————————
type ActivityType = "quiz" | "form" | "video" | "sponsorQuiz" | "social" | "reel";

const activityTypes: ActivityType[] = ["reel", "social", "quiz", "video", "sponsorQuiz", "form"];

const activityTitleKey: Record<ActivityType, string> = {
  quiz: "act.title.quiz",
  form: "act.title.form",
  video: "act.title.video",
  sponsorQuiz: "act.title.sponsorQuiz",
  social: "act.title.social",
  reel: "act.title.reel",
};

const activitySubKey: Record<ActivityType, string> = {
  quiz: "act.sub.quiz",
  form: "act.sub.form",
  video: "act.sub.video",
  sponsorQuiz: "act.sub.sponsorQuiz",
  social: "act.sub.social",
  reel: "act.sub.reel",
};

const venueNames = [
  "Snack Dar El Bahar",
  "Restaurant Médina",
  "Café Atlas",
  "Chez Fatima – Tajines",
  "Snack El Waha",
  "Sandwicherie Safi Center",
];

export function CheckpointUI({ checkpointNumber, score, onResume }: CheckpointUIProps) {
  const { t } = useT();
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  /* Sélection aléatoire pondérée pour de la variété (au lieu d'un cycle prévisible) */
  const activity = useMemo<ActivityType>(() => {
    // Mélange : 1er checkpoint = reel resto (toujours engageant), puis aléatoire
    if (checkpointNumber === 1) return "reel";
    return activityTypes[Math.floor(Math.random() * activityTypes.length)];
  }, [checkpointNumber]);
  const venue = useMemo(
    () => venueNames[(checkpointNumber - 1) % venueNames.length],
    [checkpointNumber]
  );

  const handleComplete = () => setCompleted(true);

  return (
    <div style={OVERLAY}>
      <div style={CARD}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 36 }}>🛑</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#e65100", marginTop: 4 }}>
            {t("cp.header.stop", { n: checkpointNumber, venue })}
          </div>
          <div style={{ fontSize: 13, color: "#777", marginTop: 2 }}>
            {t("cp.currentScore", { n: score })}
          </div>
        </div>

        {!started && !completed && (
          <>
            {/* Activity preview */}
            <div style={{
              background: "linear-gradient(135deg, #fff8e1, #fce4ec)",
              borderRadius: 14,
              padding: "18px 20px",
              textAlign: "center",
              marginBottom: 18,
              border: "2px solid #ffe082",
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a", marginBottom: 4 }}>
                {t(activityTitleKey[activity])}
              </div>
              <div style={{ fontSize: 14, color: "#555" }}>
                {t(activitySubKey[activity])}
              </div>
            </div>

            <div style={{ fontSize: 13, color: "#888", textAlign: "center", marginBottom: 16 }}>
              {t("cp.completePrompt")}
            </div>

            <div style={{ textAlign: "center" }}>
              <button style={BTN_PRIMARY} onClick={() => setStarted(true)}>
                {t("cp.startActivity")}
              </button>
            </div>
          </>
        )}

        {started && !completed && (
          <>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#e65100", marginBottom: 14, textAlign: "center" }}>
              {t(activityTitleKey[activity])}
            </div>
            {activity === "quiz" && <QuizActivity onComplete={handleComplete} />}
            {activity === "form" && <FormActivity onComplete={handleComplete} />}
            {activity === "video" && <VideoActivity onComplete={handleComplete} />}
            {activity === "sponsorQuiz" && <SponsorQuizActivity onComplete={handleComplete} />}
            {activity === "social" && <SocialFollowActivity onComplete={handleComplete} />}
            {activity === "reel" && <ReelActivity onComplete={handleComplete} />}
          </>
        )}

        {completed && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 52 }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#2e7d32", marginTop: 8 }}>
              {t("cp.completed")}
            </div>
            <div style={{ color: "#555", fontSize: 14, marginTop: 6, marginBottom: 4 }}>
              {t("cp.completedBody")}
            </div>
            <button style={BTN_PRIMARY} onClick={onResume}>
              {t("cp.resume")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
