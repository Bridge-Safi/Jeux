# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Safi Runner — 3D Infinite Runner Game

**Artifact**: `artifacts/3d-game` (preview path `/`, port 24982)
**Stack**: React + Vite + React Three Fiber + Three.js + @supabase/supabase-js

### Game features
- 3-lane infinite runner through the medina of Safi, Morocco (night atmosphere)
- Player: Shark Warrior with zellige armor (Bridge brand)
- Collect diamonds, avoid wooden crate obstacles
- Checkpoint every 50s → interactive overlay (quiz, form, video ad, sponsor quiz)
- Score = diamonds × 10; sardines = score ÷ 50

### Bridge Eats engagement program (free menu unlock)
Three cumulative criteria — all enforced server-side:
1. **30,000 💎** total collected (DIAMONDS_PER_MENU)
2. **3 distinct days** with **≥1h** play each (REQUIRED_PLAY_DAYS, REQUIRED_SECONDS_PER_DAY)
3. **4th calendar day** from the player's personal first play date (DAYS_BEFORE_CLAIM)

The Bridge customer link is the **phone number** (not email): `bridge_phone` column with UNIQUE constraint. One phone = one Bridge account = one menu per cycle.

### Database (Supabase)
Two SQL migrations to apply manually in Supabase SQL Editor (in order):
- `artifacts/3d-game/supabase/anti_cheat.sql` — RLS, device fingerprint, anti-cheat trigger (1.8 💎/s cap)
- `artifacts/3d-game/supabase/bridge_engagement.sql` — bridge_phone, first_play_date, play_days (jsonb), menus_claimed, plus 2 atomic RPCs:
  - `add_play_session(p_id, p_seconds)` — appends today's play time using server `CURRENT_DATE` (immune to client clock manipulation)
  - `claim_menu(p_id)` — server-validates the 3 criteria + atomic increment of menus_claimed (anti double-claim)

### Key files
- `src/lib/playerProfile.ts` — registerBridgePhone, recordPlaySession (RPC), markMenuClaimed (RPC), getMenuEligibility (pure)
- `src/game/GameUI.tsx` — EngagementCard (3 progress bars), MenuUnlockOverlay (phone input + eligibility gate), reward overlay only triggers at gameover/checkpoint (never interrupts gameplay)
- `src/hooks/useSupabaseSync.ts` — calls recordPlaySession on phase=gameover

### UI / Controls
- Start screen with Shark Warrior reference photo background
- In-game HUD: diamond counter, checkpoint progress bar, score
- On-screen touch buttons (◀ ▲ ▶) for mobile play
- Game Over screen with animated stats cards
- Keyboard: ← → (lane change), Space / ↑ (jump)

### Pay-to-complete diamond shortfall (1 DH = 1 000 💎)
- `playerProfile.ts` exports `DIAMONDS_PER_DIRHAM = 1000` and `shortfallDh(missing): number` (ceil).
- `MenuUnlockOverlay` (GameUI.tsx) shows a green "Compléter pour Y DH" CTA when `blocker.key === "blocker.diamonds"` (i.e. the only thing missing is 💎). The button opens Bridge Eats with query params `?action=topup_diamonds&missing=X&dh=Y&rate=1dh_per_1000` so Bridge can route directly to the payment page and credit the 💎 balance back.
- `InstructionsScreen` lists the rule as a bullet (`instr.how.shortfall`) so players see it on first launch.
- New i18n keys in 3 langs: `shortfall.title / body / cta / help`, `instr.how.shortfall`.

### Gamepad support (PS4 / PS5 via Web Gamepad API)
- `src/hooks/useGamepad.ts` — `useGamepad({ enabled, onLeft, onRight, onJump })` polls `navigator.getGamepads()` in rAF, edge-triggered. Maps left stick X (deadzone 0.5) + D-pad L/R + L1/R1 → lane change ; ✕ / □ / △ / D-pad up → jump. Returns `connected: boolean`.
- Wired into `Game.tsx` alongside keyboard/touch (no conflict — additive). Small green badge `🎮 Manette connectée` shown bottom-right when a controller is detected.
- New i18n keys: `gamepad.connected`, `instr.row.gamepad.label/desc`.

