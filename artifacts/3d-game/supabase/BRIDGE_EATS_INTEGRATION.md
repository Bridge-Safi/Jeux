# Synchronisation des 💎 — Bridge Eats & apps partenaires

Comment Bridge Eats, taxis, pharmacie, cigarettes, etc. lisent le solde de
diamants d'un joueur Safi Runner **en temps réel**.

---

## Principe

- Source de vérité : table `profiles` dans Supabase (le jeu y écrit après chaque session).
- Identifiant joueur cross-app : **numéro de téléphone Bridge** (`bridge_phone`).
- Lecture publique sécurisée : RPC Supabase `get_player_diamonds(p_phone)`.
- Pas de service key partagée — Bridge Eats utilise la **même clé anon** que le jeu.
- Sécurité anti-énumération : il faut connaître le numéro exact du joueur.

---

## 1) Setup une seule fois (côté admin)

Dans Supabase > SQL Editor, exécuter dans cet ordre :

1. `bridge_engagement.sql` (déjà fait)
2. `partner_api.sql` (nouveau — crée la fonction RPC)

---

## 2) Appel HTTP direct (n'importe quel langage)

```http
POST https://<PROJET>.supabase.co/rest/v1/rpc/get_player_diamonds
apikey:        <SUPABASE_ANON_KEY>
Authorization: Bearer <SUPABASE_ANON_KEY>
Content-Type:  application/json

{ "p_phone": "+212600000000" }
```

Réponse :

```json
{
  "ok": true,
  "phone": "+212600000000",
  "diamonds": 15000,
  "qualifying_days": 2,
  "menus_earned": 0,
  "menus_claimed": 0,
  "menus_available": 0,
  "updated_at": "2026-05-02T12:34:56Z"
}
```

Si numéro inconnu : `{ "ok": false, "error": "not_found" }`.

---

## 3) Appel JS (Bridge Eats web/mobile)

```ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,        // même valeur que dans Safi Runner
  import.meta.env.VITE_SUPABASE_ANON_KEY,   // idem
);

export async function getDiamonds(phone: string) {
  const { data, error } = await supabase.rpc("get_player_diamonds", { p_phone: phone });
  if (error) throw error;
  return data;       // { ok, diamonds, qualifying_days, menus_available, ... }
}
```

---

## 4) Via l'API server Replit (proxy + rate-limiting optionnel)

Pour les apps qui ne veulent pas embarquer Supabase (taxis legacy, etc.),
l'API server expose les mêmes données :

```http
GET  /api/diamonds?phone=+212600000000
GET  /api/diamonds/batch?phones=+212600000001,+212600000002

Header optionnel (si PARTNER_API_KEY défini) :
  x-api-key: <PARTNER_API_KEY>
```

---

## 5) Affichage côté Bridge Eats

```tsx
function DiamondBadge({ phone }: { phone: string }) {
  const [diamonds, setDiamonds] = useState<number | null>(null);

  useEffect(() => {
    let cancel = false;
    const refresh = async () => {
      const d = await getDiamonds(phone);
      if (!cancel && d.ok) setDiamonds(d.diamonds);
    };
    refresh();
    const id = setInterval(refresh, 30_000);   // poll toutes les 30s
    return () => { cancel = true; clearInterval(id); };
  }, [phone]);

  return <span>💎 {diamonds ?? "—"}</span>;
}
```

Pour du temps réel (sans polling), utiliser Supabase Realtime sur la table
`profiles` filtrée par `bridge_phone` — même logique, push au lieu de pull.

---

## Champs retournés

| Champ              | Description                                                        |
| ------------------ | ------------------------------------------------------------------ |
| `diamonds`         | Total cumulé tous-temps (jamais décrémenté).                       |
| `qualifying_days`  | Nombre de jours avec ≥ 3h de jeu.                                  |
| `menus_earned`     | `floor(diamonds / 30000)` — menus théoriquement gagnés.            |
| `menus_claimed`    | Menus déjà réclamés (incrémenté côté serveur, anti-double-claim).  |
| `menus_available`  | `menus_earned − menus_claimed` — réclamables maintenant.           |
| `updated_at`       | Dernière mise à jour du profil joueur.                             |
