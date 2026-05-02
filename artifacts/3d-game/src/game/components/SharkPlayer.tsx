import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const LANE_X = [-2, 0, 2];

interface SharkPlayerProps {
  lane: number;
  playerY: number;
  isJumping: boolean;
}

/* Box colorée simple — meshBasicMaterial = visible sur TOUT mobile */
function B({ x = 0, y = 0, z = 0, w, h, d, color }: { x?: number; y?: number; z?: number; w: number; h: number; d: number; color: string }) {
  return (
    <mesh position={[x, y, z]}>
      <boxGeometry args={[w, h, d]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function Cyl({ x = 0, y = 0, z = 0, rt, rb, h, color, seg = 8 }: { x?: number; y?: number; z?: number; rt: number; rb: number; h: number; color: string; seg?: number }) {
  return (
    <mesh position={[x, y, z]}>
      <cylinderGeometry args={[rt, rb, h, seg]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function Sph({ x = 0, y = 0, z = 0, r, color, seg = 8 }: { x?: number; y?: number; z?: number; r: number; color: string; seg?: number }) {
  return (
    <mesh position={[x, y, z]}>
      <sphereGeometry args={[r, seg, seg]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

export function SharkPlayer({ lane, playerY, isJumping }: SharkPlayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const legLRef = useRef<THREE.Group>(null);
  const legRRef = useRef<THREE.Group>(null);
  const armLRef = useRef<THREE.Group>(null);
  const armRRef = useRef<THREE.Group>(null);

  const targetX = LANE_X[lane + 1];

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x, targetX, Math.min(1, delta * 12)
    );
    groupRef.current.position.y = playerY;

    const t = Date.now() * 0.006;
    if (!isJumping) {
      if (legLRef.current) legLRef.current.rotation.x = Math.sin(t) * 0.55;
      if (legRRef.current) legRRef.current.rotation.x = Math.sin(t + Math.PI) * 0.55;
      if (armLRef.current) armLRef.current.rotation.x = Math.sin(t + Math.PI) * 0.35;
      if (armRRef.current) armRRef.current.rotation.x = Math.sin(t) * 0.35;
      if (bodyRef.current) {
        bodyRef.current.position.y = Math.sin(t * 2) * 0.03;
      }
    }
  });

  /* Palette vive — lisible sur n'importe quel fond sombre */
  const BLUE   = "#5c6bc0";  // bleu royal armure
  const BLUE2  = "#7986cb";  // bleu clair reflet
  const GOLD   = "#ffd54f";  // or vif
  const GOLD2  = "#ffca28";  // or foncé
  const SHARK  = "#90a4ae";  // gris requin
  const SHARK2 = "#cfd8dc";  // ventre clair
  const RED    = "#ef5350";  // bouche
  const WHITE  = "#ffffff";

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <group ref={bodyRef} position={[0, 0.85, 0]}>

        {/* ── JAMBE GAUCHE ── */}
        <group ref={legLRef} position={[0.28, -0.58, 0]}>
          <B w={0.34} h={0.42} d={0.3} color={BLUE} />
          <B y={0.23} w={0.38} h={0.07} d={0.32} color={GOLD} />
          <B y={-0.44} w={0.28} h={0.32} d={0.26} color={BLUE2} />
          <B y={-0.7} z={0.04} w={0.26} h={0.18} d={0.32} color={GOLD2} />
          <B y={-0.62} w={0.30} h={0.06} d={0.24} color={GOLD} />
        </group>

        {/* ── JAMBE DROITE ── */}
        <group ref={legRRef} position={[-0.28, -0.58, 0]}>
          <B w={0.34} h={0.42} d={0.3} color={BLUE} />
          <B y={0.23} w={0.38} h={0.07} d={0.32} color={GOLD} />
          <B y={-0.44} w={0.28} h={0.32} d={0.26} color={BLUE2} />
          <B y={-0.7} z={0.04} w={0.26} h={0.18} d={0.32} color={GOLD2} />
          <B y={-0.62} w={0.30} h={0.06} d={0.24} color={GOLD} />
        </group>

        {/* ── TORSE ── */}
        <B w={0.82} h={0.78} d={0.54} color={BLUE} />
        {/* Bordures dorées torse */}
        <B y={0.42} w={0.86} h={0.07} d={0.56} color={GOLD} />
        <B y={0.0}  w={0.86} h={0.06} d={0.56} color={GOLD2} />
        <B y={-0.42} w={0.86} h={0.07} d={0.56} color={GOLD} />
        {/* Losanges zellige */}
        {([-0.22, 0, 0.22] as number[]).map((bx, i) => (
          <B key={i} x={bx} y={0.15} z={0.28} w={0.14} h={0.14} d={0.04} color={i === 1 ? RED : GOLD} />
        ))}
        {/* Médaillon central */}
        <Cyl y={0.1} z={0.28} rt={0.15} rb={0.15} h={0.05} color={GOLD} />
        {/* Ceinture */}
        <B y={-0.44} w={0.86} h={0.14} d={0.58} color={GOLD2} />
        {([-0.26, 0, 0.26] as number[]).map((bx, i) => (
          <B key={i} x={bx} y={-0.44} z={0.3} w={0.12} h={0.1} d={0.04} color={GOLD} />
        ))}

        {/* ── BRAS GAUCHE ── */}
        <group ref={armLRef} position={[0.6, 0.1, 0]}>
          <B y={0.22} w={0.38} h={0.3} d={0.38} color={BLUE2} />
          <B y={0.25} w={0.42} h={0.07} d={0.42} color={GOLD} />
          <B w={0.28} h={0.4} d={0.28} color={BLUE} />
          <B y={-0.4} w={0.24} h={0.28} d={0.24} color={BLUE2} />
          <Sph y={-0.6} r={0.14} color={SHARK} />
          <B y={-0.52} w={0.28} h={0.05} d={0.28} color={GOLD} />
        </group>

        {/* ── BRAS DROIT ── */}
        <group ref={armRRef} position={[-0.6, 0.1, 0]}>
          <B y={0.22} w={0.38} h={0.3} d={0.38} color={BLUE2} />
          <B y={0.25} w={0.42} h={0.07} d={0.42} color={GOLD} />
          <B w={0.28} h={0.4} d={0.28} color={BLUE} />
          <B y={-0.4} w={0.24} h={0.28} d={0.24} color={BLUE2} />
          <Sph y={-0.6} r={0.14} color={SHARK} />
          <B y={-0.52} w={0.28} h={0.05} d={0.28} color={GOLD} />
        </group>

        {/* ── COLLIER ── */}
        <B y={0.44} w={0.84} h={0.08} d={0.56} color={GOLD} />

        {/* ── TÊTE REQUIN ── */}
        <group position={[0, 0.86, 0]}>
          {/* Crâne */}
          <Sph r={0.38} color={SHARK} seg={10} />
          {/* Ventre clair */}
          <Sph z={0.22} r={0.26} color={SHARK2} seg={8} />
          {/* Museau */}
          <B y={-0.18} z={0.3} w={0.36} h={0.22} d={0.2} color={SHARK} />
          {/* Bouche */}
          <B y={-0.28} z={0.34} w={0.34} h={0.1} d={0.16} color={RED} />
          {/* Dents haut */}
          {([-0.12, -0.06, 0, 0.06, 0.12] as number[]).map((tx, i) => (
            <mesh key={i} position={[tx, -0.24, 0.41]}>
              <coneGeometry args={[0.025, 0.08, 4]} />
              <meshBasicMaterial color={WHITE} />
            </mesh>
          ))}
          {/* Dents bas */}
          {([-0.1, -0.04, 0.04, 0.1] as number[]).map((tx, i) => (
            <mesh key={i} position={[tx, -0.32, 0.4]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.022, 0.07, 4]} />
              <meshBasicMaterial color={WHITE} />
            </mesh>
          ))}
          {/* Yeux */}
          <Sph x={0.2} y={0.1} z={0.3} r={0.07} color="#1a1a2e" seg={8} />
          <Sph x={-0.2} y={0.1} z={0.3} r={0.07} color="#1a1a2e" seg={8} />
          {/* Reflets blancs yeux */}
          <Sph x={0.22} y={0.13} z={0.35} r={0.023} color={WHITE} seg={6} />
          <Sph x={-0.18} y={0.13} z={0.35} r={0.023} color={WHITE} seg={6} />
          {/* Nageoire dorsale */}
          <mesh position={[0, 0.44, -0.1]} rotation={[0.15, 0, 0]}>
            <coneGeometry args={[0.1, 0.38, 4]} />
            <meshBasicMaterial color={SHARK} />
          </mesh>
          {/* Ouïes */}
          <B x={0.3} z={0.08} w={0.04} h={0.2} d={0.08} color="#546e7a" />
          <B x={-0.3} z={0.08} w={0.04} h={0.2} d={0.08} color="#546e7a" />
          {/* Collier */}
          <mesh position={[0, -0.35, 0]}>
            <torusGeometry args={[0.22, 0.05, 6, 16]} />
            <meshBasicMaterial color={GOLD} />
          </mesh>
        </group>

      </group>

      {/* Ombre sol */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}
