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

### UI / Controls
- Start screen with Shark Warrior reference photo background
- In-game HUD: diamond counter, checkpoint progress bar, score
- On-screen touch buttons (◀ ▲ ▶) for mobile play
- Game Over screen with animated stats cards
- Keyboard: ← → (lane change), Space / ↑ (jump)

### Supabase integration
- URL: `https://ngfmuysddnixtbbguakr.supabase.co`
- Key stored in `artifacts/3d-game/.env` as `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- Uses `signInAnonymously()` — requires Anonymous Auth enabled in Supabase dashboard
- `profiles` table: `id UUID PK (FK auth.users)`, `username`, `sardines_points`, `diamonds_collected`
- Auto-save on game over; sync every 10s during play
- Test button (+1000 💎) visible on start/gameover screens

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
