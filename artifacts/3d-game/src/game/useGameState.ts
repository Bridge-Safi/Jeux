import { useRef, useState, useCallback } from "react";

export type GamePhase = "start" | "playing" | "checkpoint" | "gameover";

export interface Obstacle {
  id: number;
  lane: number;
  z: number;
}

export interface Diamond {
  id: number;
  lane: number;
  z: number;
}

export interface GameState {
  phase: GamePhase;
  lane: number;
  score: number;
  isJumping: boolean;
  jumpVelocity: number;
  playerY: number;
  obstacles: Obstacle[];
  diamonds: Diamond[];
  speed: number;
  distance: number;
  playTime: number;
  checkpointNumber: number;
  nextCheckpointAt: number;
}

/* ── Paramètres de difficulté ───────────────────────────────── */
const CHECKPOINT_INTERVAL = 40;   // pub toutes les 40s (max de revenus)
const SPEED_START       = 10;     // vitesse initiale plus rapide
const SPEED_MAX         = 28;     // max speed pour sensation intense
const SPEED_RAMP        = 120;    // rampe plus agressive (200 → 120)
const OBSTACLE_RATE     = 2.4;    // obstacles plus fréquents (1.2 → 2.4)
const DIAMOND_RATE      = 0.75;   // diamants rares (2.0 → 0.75) = 1 toutes ~1.3s
const CLUSTER_CHANCE    = 0.25;   // 25% de chance de cluster (2 diamants d'affilée)
const DOUBLE_OBS_CHANCE = 0.30;   // 30% de chance d'obstacle sur 2 voies simultanément

