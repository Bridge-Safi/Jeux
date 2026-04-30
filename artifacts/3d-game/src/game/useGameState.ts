import { useRef, useState, useCallback } from "react";

export type GamePhase = "start" | "playing" | "gameover";

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
}

export function useGameState() {
  const idRef = useRef(0);

  const initialState = (): GameState => ({
    phase: "start",
    lane: 0,
    score: 0,
    isJumping: false,
    jumpVelocity: 0,
    playerY: 0,
    obstacles: [],
    diamonds: [],
    speed: 8,
    distance: 0,
  });

  const [state, setState] = useState<GameState>(initialState);

  const startGame = useCallback(() => {
    idRef.current = 0;
    setState({ ...initialState(), phase: "playing" });
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
      return { ...s, isJumping: true, jumpVelocity: 12 };
    });
  }, []);

  const tick = useCallback((dt: number) => {
    setState((s) => {
      if (s.phase !== "playing") return s;

      const GRAVITY = 28;
      const LANE_X = [-2, 0, 2];
      const SPAWN_Z = -60;
      const DESPAWN_Z = 8;
      const PLAYER_Z = 0;

      let { score, isJumping, jumpVelocity, playerY, obstacles, diamonds, speed, distance, phase } = s;

      distance += dt * speed;
      speed = Math.min(20, 8 + distance / 200);

      if (isJumping) {
        jumpVelocity -= GRAVITY * dt;
        playerY += jumpVelocity * dt;
        if (playerY <= 0) {
          playerY = 0;
          isJumping = false;
          jumpVelocity = 0;
        }
      }

      obstacles = obstacles
        .map((o) => ({ ...o, z: o.z + speed * dt }))
        .filter((o) => o.z < DESPAWN_Z);

      diamonds = diamonds
        .map((d) => ({ ...d, z: d.z + speed * dt }))
        .filter((d) => d.z < DESPAWN_Z);

      if (Math.random() < dt * 1.2) {
        const lane = Math.floor(Math.random() * 3) - 1;
        obstacles.push({ id: idRef.current++, lane, z: SPAWN_Z });
      }
      if (Math.random() < dt * 2.0) {
        const lane = Math.floor(Math.random() * 3) - 1;
        diamonds.push({ id: idRef.current++, lane, z: SPAWN_Z });
      }

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
      };
    });
  }, []);

  return { state, startGame, changeLane, jump, tick };
}