### Responsive (smartphone / tablet / PC / TV)
- Root container: `width:100vw; height:100vh; minHeight:100dvh` (handles mobile browser chrome).
- Touch controls (`<TouchControls>`) wrapped in `.touch-only` and hidden via `@media (hover:hover) and (pointer:fine)` — keep buttons on phones/tablets, hide them on PC/TV/mouse where keyboard or gamepad is used instead.
- Existing `clamp()` typography on title and `max-width:420/500` on overlays already scale gracefully up to 4K/TV widths.
- New i18n key: `instr.responsive` (badge in instructions screen listing supported devices).

### Multi-language (FR / EN / AR with RTL)
- `src/lib/i18n.ts` — trilingual dictionaries, `t(key, params)`, `useT()` React hook (re-renders on lang change), `setLang()`, `getLang()`, `formatNum()` locale-aware (`fr-FR` / `en-US` / `ar-MA`).
- Default language: **FR** (no auto-detection from `navigator.language`). User choice persists in `localStorage["safi_runner_lang"]`.
- RTL: `setLang("ar")` flips `<html dir="rtl">`. Noto Sans Arabic font loaded in `index.html`. Layout uses logical properties (`textAlign: "start"`, `marginInlineEnd`) for RTL safety.
- `src/components/LanguageSelector.tsx` — floating top-right dropdown with FR/EN/AR flags, mounted from `Game.tsx`.
- Translated UI: `GameUI.tsx` (HUD, start, game-over, instructions, MenuUnlockOverlay, EngagementCard), `SupabasePanel.tsx`, `CheckpointUI.tsx` (all chrome — quiz/form/video/sponsorQuiz/social/reel activities). Cultural content arrays (quiz questions, sponsor blurbs, restaurant reels, venue names) intentionally kept in French as Moroccan cultural content.
- `playerProfile.ts` returns i18n keys for errors (`claim.phone.invalid`, `claim.phone.taken`, `claim.error.notMet`, `claim.error.generic`); `MenuEligibility.blocker` is `{ key, n? } | null`.

### Supabase integration
- URL: `https://ngfmuysddnixtbbguakr.supabase.co`
- Key stored in `artifacts/3d-game/.env` as `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- Uses `signInAnonymously()` — requires Anonymous Auth enabled in Supabase dashboard
- `profiles` table: `id UUID PK (FK auth.users)`, `username`, `sardines_points`, `diamonds_collected`
- Auto-save on game over; sync every 10s during play
- Test button (+1000 💎) visible on start/gameover screens

### Bridge Eats integration
- **Bridge Eats URL**: `https://44474adc-9074-4015-a3b9-4e111cb8be39-00-11nld147gir6y.kirk.replit.dev/`
- "🍔 Bridge Eats" back button shown on start screen (top-left) and game over screen
- **Reward system**: 500 💎 collectés (cumulatif Supabase) = 1 menu gratuit
- Barre de progression visible sur l'écran de démarrage, game over, et pendant le jeu
- Overlay de célébration animé quand le seuil est atteint → lien vers Bridge Eats
- Config centralisée dans `GameUI.tsx` : `BRIDGE_EATS_URL` et `DIAMONDS_PER_MENU`

### Key files
- `src/game/Game.tsx` — main Canvas, lighting (night), GameUI wiring
- `src/game/GameUI.tsx` — start screen, HUD, touch controls, game over
- `src/game/components/Scene.tsx` — stars, moon, distant city skyline
- `src/game/components/Track.tsx` — road segments, buildings, lampposts, trees
- `src/game/components/SharkPlayer.tsx` — animated player character
- `src/game/components/Diamonds.tsx` — glowing collectibles with point lights
- `src/game/components/Obstacles.tsx` — wooden crates with warning lights
- `src/game/CheckpointUI.tsx` — 4 activity types at checkpoints
- `src/lib/supabase.ts` — Supabase client (graceful offline fallback)
- `src/lib/playerProfile.ts` — anonymous auth + profile CRUD
- `src/hooks/useSupabaseSync.ts` — auto-sync hook
- `src/game/SupabasePanel.tsx` — status indicator + test button
