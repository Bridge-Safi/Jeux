import { useEffect, useState } from "react";

export type Lang = "fr" | "en" | "ar";

export const LANGS: ReadonlyArray<{ code: Lang; label: string; flag: string; dir: "ltr" | "rtl" }> = [
  { code: "fr", label: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "en", label: "English",  flag: "🇬🇧", dir: "ltr" },
  { code: "ar", label: "العربية",  flag: "🇲🇦", dir: "rtl" },
];

const STORAGE_KEY = "safi_runner_lang";

const DICT: Record<Lang, Record<string, string>> = {
  /* ─────────────────── FRANÇAIS ─────────────────── */
  fr: {
    "lang.label": "Langue",

    /* Bridge / Engagement */
    "bridge.programTitle": "🦈 Bridge Shark — Menu gratuit",
    "bridge.diamonds": "💎 Diamants",
    "bridge.activeDays": "📅 Jours consécutifs (3-4h)",
    "bridge.todayLabel": "⏱️ Aujourd'hui : {time}",
    "bridge.dayBadge": "J{n}",
    "bridge.menusReady": "🎉 {n} menu gratuit prêt !",
    "bridge.menusReadyPlural": "🎉 {n} menus gratuits prêts !",
    "bridge.claimHint": "Réclame ton menu sur Bridge Eats avec ton n° de téléphone",
    "bridge.timeRemaining.minutes": "{m} min restantes",
    "bridge.timeRemaining.hours": "{h}h{rest} restantes",
    "bridge.timeRemaining.done": "✓ jour validé",
    "bridge.session": "5 jours · 3-4h/jour",
    "bridge.objective": "Objectif",
    "bridge.myDiamonds": "Mes diamants",
    "bridge.progress": "Progression",
    "bridge.playNow": "🎮 JOUER MAINTENANT",
    "bridge.howTitle": "🏆 Comment gagner ?",
    "bridge.how.duration": "⏱️ Joue 3 à 4h par jour pendant 5 jours consécutifs (15h min total)",
    "bridge.how.rate": "💎 Récolte 1 000 💎 par heure — objectif 15 000 💎",
    "bridge.how.shortfall": "💰 Diamants manquants ? 1 000 💎 = 5 DH",
    "bridge.how.bonus": "🎁 Bonus : joue 2h DE PLUS → +2 000 💎 + livraison 100% GRATUITE",
    "bridge.how.social": "📱 À chaque checkpoint : suis les 4 réseaux Bridge Eats (FB · YT · Insta · TikTok) pour reprendre",
    "bridge.how.obstacles": "🍲 Évite les obstacles marocains : tajine · couscous · barbecue de sardines",
    "bridge.how.claim": "🛵🚕 Le 6ᵉ jour : réclame ton menu sur Bridge Eats",

    /* Blockers */
    "blocker.diamonds": "Encore {n} 💎 à collecter",
    "blocker.days": "Encore {n} jour consécutif (3-4h) à valider",
    "blocker.daysPlural": "Encore {n} jours consécutifs (3-4h) à valider",
    "blocker.wait": "Reviens dans {n} jour pour réclamer",
    "blocker.waitPlural": "Reviens dans {n} jours pour réclamer",

    /* Start screen */
    "start.title": "🦈 SAFI RUNNER",
    "start.subtitle": "Médina de Safi · Course Infinie 3D",
    "start.play": "▶ JOUER",
    "start.controls.lanes": "◀ ▶ Voies",
    "start.controls.jump": "↑ / Espace Sauter",
    "start.controls.touch": "Boutons tactiles ✓",
    "start.badge.diamonds": "Collecte des diamants",
    "start.badge.days": "{n} jours consécutifs",
    "start.badge.menu": "Menu offert au 6ᵉ jour",

    /* HUD */
    "hud.coins": "Pièces",
    "hud.diamonds": "Diamants",
    "hud.score": "Score",
    "hud.nextStop": "🍽️ Prochain arrêt · {s}s",
    "ui.darkOn": "Mode sombre activé",
    "ui.darkOff": "Mode sombre désactivé",
    "ui.dark": "Sombre",
    "ui.light": "Clair",
    "ui.music": "Musique",
    "ui.musicOn": "Musique orientale activée",
    "ui.musicOff": "Musique coupée",
    "auth.locked.kicker": "Connexion Bridge Eats requise",
    "auth.locked.title": "🦈 SAFI RUNNER",
    "auth.locked.body": "Pour jouer, connecte-toi d'abord sur Bridge Eats avec ton email et ton numéro. Tu seras automatiquement reconnu sur le jeu et tes diamants seront synchronisés.",
    "auth.locked.cta": "Me connecter sur Bridge Eats",
    "auth.locked.why": "🔐 Bridge Eats gère la connexion. Tes 💎 sont liés à ton compte — joue depuis n'importe quel appareil avec le même email.",

    /* Touch controls */
    "controls.swipeHint": "← SWIPE pour changer de voie · SWIPE ↑ pour sauter →",

    /* Instructions */
    "instr.title": "🦈 COMMENT JOUER",
    "instr.subtitle": "SAFI RUNNER",
    "instr.row.lanes.label": "Changer de voie",
    "instr.row.lanes.desc": "Boutons GAUCHE / DROITE ou flèches clavier",
    "instr.row.jump.label": "Sauter",
    "instr.row.jump.desc": "Bouton SAUTER, flèche ↑ ou Espace",
    "instr.row.diamonds.label": "Collecte les diamants",
    "instr.row.diamonds.desc": "Cours sur les diamants bleus pour les ramasser",
    "instr.row.obstacles.label": "Évite les obstacles",
    "instr.row.obstacles.desc": "Change de voie ou saute par-dessus",
    "instr.howTitle": "🦈 Comment gagner un menu Bridge Shark",
    "instr.how.collect": "Collecte {n} 💎 au total (rythme : 1 000 💎/h)",
    "instr.how.play": "Joue 3 à 4h par jour pendant {d} jours CONSÉCUTIFS",
    "instr.how.day4": "Le 6ᵉ jour : entre ton n° Bridge Eats pour réclamer le menu",
    "instr.how.ads": "📱 Pause toutes les 40s : suis les 4 réseaux Bridge Eats (FB · YT · Insta · TikTok)",
    "instr.how.shortfall": "💸 Pas assez de 💎 ? Complète : 1 000 💎 manquants = 5 DH",
    "instr.how.bonus": "🎁 Bonus : joue 2h DE PLUS → +2 000 💎 + livraison 100% GRATUITE",
    "instr.row.gamepad.label": "🎮 Manette PS4 / PS5",
    "instr.row.gamepad.desc": "Stick gauche ou D-pad pour les voies, ✕ pour sauter",
    "instr.responsive": "📱💻📺 Smartphone · Tablette · PC · TV — toutes tailles d'écran",
    "instr.launch": "▶ LANCER LE JEU",

    /* Complément payant : 1 000 💎 = 5 DH */
    "shortfall.title": "💸 Compléter avec un petit paiement",
    "shortfall.body": "Il vous manque {miss} 💎 — payez {dh} DH pour débloquer maintenant (1 000 💎 = 5 DH).",
    "shortfall.cta": "💳 PAYER {dh} DH POUR COMPLÉTER",
    "shortfall.help": "Le paiement se fait depuis la page Bridge Eats. Le complément est ajouté à votre solde 💎.",

    /* Manette */
    "gamepad.connected": "🎮 Manette connectée",

    /* Claim overlay */
    "claim.unlocked.title": "MENU GRATUIT\nDÉBLOQUÉ !",
    "claim.unlocked.body": "Tu as joué {days} jours et collecté {diamonds} 💎",
    "claim.unlocked.daySingular": "Tu as joué {days} jour et collecté {diamonds} 💎",
    "claim.notReady.title": "Pas encore prêt",
    "claim.phone.label": "📱 Ton n° de téléphone Bridge Eats",
    "claim.phone.help": "Ce numéro identifie ton compte Bridge — c'est lui qui recevra ton menu gratuit. Un seul menu par numéro.",
    "claim.phone.placeholder": "+212 6XX XXXXXX  ou  06XX XXXXXX",
    "claim.phone.empty": "Entre ton numéro Bridge Eats.",
    "claim.phone.invalid": "Numéro invalide. Format : +212XXXXXXXXX ou 0XXXXXXXXX",
    "claim.phone.taken": "Un compte Bridge utilise déjà ce numéro.",
    "claim.error.generic": "Erreur — réessaie.",
    "claim.error.notMet": "Conditions de réclamation non remplies (vérifié côté serveur).",
    "claim.button.claim": "🛵🚕 RÉCLAMER MON MENU",
    "claim.button.checking": "Vérification…",
    "claim.button.continue": "Continuer à jouer",
    "claim.button.continuePlay": "▶ Continuer à jouer",
    "claim.done.title": "✅ Numéro enregistré !",
    "claim.done.body": "Ton menu sera lié à ton compte Bridge Eats. Clique ci-dessous pour le commander.",
    "claim.done.cta": "🛵🚕 ALLER SUR BRIDGE EATS",

    /* Game Over */
    "over.title": "GAME OVER",
    "over.subtitle": "Le Requin Guerrier s'est arrêté !",
    "over.stat.session": "Session",
    "over.stat.score": "Score",
    "over.stat.stops": "Pauses",
    "over.stat.sardines": "Sardines",
    "over.restart": "🔄 RECOMMENCER",

    /* Supabase panel */
    "db.connected": "● Connecté",
    "db.connecting": "● Connexion…",
    "db.offline": "● Hors-ligne",
    "db.error": "● Erreur",
    "db.loading": "Chargement du profil…",
    "db.unavailable": "Profil non disponible.",
    "db.user": "👤",
    "db.totalDiamonds": "💎 Total :",
    "db.sardines": "🐟 Sardines :",

    /* Checkpoint — common */
    "cp.resume": "Reprendre la course 🏃",
    "cp.next": "Question suivante →",
    "cp.seeResult": "Voir le résultat",
    "cp.header.stop": "Arrêt #{n} — {venue}",
    "cp.currentScore": "Score actuel : {n} 💎",
    "cp.completePrompt": "Complète l'activité pour reprendre ta course dans la médina de Safi !",
    "cp.startActivity": "Commencer l'activité →",
    "cp.completed": "Activité complétée !",
    "cp.completedBody": "Le requin reprend sa course dans la médina…",
    "act.title.quiz": "🕌 Quiz Culture Marocaine",
    "act.title.form": "📝 Sondage Satisfaction",
    "act.title.video": "📺 Pause Publicitaire",
    "act.title.sponsorQuiz": "🤝 Quiz Sponsor",
    "act.title.social": "💖 Suis-nous sur les réseaux !",
    "act.title.reel": "🎬 Reel Sponsor",
    "act.sub.quiz": "Testez votre connaissance de Safi et du Maroc !",
    "act.sub.form": "Partagez votre avis sur Safi Runner",
    "act.sub.video": "Découvrez nos partenaires locaux",
    "act.sub.sponsorQuiz": "Répondez et découvrez une info sur Safi !",
    "act.sub.social": "4 taps rapides : Insta, Facebook, TikTok, YouTube",
    "act.sub.reel": "Découvre un partenaire Safi Runner en 8s",
    "soc.followCta": "Suis {handle}",
    "soc.tapAll": "Suis les 4 réseaux pour continuer ({n}/4)",
    "soc.followBtn": "Suivre",
    "soc.followedBtn": "Suivi",
    "soc.closeHint": "Le jeu reste actif derrière la pub",
    "soc.confirmFollowed": "J'ai bien suivi cette page",
    "soc.openInPopup": "Ouvrir en mini-fenêtre",
    "soc.embed.fbHint": "Clique sur \"J'aime\" dans le cadre Facebook ci-dessus, puis confirme.",
    "soc.embed.ytHint": "Clique sur S'ABONNER, puis confirme.",
    "soc.embed.popupHint": "Cette plateforme bloque les boutons de suivi externes. Clique pour ouvrir une mini-fenêtre par-dessus le jeu, suis la page, puis confirme.",
    "reel.wait": "Patienter… {s}s",
    "reel.share": "Partager",
    "bubble.cta": "📢 Suis {handle} — {n}/4 réseaux",
    "bubble.done": "✅ Compte suivi sur 4 réseaux !",
    "bubble.followToContinue": "Suis les 4 réseaux pour continuer ↓",

    /* Checkpoint — quiz */
    "quiz.questionOf": "Question {n} / {total}",
    "quiz.score": "{n}/{total} bonnes réponses !",
    "quiz.feedback.perfect": "Parfait ! Tu connais bien la médina de Safi !",
    "quiz.feedback.good": "Très bien ! Continue à explorer la culture marocaine.",
    "quiz.feedback.try": "Continue à apprendre ! Safi est une ville fascinante.",

    /* Checkpoint — form */
    "form.intro": "Pendant votre pause au restaurant, partagez votre expérience avec nous !",
    "form.field.name": "Votre prénom",
    "form.field.namePh": "Ex : Ahmed",
    "form.field.city": "Votre ville",
    "form.field.cityPh": "Ex : Safi",
    "form.field.email": "Email (optionnel)",
    "form.field.emailPh": "votre@email.com",
    "form.field.opinion": "Que pensez-vous du jeu Safi Runner ?",
    "form.field.opinionPh": "Votre avis...",
    "form.rating": "Note globale du jeu",
    "form.submit": "Envoyer mon avis ✓",
    "form.error.name": "Veuillez entrer votre prénom.",
    "form.error.city": "Veuillez entrer votre ville.",
    "form.error.rating": "Veuillez donner une note au jeu.",
    "form.thanks.title": "Merci pour votre avis !",
    "form.thanks.body": "Votre retour aide à améliorer Safi Runner.",

    /* Checkpoint — video ad */
    "ad.sponsored": "📢 MESSAGE SPONSORISÉ",
    "ad.playing": "Publicité en cours…",
    "ad.timeLeft": "Encore {s}s",
    "ad.done": "Terminée !",
    "ad.continue": "Continuer →",
    "ad.wait": "Patienter {s}s…",
    "ad.thanks": "Merci d'avoir regardé !",

    /* Checkpoint — sponsor quiz */
    "spq.sponsoredBy": "🤝 Quiz Sponsorisé par {brand}",
    "spq.didYouKnow": "💡 Le saviez-vous ? {fact}",

    /* Checkpoint — social */
    "soc.thanks.title": "Merci de nous suivre !",
    "soc.thanks.body": "Ton soutien aide la médina de Safi à briller en ligne 🌟",
  },

  /* ─────────────────── ENGLISH ─────────────────── */
  en: {
    "lang.label": "Language",

    "bridge.programTitle": "🦈 Bridge Shark — Free Meal",
    "bridge.diamonds": "💎 Diamonds",
    "bridge.activeDays": "📅 Consecutive days (3-4h)",
    "bridge.todayLabel": "⏱️ Today: {time}",
    "bridge.dayBadge": "D{n}",
    "bridge.menusReady": "🎉 {n} free meal ready!",
    "bridge.menusReadyPlural": "🎉 {n} free meals ready!",
    "bridge.claimHint": "Claim your meal on Bridge Eats with your phone number",
    "bridge.timeRemaining.minutes": "{m} min left",
    "bridge.timeRemaining.hours": "{h}h{rest} left",
    "bridge.timeRemaining.done": "✓ day validated",
    "bridge.session": "5 days · 3-4h/day",
    "bridge.objective": "Goal",
    "bridge.myDiamonds": "My diamonds",
    "bridge.progress": "Progress",
    "bridge.playNow": "🎮 PLAY NOW",
    "bridge.howTitle": "🏆 How to win?",
    "bridge.how.duration": "⏱️ Play 3-4h per day for 5 consecutive days (15h min total)",
    "bridge.how.rate": "💎 Collect 1,000 💎 per hour — goal 15,000 💎",
    "bridge.how.shortfall": "💰 Missing diamonds? 1,000 💎 = 5 DH",
    "bridge.how.bonus": "🎁 Bonus: play 2h MORE → +2,000 💎 + 100% FREE delivery",
    "bridge.how.social": "📱 At every checkpoint: follow all 4 Bridge Eats socials (FB · YT · Insta · TikTok) to resume",
    "bridge.how.obstacles": "🍲 Dodge Moroccan obstacles: tajine · couscous · sardine BBQ",
    "bridge.how.claim": "🛵🚕 On day 6: claim your meal on Bridge Eats",

    "blocker.diamonds": "{n} more 💎 to collect",
    "blocker.days": "{n} more consecutive day (3-4h) to validate",
    "blocker.daysPlural": "{n} more consecutive days (3-4h) to validate",
    "blocker.wait": "Come back in {n} day to claim",
    "blocker.waitPlural": "Come back in {n} days to claim",

    "start.title": "🦈 SAFI RUNNER",
    "start.subtitle": "Medina of Safi · 3D Endless Runner",
    "start.play": "▶ PLAY",
    "start.controls.lanes": "◀ ▶ Lanes",
    "start.controls.jump": "↑ / Space Jump",
    "start.controls.touch": "Touch buttons ✓",
    "start.badge.diamonds": "Collect diamonds",
    "start.badge.days": "{n} consecutive days",
    "start.badge.menu": "Free meal on day 6",

    "hud.coins": "Coins",
    "hud.diamonds": "Diamonds",
    "hud.score": "Score",
    "hud.nextStop": "🍽️ Next stop · {s}s",
    "ui.darkOn": "Dark mode on",
    "ui.darkOff": "Dark mode off",
    "ui.dark": "Dark",
    "ui.light": "Light",
    "ui.music": "Music",
    "ui.musicOn": "Oriental music on",
    "ui.musicOff": "Music muted",
    "auth.locked.kicker": "Bridge Eats login required",
    "auth.locked.title": "🦈 SAFI RUNNER",
    "auth.locked.body": "To play, sign in to Bridge Eats first with your email and phone. You'll be recognized automatically and your diamonds will sync across devices.",
    "auth.locked.cta": "Sign in on Bridge Eats",
    "auth.locked.why": "🔐 Bridge Eats handles the login. Your 💎 are tied to your account — play from any device with the same email.",

    "controls.swipeHint": "← SWIPE to switch lane · SWIPE ↑ to jump →",

    "instr.title": "🦈 HOW TO PLAY",
    "instr.subtitle": "SAFI RUNNER",
    "instr.row.lanes.label": "Switch lane",
    "instr.row.lanes.desc": "LEFT / RIGHT buttons or arrow keys",
    "instr.row.jump.label": "Jump",
    "instr.row.jump.desc": "JUMP button, ↑ arrow or Space",
    "instr.row.diamonds.label": "Collect diamonds",
    "instr.row.diamonds.desc": "Run over the blue diamonds to grab them",
    "instr.row.obstacles.label": "Avoid obstacles",
    "instr.row.obstacles.desc": "Switch lane or jump over",
    "instr.howTitle": "🦈 How to win a Bridge Shark meal",
    "instr.how.collect": "Collect {n} 💎 total (rate: 1,000 💎/h)",
    "instr.how.play": "Play 3-4h per day for {d} CONSECUTIVE days",
    "instr.how.day4": "On day 6: enter your Bridge Eats phone to claim the meal",
    "instr.how.ads": "📱 Break every 40s: follow all 4 Bridge Eats socials (FB · YT · Insta · TikTok)",
    "instr.how.shortfall": "💸 Not enough 💎? Top up: 1,000 missing 💎 = 5 DH",
    "instr.how.bonus": "🎁 Bonus: play 2h MORE → +2,000 💎 + 100% FREE delivery",
    "instr.row.gamepad.label": "🎮 PS4 / PS5 Controller",
    "instr.row.gamepad.desc": "Left stick or D-pad to switch lanes, ✕ to jump",
    "instr.responsive": "📱💻📺 Phone · Tablet · PC · TV — all screen sizes",
    "instr.launch": "▶ START THE GAME",

    "shortfall.title": "💸 Top up with a small payment",
    "shortfall.body": "You're {miss} 💎 short — pay {dh} DH to unlock now (1,000 💎 = 5 DH).",
    "shortfall.cta": "💳 PAY {dh} DH TO COMPLETE",
    "shortfall.help": "Payment happens on the Bridge Eats page. The top-up is added to your 💎 balance.",

    "gamepad.connected": "🎮 Controller connected",

    "claim.unlocked.title": "FREE MEAL\nUNLOCKED!",
    "claim.unlocked.body": "You played {days} days and collected {diamonds} 💎",
    "claim.unlocked.daySingular": "You played {days} day and collected {diamonds} 💎",
    "claim.notReady.title": "Not ready yet",
    "claim.phone.label": "📱 Your Bridge Eats phone number",
    "claim.phone.help": "This number identifies your Bridge account — it will receive your free meal. One meal per number.",
    "claim.phone.placeholder": "+212 6XX XXXXXX  or  06XX XXXXXX",
    "claim.phone.empty": "Enter your Bridge Eats number.",
    "claim.phone.invalid": "Invalid number. Format: +212XXXXXXXXX or 0XXXXXXXXX",
    "claim.phone.taken": "A Bridge account already uses this number.",
    "claim.error.generic": "Error — try again.",
    "claim.error.notMet": "Claim conditions not met (verified server-side).",
    "claim.button.claim": "🛵🚕 CLAIM MY MEAL",
    "claim.button.checking": "Checking…",
    "claim.button.continue": "Keep playing",
    "claim.button.continuePlay": "▶ Keep playing",
    "claim.done.title": "✅ Number registered!",
    "claim.done.body": "Your meal will be linked to your Bridge Eats account. Click below to order.",
    "claim.done.cta": "🛵🚕 GO TO BRIDGE EATS",

    "over.title": "GAME OVER",
    "over.subtitle": "The Shark Warrior has stopped!",
    "over.stat.session": "Session",
    "over.stat.score": "Score",
    "over.stat.stops": "Stops",
    "over.stat.sardines": "Sardines",
    "over.restart": "🔄 RESTART",

    "db.connected": "● Connected",
    "db.connecting": "● Connecting…",
    "db.offline": "● Offline",
    "db.error": "● Error",
    "db.loading": "Loading profile…",
    "db.unavailable": "Profile unavailable.",
    "db.user": "👤",
    "db.totalDiamonds": "💎 Total:",
    "db.sardines": "🐟 Sardines:",

    "cp.resume": "Resume the run 🏃",
    "cp.next": "Next question →",
    "cp.seeResult": "See the result",
    "cp.header.stop": "Stop #{n} — {venue}",
    "cp.currentScore": "Current score: {n} 💎",
    "cp.completePrompt": "Complete the activity to keep running through the Safi medina!",
    "cp.startActivity": "Start the activity →",
    "cp.completed": "Activity completed!",
    "cp.completedBody": "The shark is back on the run through the medina…",
    "act.title.quiz": "🕌 Moroccan Culture Quiz",
    "act.title.form": "📝 Satisfaction Survey",
    "act.title.video": "📺 Ad Break",
    "act.title.sponsorQuiz": "🤝 Sponsor Quiz",
    "act.title.social": "💖 Follow us on social!",
    "act.title.reel": "🎬 Sponsor Reel",
    "act.sub.quiz": "Test your knowledge of Safi and Morocco!",
    "act.sub.form": "Share your opinion about Safi Runner",
    "act.sub.video": "Discover our local partners",
    "act.sub.sponsorQuiz": "Answer and learn a fun fact about Safi!",
    "act.sub.social": "4 quick taps: Insta, Facebook, TikTok, YouTube",
    "act.sub.reel": "Discover a Safi Runner partner in 8s",
    "soc.followCta": "Follow {handle}",
    "soc.tapAll": "Follow the 4 networks to continue ({n}/4)",
    "soc.followBtn": "Follow",
    "soc.followedBtn": "Followed",
    "soc.closeHint": "The game stays running behind this ad",
    "soc.confirmFollowed": "I have followed this page",
    "soc.openInPopup": "Open in mini window",
    "soc.embed.fbHint": "Click \"Like\" inside the Facebook box above, then confirm.",
    "soc.embed.ytHint": "Click SUBSCRIBE, then confirm.",
    "soc.embed.popupHint": "This platform blocks third-party follow buttons. Tap to open a mini window above the game, follow the page, then confirm.",
    "reel.wait": "Wait… {s}s",
    "reel.share": "Share",
    "bubble.cta": "📢 Follow {handle} — {n}/4 networks",
    "bubble.done": "✅ Account followed on 4 networks!",
    "bubble.followToContinue": "Follow the 4 networks to continue ↓",

    "quiz.questionOf": "Question {n} / {total}",
    "quiz.score": "{n}/{total} correct answers!",
    "quiz.feedback.perfect": "Perfect! You really know the Safi medina!",
    "quiz.feedback.good": "Well done! Keep exploring Moroccan culture.",
    "quiz.feedback.try": "Keep learning! Safi is a fascinating city.",

    "form.intro": "While you take a restaurant break, share your experience with us!",
    "form.field.name": "Your first name",
    "form.field.namePh": "e.g. Ahmed",
    "form.field.city": "Your city",
    "form.field.cityPh": "e.g. Safi",
    "form.field.email": "Email (optional)",
    "form.field.emailPh": "your@email.com",
    "form.field.opinion": "What do you think of Safi Runner?",
    "form.field.opinionPh": "Your opinion...",
    "form.rating": "Overall rating",
    "form.submit": "Submit my review ✓",
    "form.error.name": "Please enter your first name.",
    "form.error.city": "Please enter your city.",
    "form.error.rating": "Please rate the game.",
    "form.thanks.title": "Thanks for your feedback!",
    "form.thanks.body": "Your input helps improve Safi Runner.",

    "ad.sponsored": "📢 SPONSORED MESSAGE",
    "ad.playing": "Ad playing…",
    "ad.timeLeft": "{s}s left",
    "ad.done": "Done!",
    "ad.continue": "Continue →",
    "ad.wait": "Wait {s}s…",
    "ad.thanks": "Thanks for watching!",

    "spq.sponsoredBy": "🤝 Quiz sponsored by {brand}",
    "spq.didYouKnow": "💡 Did you know? {fact}",

    "soc.thanks.title": "Thanks for following us!",
    "soc.thanks.body": "Your support helps the Safi medina shine online 🌟",
  },

  /* ─────────────────── العربية ─────────────────── */
  ar: {
    "lang.label": "اللغة",

    "bridge.programTitle": "🦈 Bridge Shark — وجبة مجانية",
    "bridge.diamonds": "💎 الألماس",
    "bridge.activeDays": "📅 أيام متتالية (3-4 ساعات)",
    "bridge.todayLabel": "⏱️ اليوم : {time}",
    "bridge.dayBadge": "اليوم {n}",
    "bridge.menusReady": "🎉 {n} وجبة مجانية جاهزة!",
    "bridge.menusReadyPlural": "🎉 {n} وجبات مجانية جاهزة!",
    "bridge.claimHint": "اطلب وجبتك على Bridge Eats برقم هاتفك",
    "bridge.timeRemaining.minutes": "{m} دقيقة متبقية",
    "bridge.timeRemaining.hours": "{h}س{rest} متبقية",
    "bridge.timeRemaining.done": "✓ تم اعتماد اليوم",
    "bridge.session": "5 أيام · 3-4 ساعات/يوم",
    "bridge.objective": "الهدف",
    "bridge.myDiamonds": "ألماسي",
    "bridge.progress": "التقدم",
    "bridge.playNow": "🎮 العب الآن",
    "bridge.howTitle": "🏆 كيف تربح؟",
    "bridge.how.duration": "⏱️ العب من 3 إلى 4 ساعات يومياً لمدة 5 أيام متتالية (15 ساعة على الأقل)",
    "bridge.how.rate": "💎 اجمع 1000 💎 في الساعة — الهدف 15000 💎",
    "bridge.how.shortfall": "💰 ينقصك ألماس؟ 1000 💎 = 5 درهم",
    "bridge.how.bonus": "🎁 مكافأة: العب ساعتين إضافيتين → +2000 💎 + توصيل مجاني 100%",
    "bridge.how.social": "📱 عند كل توقف: تابع 4 صفحات Bridge Eats (FB · YT · إنستا · تيك توك) لمواصلة اللعب",
    "bridge.how.obstacles": "🍲 تجنب العقبات المغربية: طاجين · كسكس · شواء السردين",
    "bridge.how.claim": "🛵🚕 في اليوم السادس: اطلب وجبتك من Bridge Eats",

    "blocker.diamonds": "اجمع {n} 💎 إضافية",
    "blocker.days": "تبقى {n} يوم متتالي (3-4 ساعات) لاعتماده",
    "blocker.daysPlural": "تبقى {n} أيام متتالية (3-4 ساعات) لاعتمادها",
    "blocker.wait": "ارجع بعد {n} يوم للمطالبة",
    "blocker.waitPlural": "ارجع بعد {n} أيام للمطالبة",

    "start.title": "🦈 سافي رنر",
    "start.subtitle": "المدينة العتيقة بآسفي · سباق ثلاثي الأبعاد لا نهائي",
    "start.play": "▶ العب",
    "start.controls.lanes": "◀ ▶ المسارات",
    "start.controls.jump": "↑ / مسافة للقفز",
    "start.controls.touch": "أزرار اللمس ✓",
    "start.badge.diamonds": "اجمع الألماس",
    "start.badge.days": "{n} أيام متتالية",
    "start.badge.menu": "وجبة مجانية في اليوم السادس",

    "hud.coins": "العملات",
    "hud.diamonds": "ألماس",
    "hud.score": "النتيجة",
    "hud.nextStop": "🍽️ المحطة التالية · {s}ث",
    "ui.darkOn": "تم تفعيل الوضع الداكن",
    "ui.darkOff": "تم إيقاف الوضع الداكن",
    "ui.dark": "داكن",
    "ui.light": "فاتح",
    "ui.music": "موسيقى",
    "ui.musicOn": "تم تفعيل الموسيقى الشرقية",
    "ui.musicOff": "تم كتم الموسيقى",
    "auth.locked.kicker": "يلزم تسجيل الدخول عبر Bridge Eats",
    "auth.locked.title": "🦈 SAFI RUNNER",
    "auth.locked.body": "للعب، سجّل دخولك أولاً على Bridge Eats ببريدك ورقم هاتفك. سيتم التعرف عليك تلقائياً وستتم مزامنة ألماساتك بين كل أجهزتك.",
    "auth.locked.cta": "تسجيل الدخول على Bridge Eats",
    "auth.locked.why": "🔐 Bridge Eats يتولى تسجيل الدخول. ألماساتك مرتبطة بحسابك — العب من أي جهاز بنفس البريد الإلكتروني.",

    "controls.swipeHint": "← اسحب لتغيير المسار · اسحب لأعلى للقفز →",

    "instr.title": "🦈 كيف تلعب",
    "instr.subtitle": "سافي رنر",
    "instr.row.lanes.label": "تغيير المسار",
    "instr.row.lanes.desc": "أزرار يسار / يمين أو أسهم لوحة المفاتيح",
    "instr.row.jump.label": "القفز",
    "instr.row.jump.desc": "زر القفز، السهم لأعلى أو مسافة",
    "instr.row.diamonds.label": "اجمع الألماس",
    "instr.row.diamonds.desc": "اركض فوق الألماس الأزرق لجمعه",
    "instr.row.obstacles.label": "تجنب العوائق",
    "instr.row.obstacles.desc": "غيّر المسار أو اقفز فوقها",
    "instr.howTitle": "🦈 كيف تربح وجبة Bridge Shark",
    "instr.how.collect": "اجمع {n} 💎 إجمالاً (وتيرة: 1000 💎/ساعة)",
    "instr.how.play": "العب 3 إلى 4 ساعات يومياً لمدة {d} أيام متتالية",
    "instr.how.day4": "في اليوم السادس: أدخل رقمك في Bridge Eats للمطالبة بالوجبة",
    "instr.how.ads": "📱 توقف كل 40 ثانية: تابع 4 صفحات Bridge Eats (FB · YT · إنستا · تيك توك)",
    "instr.how.shortfall": "💸 لا تكفي 💎؟ أكمل: 1000 💎 ناقصة = 5 درهم",
    "instr.how.bonus": "🎁 مكافأة: العب ساعتين إضافيتين → +2000 💎 + توصيل مجاني 100%",
    "instr.row.gamepad.label": "🎮 يد تحكم PS4 / PS5",
    "instr.row.gamepad.desc": "العصا اليسرى أو D-pad لتغيير المسار، ✕ للقفز",
    "instr.responsive": "📱💻📺 هاتف · لوحي · حاسوب · تلفاز — جميع المقاسات",
    "instr.launch": "▶ بدء اللعبة",

    "shortfall.title": "💸 أكمل بدفع صغير",
    "shortfall.body": "ينقصك {miss} 💎 — ادفع {dh} درهم لفتح القفل الآن (1000 💎 = 5 درهم).",
    "shortfall.cta": "💳 ادفع {dh} درهم لإكمال",
    "shortfall.help": "يتم الدفع من صفحة Bridge Eats. تُضاف 💎 المكمّلة إلى رصيدك.",

    "gamepad.connected": "🎮 وحدة التحكم متصلة",

    "claim.unlocked.title": "وجبة مجانية\nمفتوحة!",
    "claim.unlocked.body": "لقد لعبت {days} أيام وجمعت {diamonds} 💎",
    "claim.unlocked.daySingular": "لقد لعبت {days} يوم وجمعت {diamonds} 💎",
    "claim.notReady.title": "لم يحن الوقت بعد",
    "claim.phone.label": "📱 رقم هاتفك في Bridge Eats",
    "claim.phone.help": "هذا الرقم يحدّد حسابك في Bridge — هو الذي سيستلم وجبتك المجانية. وجبة واحدة لكل رقم.",
    "claim.phone.placeholder": "+212 6XX XXXXXX  أو  06XX XXXXXX",
    "claim.phone.empty": "أدخل رقمك في Bridge Eats.",
    "claim.phone.invalid": "رقم غير صحيح. الصيغة: +212XXXXXXXXX أو 0XXXXXXXXX",
    "claim.phone.taken": "هذا الرقم مستخدم بالفعل في حساب Bridge آخر.",
    "claim.error.generic": "خطأ — أعد المحاولة.",
    "claim.error.notMet": "شروط المطالبة غير مستوفاة (تم التحقق على الخادم).",
    "claim.button.claim": "🛵🚕 اطلب وجبتي",
    "claim.button.checking": "جارٍ التحقق…",
    "claim.button.continue": "تابع اللعب",
    "claim.button.continuePlay": "▶ تابع اللعب",
    "claim.done.title": "✅ تم تسجيل الرقم!",
    "claim.done.body": "ستُربط وجبتك بحسابك في Bridge Eats. اضغط أدناه للطلب.",
    "claim.done.cta": "🛵🚕 الذهاب إلى Bridge Eats",

    "over.title": "انتهت اللعبة",
    "over.subtitle": "لقد توقّف القرش المحارب!",
    "over.stat.session": "الجلسة",
    "over.stat.score": "النتيجة",
    "over.stat.stops": "المحطات",
    "over.stat.sardines": "السردين",
    "over.restart": "🔄 إعادة",

    "db.connected": "● متصل",
    "db.connecting": "● جارٍ الاتصال…",
    "db.offline": "● غير متصل",
    "db.error": "● خطأ",
    "db.loading": "جارٍ تحميل الملف…",
    "db.unavailable": "الملف غير متاح.",
    "db.user": "👤",
    "db.totalDiamonds": "💎 المجموع :",
    "db.sardines": "🐟 السردين :",

    "cp.resume": "متابعة السباق 🏃",
    "cp.next": "السؤال التالي →",
    "cp.seeResult": "عرض النتيجة",
    "cp.header.stop": "محطة #{n} — {venue}",
    "cp.currentScore": "النتيجة الحالية : {n} 💎",
    "cp.completePrompt": "أكمل النشاط لمتابعة سباقك في مدينة آسفي القديمة!",
    "cp.startActivity": "ابدأ النشاط →",
    "cp.completed": "اكتمل النشاط!",
    "cp.completedBody": "القرش يستأنف سباقه في المدينة…",
    "act.title.quiz": "🕌 اختبار الثقافة المغربية",
    "act.title.form": "📝 استبيان الرضا",
    "act.title.video": "📺 فاصل إعلاني",
    "act.title.sponsorQuiz": "🤝 اختبار الراعي",
    "act.title.social": "💖 تابعنا على الشبكات!",
    "act.title.reel": "🎬 ريل الراعي",
    "act.sub.quiz": "اختبر معرفتك بآسفي والمغرب!",
    "act.sub.form": "شاركنا رأيك في سافي رنر",
    "act.sub.video": "اكتشف شركاءنا المحليين",
    "act.sub.sponsorQuiz": "أجب واكتشف معلومة عن آسفي!",
    "act.sub.social": "٤ نقرات سريعة: إنستا، فيسبوك، تيك توك، يوتيوب",
    "act.sub.reel": "اكتشف شريكاً من سافي رنر في ٨ ثوانٍ",
    "soc.followCta": "تابع {handle}",
    "soc.tapAll": "تابع الشبكات الـ٤ للمتابعة ({n}/٤)",
    "soc.followBtn": "متابعة",
    "soc.followedBtn": "تمت المتابعة",
    "soc.closeHint": "اللعبة تبقى نشطة خلف الإعلان",
    "soc.confirmFollowed": "لقد تابعت هذه الصفحة",
    "soc.openInPopup": "افتح في نافذة صغيرة",
    "soc.embed.fbHint": "اضغط على \"إعجاب\" داخل إطار فيسبوك أعلاه، ثم أكّد.",
    "soc.embed.ytHint": "اضغط على اشتراك، ثم أكّد.",
    "soc.embed.popupHint": "هذه المنصة تحجب أزرار المتابعة الخارجية. اضغط لفتح نافذة صغيرة فوق اللعبة، تابع الصفحة، ثم أكّد.",
    "reel.wait": "انتظر… {s}ث",
    "reel.share": "مشاركة",
    "bubble.cta": "📢 تابع {handle} — {n}/4 شبكات",
    "bubble.done": "✅ تم متابعة الحساب على 4 شبكات!",
    "bubble.followToContinue": "تابع الشبكات الـ4 للمتابعة ↓",

    "quiz.questionOf": "السؤال {n} / {total}",
    "quiz.score": "{n}/{total} إجابات صحيحة!",
    "quiz.feedback.perfect": "ممتاز! تعرف مدينة آسفي القديمة جيدًا!",
    "quiz.feedback.good": "أحسنت! واصل اكتشاف الثقافة المغربية.",
    "quiz.feedback.try": "واصل التعلم! آسفي مدينة رائعة.",

    "form.intro": "خلال استراحتك في المطعم، شاركنا تجربتك!",
    "form.field.name": "اسمك الأول",
    "form.field.namePh": "مثال: أحمد",
    "form.field.city": "مدينتك",
    "form.field.cityPh": "مثال: آسفي",
    "form.field.email": "البريد الإلكتروني (اختياري)",
    "form.field.emailPh": "your@email.com",
    "form.field.opinion": "ما رأيك في لعبة سافي رنر؟",
    "form.field.opinionPh": "رأيك...",
    "form.rating": "التقييم العام للعبة",
    "form.submit": "إرسال رأيي ✓",
    "form.error.name": "يرجى إدخال اسمك الأول.",
    "form.error.city": "يرجى إدخال مدينتك.",
    "form.error.rating": "يرجى تقييم اللعبة.",
    "form.thanks.title": "شكرًا على رأيك!",
    "form.thanks.body": "ملاحظاتك تساعد على تحسين سافي رنر.",

    "ad.sponsored": "📢 رسالة برعاية",
    "ad.playing": "إعلان قيد التشغيل…",
    "ad.timeLeft": "{s}ث متبقية",
    "ad.done": "انتهى!",
    "ad.continue": "متابعة →",
    "ad.wait": "انتظر {s}ث…",
    "ad.thanks": "شكرًا على المشاهدة!",

    "spq.sponsoredBy": "🤝 اختبار برعاية {brand}",
    "spq.didYouKnow": "💡 هل تعلم؟ {fact}",

    "soc.thanks.title": "شكرًا على متابعتنا!",
    "soc.thanks.body": "دعمك يساعد مدينة آسفي القديمة على التألق على الإنترنت 🌟",
  },
};

