import { useState, useEffect, useRef, useMemo } from "react";

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
  textAlign: "left",
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
          {correct}/3 bonnes réponses !
        </div>
        <div style={{ color: "#555", marginTop: 6, fontSize: 14 }}>
          {correct === 3
            ? "Parfait ! Tu connais bien la médina de Safi !"
            : correct >= 2
              ? "Très bien ! Continue à explorer la culture marocaine."
              : "Continue à apprendre ! Safi est une ville fascinante."}
        </div>
        <button style={BTN_PRIMARY} onClick={onComplete}>
          Reprendre la course 🏃
        </button>
      </div>
    );
  }

  const q = questions[current];
  return (
    <div>
      <div style={{ fontSize: 12, color: "#999", marginBottom: 8 }}>
        Question {current + 1} / {questions.length}
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
            <span style={{ fontWeight: 600, marginRight: 8 }}>{["A", "B", "C", "D"][i]}.</span>
            {opt}
            {answered && i === q.answer && " ✓"}
            {answered && i === selected && i !== q.answer && " ✗"}
          </button>
        );
      })}
      {answered && (
        <button style={{ ...BTN_PRIMARY, marginTop: 10 }} onClick={handleNext}>
          {current + 1 >= questions.length ? "Voir le résultat" : "Question suivante →"}
        </button>
      )}
    </div>
  );
}

// ——————————————————————————————————————————————
// FORMULAIRE DE SONDAGE
// ——————————————————————————————————————————————
const surveyQuestions = [
  { id: "name", label: "Votre prénom", type: "text", placeholder: "Ex : Ahmed" },
  { id: "city", label: "Votre ville", type: "text", placeholder: "Ex : Safi" },
  { id: "email", label: "Email (optionnel)", type: "email", placeholder: "votre@email.com" },
  { id: "opinion", label: "Que pensez-vous du jeu Safi Runner ?", type: "textarea", placeholder: "Votre avis..." },
];

function FormActivity({ onComplete }: { onComplete: () => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = () => {
    const errs: string[] = [];
    if (!values.name?.trim()) errs.push("Veuillez entrer votre prénom.");
    if (!values.city?.trim()) errs.push("Veuillez entrer votre ville.");
    if (rating === 0) errs.push("Veuillez donner une note au jeu.");
    setErrors(errs);
    if (errs.length === 0) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 52 }}>🙏</div>
        <div style={{ fontSize: 20, fontWeight: 800, marginTop: 8, color: "#e65100" }}>
          Merci pour votre avis !
        </div>
        <div style={{ color: "#555", marginTop: 6, fontSize: 14 }}>
          Votre retour aide à améliorer Safi Runner.
        </div>
        <button style={BTN_PRIMARY} onClick={onComplete}>
          Reprendre la course 🏃
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>
        Pendant votre pause au restaurant, partagez votre expérience avec nous !
      </div>
      {surveyQuestions.map((q) => (
        <div key={q.id} style={{ marginBottom: 4 }}>
          <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#444", marginBottom: 4 }}>
            {q.label}
          </label>
          {q.type === "textarea" ? (
            <textarea
              style={{ ...INPUT_STYLE, height: 72, resize: "vertical" }}
              placeholder={q.placeholder}
              value={values[q.id] || ""}
              onChange={(e) => setValues((v) => ({ ...v, [q.id]: e.target.value }))}
            />
          ) : (
            <input
              type={q.type}
              style={INPUT_STYLE}
              placeholder={q.placeholder}
              value={values[q.id] || ""}
              onChange={(e) => setValues((v) => ({ ...v, [q.id]: e.target.value }))}
            />
          )}
        </div>
      ))}

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#444", marginBottom: 8 }}>
          Note globale du jeu
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
        Envoyer mon avis ✓
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
          Merci d'avoir regardé !
        </div>
        <div style={{ color: "#555", fontSize: 14, marginTop: 6, marginBottom: 4 }}>
          {sponsor.offer}
        </div>
        <button style={BTN_PRIMARY} onClick={onComplete}>
          Reprendre la course 🏃
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
          📢 MESSAGE SPONSORISÉ
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
          <span>Publicité en cours…</span>
          <span>{timeLeft > 0 ? `Encore ${timeLeft}s` : "Terminée !"}</span>
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
          Continuer →
        </button>
      ) : (
        <button style={{ ...BTN_PRIMARY, opacity: 0.4, cursor: "not-allowed" }} disabled>
          Patienter {timeLeft}s…
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
        🤝 Quiz Sponsorisé par {quiz.brand}
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
            <span style={{ fontWeight: 600, marginRight: 8 }}>{["A", "B", "C", "D"][i]}.</span>
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
            💡 Le saviez-vous ? {quiz.funFact}
          </div>
          <button style={BTN_PRIMARY} onClick={onComplete}>
            Reprendre la course 🏃
          </button>
        </>
      )}
    </div>
  );
}

// ——————————————————————————————————————————————
// CHECKPOINT UI PRINCIPAL
// ——————————————————————————————————————————————
type ActivityType = "quiz" | "form" | "video" | "sponsorQuiz";

const activityTypes: ActivityType[] = ["quiz", "form", "video", "sponsorQuiz"];

const activityTitles: Record<ActivityType, string> = {
  quiz: "🕌 Quiz Culture Marocaine",
  form: "📝 Sondage Satisfaction",
  video: "📺 Pause Publicitaire",
  sponsorQuiz: "🤝 Quiz Sponsor",
};

const activitySubtitles: Record<ActivityType, string> = {
  quiz: "Testez votre connaissance de Safi et du Maroc !",
  form: "Partagez votre avis sur Safi Runner",
  video: "Découvrez nos partenaires locaux",
  sponsorQuiz: "Répondez et découvrez une info sur Safi !",
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
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const activity = useMemo<ActivityType>(
    () => activityTypes[(checkpointNumber - 1) % activityTypes.length],
    [checkpointNumber]
  );
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
            Arrêt #{checkpointNumber} — {venue}
          </div>
          <div style={{ fontSize: 13, color: "#777", marginTop: 2 }}>
            Score actuel : <strong>{score} 💎</strong>
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
                {activityTitles[activity]}
              </div>
              <div style={{ fontSize: 14, color: "#555" }}>
                {activitySubtitles[activity]}
              </div>
            </div>

            <div style={{ fontSize: 13, color: "#888", textAlign: "center", marginBottom: 16 }}>
              Complète l'activité pour reprendre ta course dans la médina de Safi !
            </div>

            <div style={{ textAlign: "center" }}>
              <button style={BTN_PRIMARY} onClick={() => setStarted(true)}>
                Commencer l'activité →
              </button>
            </div>
          </>
        )}

        {started && !completed && (
          <>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#e65100", marginBottom: 14, textAlign: "center" }}>
              {activityTitles[activity]}
            </div>
            {activity === "quiz" && <QuizActivity onComplete={handleComplete} />}
            {activity === "form" && <FormActivity onComplete={handleComplete} />}
            {activity === "video" && <VideoActivity onComplete={handleComplete} />}
            {activity === "sponsorQuiz" && <SponsorQuizActivity onComplete={handleComplete} />}
          </>
        )}

        {completed && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 52 }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#2e7d32", marginTop: 8 }}>
              Activité complétée !
            </div>
            <div style={{ color: "#555", fontSize: 14, marginTop: 6, marginBottom: 4 }}>
              Le requin reprend sa course dans la médina…
            </div>
            <button style={BTN_PRIMARY} onClick={onResume}>
              Reprendre la course 🏃
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