export function useGameState() {
  const idRef = useRef(0);
  const lastDiamondLane = useRef<number | null>(null);
  const clusterCount = useRef(0);

  const initialState = (): GameState => ({
    phase: "start",
    lane: 0,
    score: 0,
    isJumping: false,
    jumpVelocity: 0,
    playerY: 0,
    obstacles: [],
    diamonds: [],
    speed: SPEED_START,
    distance: 0,
    playTime: 0,
    checkpointNumber: 0,
    nextCheckpointAt: CHECKPOINT_INTERVAL,
  });

  const [state, setState] = useState<GameState>(initialState);

  const startGame = useCallback(() => {
    idRef.current = 0;
    lastDiamondLane.current = null;
    clusterCount.current = 0;

    /* Pré-charger diamants et obstacles so the game feels full immediately */
    const preObstacles: Obstacle[] = [];
    const preDiamonds: Diamond[] = [];

    // Obstacles à 3 distances différentes (pas trop proches au départ)
    [-55, -85, -120, -155].forEach((z) => {
      const lane = Math.floor(Math.random() * 3) - 1;
      preObstacles.push({ id: idRef.current++, lane, z });
    });

    // Diamants répartis sur toute la profondeur visible
    [-12, -22, -35, -48, -62, -78, -95, -115, -138, -160].forEach((z) => {
      const lane = Math.floor(Math.random() * 3) - 1;
      preDiamonds.push({ id: idRef.current++, lane, z });
      // quelques clusters
      if (Math.random() < 0.35) {
        preDiamonds.push({ id: idRef.current++, lane, z: z - 6 });
      }
    });

    setState({ ...initialState(), phase: "playing", obstacles: preObstacles, diamonds: preDiamonds });
  }, []);

  const resumeGame = useCallback(() => {
    setState((s) => ({
      ...s,
      phase: "playing",
      obstacles: [],
      diamonds: [],
      nextCheckpointAt: s.playTime + CHECKPOINT_INTERVAL,
    }));
  }, []);

  const changeLane = useCallback((dir: 1 | -1) => {
    setState((s) => {
      if (s.phase !== "playing") return s;
      const newLane = Math.max(-1, Math.min(1, s.lane + dir));
      return { ...s, lane: newLane };
    });
  }, []);

  const jump = useCallback(() => {
    setState((s) => {
      if (s.phase !== "playing" || s.isJumping) return s;
      return { ...s, isJumping: true, jumpVelocity: 13 };
    });
  }, []);

  const tick = useCallback((dt: number) => {
    setState((s) => {
      if (s.phase !== "playing") return s;

      const GRAVITY  = 32;          // gravité plus forte = saut plus nerveux
      const LANE_X   = [-2, 0, 2];
      const SPAWN_Z  = -65;
      const DESPAWN_Z = 8;
      const PLAYER_Z  = 0;

      let {
        score, isJumping, jumpVelocity, playerY,
        obstacles, diamonds, speed, distance, phase,
        playTime, checkpointNumber, nextCheckpointAt,
      } = s;

      playTime += dt;
      distance += dt * speed;

      // Vitesse : montée rapide et agressive
      speed = Math.min(SPEED_MAX, SPEED_START + distance / SPEED_RAMP);

      // Checkpoint → pub
      if (playTime >= nextCheckpointAt) {
        return {
          ...s,
          phase: "checkpoint",
          playTime,
          checkpointNumber: checkpointNumber + 1,
          speed: 0,
          isJumping: false,
          jumpVelocity: 0,
          playerY: 0,
        };
      }

      // Physique du saut
      if (isJumping) {
        jumpVelocity -= GRAVITY * dt;
        playerY += jumpVelocity * dt;
        if (playerY <= 0) {
          playerY = 0;
          isJumping = false;
          jumpVelocity = 0;
        }
      }

      // Déplacement obstacles & diamants
      obstacles = obstacles
        .map((o) => ({ ...o, z: o.z + speed * dt }))
        .filter((o) => o.z < DESPAWN_Z);

      diamonds = diamonds
        .map((d) => ({ ...d, z: d.z + speed * dt }))
        .filter((d) => d.z < DESPAWN_Z);

      /* ── Spawn obstacles ────────────────────────────────────── */
      if (Math.random() < dt * OBSTACLE_RATE) {
        const lane = Math.floor(Math.random() * 3) - 1;
        obstacles.push({ id: idRef.current++, lane, z: SPAWN_Z });

        // Double obstacle : bloque 2 voies sur 3 = force le joueur à sauter ou à chercher la bonne voie
        if (Math.random() < DOUBLE_OBS_CHANCE) {
          let lane2: number;
          do { lane2 = Math.floor(Math.random() * 3) - 1; } while (lane2 === lane);
          // décalé légèrement pour garder le jeu jouable
          obstacles.push({ id: idRef.current++, lane: lane2, z: SPAWN_Z - 4 });
        }
      }

      /* ── Spawn diamants (rares, mais avec clusters tentateurs) ── */
      if (Math.random() < dt * DIAMOND_RATE) {
        const lane = Math.floor(Math.random() * 3) - 1;
        diamonds.push({ id: idRef.current++, lane, z: SPAWN_Z });

        // Cluster : 25% de chance d'un 2ème diamant juste derrière (même voie)
        if (Math.random() < CLUSTER_CHANCE) {
          diamonds.push({ id: idRef.current++, lane, z: SPAWN_Z - 5 });
          // 10% de chance d'un 3ème pour le combo (très tentant mais risqué)
          if (Math.random() < 0.10) {
            diamonds.push({ id: idRef.current++, lane, z: SPAWN_Z - 10 });
          }
        }
      }

      /* ── Détection collision obstacles ─────────────────────── */
      const playerX = LANE_X[s.lane + 1];
      const COLL_XR = 0.7;
      const COLL_ZR = 1.4;

      for (const o of obstacles) {
        const ox = LANE_X[o.lane + 1];
        const dx = Math.abs(playerX - ox);
        const dz = Math.abs(PLAYER_Z - o.z);
        if (dx < COLL_XR && dz < COLL_ZR && playerY < 1.5) {
          phase = "gameover";
        }
      }

      /* ── Collecte diamants ──────────────────────────────────── */
      const newDiamonds: Diamond[] = [];
      for (const d of diamonds) {
        const dx2 = Math.abs(playerX - LANE_X[d.lane + 1]);
        const dz2 = Math.abs(PLAYER_Z - d.z);
        if (dx2 < 1.0 && dz2 < 1.2) {
          score += 10;
        } else {
          newDiamonds.push(d);
        }
      }

      return {
        ...s,
        phase,
        score,
        isJumping,
        jumpVelocity,
        playerY,
        obstacles,
        diamonds: newDiamonds,
        speed,
        distance,
        playTime,
        checkpointNumber,
        nextCheckpointAt,
      };
    });
  }, []);

  return { state, startGame, resumeGame, changeLane, jump, tick };
}