/* ─── Locale-aware number formatting ─────────────────────────── */
const NUM_LOCALE: Record<Lang, string> = { fr: "fr-FR", en: "en-US", ar: "ar-MA" };
export function formatNum(n: number, lang: Lang = currentLang): string {
  try { return n.toLocaleString(NUM_LOCALE[lang]); } catch { return String(n); }
}

/* ─── State + reactivity ─────────────────────────────────────── */
function detectInitial(): Lang {
  // Default to French (project requirement). Only honour an explicit user
  // choice persisted in localStorage; never auto-detect from navigator.language.
  if (typeof localStorage !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved === "fr" || saved === "en" || saved === "ar") return saved;
  }
  return "fr";
}

let currentLang: Lang = detectInitial();
const listeners = new Set<() => void>();

function applyHtmlAttrs(l: Lang) {
  if (typeof document === "undefined") return;
  const meta = LANGS.find((x) => x.code === l) ?? LANGS[0];
  document.documentElement.lang = l;
  document.documentElement.dir = meta.dir;
}

if (typeof document !== "undefined") applyHtmlAttrs(currentLang);

export function getLang(): Lang {
  return currentLang;
}

export function setLang(l: Lang): void {
  if (l === currentLang) return;
  currentLang = l;
  if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, l);
  applyHtmlAttrs(l);
  listeners.forEach((fn) => fn());
}

/* ─── Translation function ───────────────────────────────────── */
export function t(key: string, params?: Record<string, string | number>): string {
  const dict = DICT[currentLang] ?? DICT.fr;
  let s = dict[key] ?? DICT.fr[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return s;
}

/* ─── React hook (re-renders on language change) ─────────────── */
export function useT() {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((x) => x + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return { t, lang: currentLang, setLang };
}
