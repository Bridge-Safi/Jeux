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

/* ── Paramètres de difficulté progressive ──────────────────────
   Le jeu démarre TRÈS facile (échauffement 15s) puis monte
   progressivement. Pour atteindre 1000 il faudra ~80s à fond.
   ─────────────────────────────────────────────────────────────── */
const CHECKPOINT_INTERVAL = 60;   // pub toutes les 60s

/* Vitesse — progression douce */
const SPEED_START = 8;            // démarrage zen
const SPEED_MAX   = 30;           // intense après ~90s
const SPEED_RAMP_TIME = 90;       // 90s pour atteindre le max

/* Spawn obstacles — quasi vide au début, dense à la fin */
const OBSTACLE_RATE_MIN = 0.6;    // 0-15s : 1 obstacle / 1.7s (très facile)
const OBSTACLE_RATE_MAX = 3.2;    // 90s+ : 1 obstacle toutes ~0.3s (intense)

/* Double obstacle (bloque 2 voies) — apparaît seulement après 30s */
const DOUBLE_OBS_START_TIME = 30; // pas de double avant 30s
const DOUBLE_OBS_MAX_CHANCE = 0.45;

/* Triple obstacle (force le saut) — apparaît seulement après 60s */
const TRIPLE_OBS_START_TIME = 60;
const TRIPLE_OBS_MAX_CHANCE = 0.15;

/* Pièces d'or — généreuses au début pour la satisfaction */
const DIAMOND_RATE_MIN = 1.4;     // au début beaucoup de pièces
const DIAMOND_RATE_MAX = 0.7;     // à la fin moins de pièces (plus risquées)
const CLUSTER_CHANCE   = 0.35;    // 35% de chance de cluster

/* Helper : interpolation linéaire bornée */
const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.max(0, Math.min(1, t));

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

    /* Démarrage doux : peu d'obstacles, beaucoup de pièces visibles */
    const preObstacles: Obstacle[] = [];
    const preDiamonds: Diamond[] = [];

    // Seulement 2 obstacles loin pour ne pas effrayer le débutant
    [-95, -150].forEach((z) => {
      const lane = Math.floor(Math.random() * 3) - 1;
      preObstacles.push({ id: idRef.current++, lane, z });
    });

    // Beaucoup de pièces tentantes au démarrage
    [-12, -22, -32, -42, -55, -68, -82, -100, -120, -140, -165].forEach((z) => {
      const lane = Math.floor(Math.random() * 3) - 1;
      preDiamonds.push({ id: idRef.current++, lane, z });
      // Clusters généreux au début
      if (Math.random() < 0.5) {
        preDiamonds.push({ id: idRef.current++, lane, z: z - 5 });
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

      /* ── Progression de difficulté basée sur le temps de jeu ─ */
      const t = playTime / SPEED_RAMP_TIME;             // 0 → 1 sur 90s
      speed = lerp(SPEED_START, SPEED_MAX, t);

      // Easing : facile au début, plus intense après 30s (courbe quadratique)
      const dt15 = Math.max(0, (playTime - 15) / 75);   // démarre à 15s
      const obstacleRate = lerp(OBSTACLE_RATE_MIN, OBSTACLE_RATE_MAX, dt15 * dt15);

      // Pièces : décroissent légèrement (forcent le risque pour les coins)
      const diamondRate = lerp(DIAMOND_RATE_MIN, DIAMOND_RATE_MAX, t);

      // Double / triple obstacles : déblocages temporels
      const doubleChance = playTime < DOUBLE_OBS_START_TIME
        ? 0
        : lerp(0, DOUBLE_OBS_MAX_CHANCE, (playTime - DOUBLE_OBS_START_TIME) / 60);
      const tripleChance = playTime < TRIPLE_OBS_START_TIME
        ? 0
        : lerp(0, TRIPLE_OBS_MAX_CHANCE, (playTime - TRIPLE_OBS_START_TIME) / 60);

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

      /* ── Spawn obstacles (rate progressif) ─────────────────── */
      if (Math.random() < dt * obstacleRate) {
        const lane = Math.floor(Math.random() * 3) - 1;
        obstacles.push({ id: idRef.current++, lane, z: SPAWN_Z });

        // Double obstacle (après 30s) — bloque 2 voies
        if (Math.random() < doubleChance) {
          let lane2: number;
          do { lane2 = Math.floor(Math.random() * 3) - 1; } while (lane2 === lane);
          obstacles.push({ id: idRef.current++, lane: lane2, z: SPAWN_Z - 4 });

          // Triple (après 60s) — bloque les 3 voies → FORCE le saut
          if (Math.random() < tripleChance) {
            const lane3 = [-1, 0, 1].find((l) => l !== lane && l !== lane2)!;
            obstacles.push({ id: idRef.current++, lane: lane3, z: SPAWN_Z - 8 });
          }
        }
      }

      /* ── Spawn pièces (généreuses au début, plus risquées après) ── */
      if (Math.random() < dt * diamondRate) {
        const lane = Math.floor(Math.random() * 3) - 1;
        diamonds.push({ id: idRef.current++, lane, z: SPAWN_Z });

        if (Math.random() < CLUSTER_CHANCE) {
          diamonds.push({ id: idRef.current++, lane, z: SPAWN_Z - 5 });
          if (Math.random() < 0.15) {
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
