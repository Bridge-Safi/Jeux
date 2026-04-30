import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const LANE_X = [-2, 0, 2];

interface SharkPlayerProps {
  lane: number;
  playerY: number;
  isJumping: boolean;
}

function ZelligePatch({ x, y, z, w, h, d }: { x: number; y: number; z: number; w: number; h: number; d: number }) {
  return (
    <group position={[x, y, z]}>
      {/* Base armor bleu nuit */}
      <mesh>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#1a237e" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Motifs zellige rouge */}
      {[[-w * 0.22, h * 0.15], [w * 0.22, h * 0.15], [0, -h * 0.1], [-w * 0.22, -h * 0.25], [w * 0.22, -h * 0.25]].map(([px, py], i) => (
        <mesh key={i} position={[px as number, py as number, d * 0.51]}>
          <circleGeometry args={[Math.min(w, h) * 0.12, 6]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#b71c1c" : "#e53935"} roughness={0.4} />
        </mesh>
      ))}
      {/* Bordure dorée */}
      <mesh position={[0, 0, d * 0.51]}>
        <ringGeometry args={[Math.min(w, h) * 0.38, Math.min(w, h) * 0.42, 8]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

function GoldTrim({ x, y, z, w, h, d }: { x: number; y: number; z: number; w: number; h: number; d: number }) {
  return (
    <mesh position={[x, y, z]}>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
    </mesh>
  );
}

function Medallion({ x, y, z, side }: { x: number; y: number; z: number; side: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh>
        <cylinderGeometry args={[0.18, 0.18, 0.06, 16]} />
        <meshStandardMaterial color="#c9a227" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
        <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.05} />
      </mesh>
      {/* Emblème simplifié */}
      <mesh position={[0, 0.07, 0]}>
        <torusGeometry args={[0.07, 0.02, 6, 12]} />
        <meshStandardMaterial color="#8B6914" metalness={0.8} />
      </mesh>
    </group>
  );
}

export function SharkPlayer({ lane, playerY, isJumping }: SharkPlayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyGroupRef = useRef<THREE.Group>(null);
  const legLRef = useRef<THREE.Group>(null);
  const legRRef = useRef<THREE.Group>(null);
  const armLRef = useRef<THREE.Group>(null);
  const armRRef = useRef<THREE.Group>(null);

  const targetX = LANE_X[lane + 1];

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetX,
      Math.min(1, delta * 12)
    );
    groupRef.current.position.y = playerY;

    const t = Date.now() * 0.006;

    if (!isJumping) {
      if (legLRef.current) legLRef.current.rotation.x = Math.sin(t) * 0.55;
      if (legRRef.current) legRRef.current.rotation.x = Math.sin(t + Math.PI) * 0.55;
      if (armLRef.current) armLRef.current.rotation.x = Math.sin(t + Math.PI) * 0.35;
      if (armRRef.current) armRRef.current.rotation.x = Math.sin(t) * 0.35;
      if (bodyGroupRef.current) {
        bodyGroupRef.current.position.y = Math.sin(t * 2) * 0.03;
        bodyGroupRef.current.rotation.z = Math.sin(t) * 0.02;
      }
    } else {
      if (bodyGroupRef.current) {
        bodyGroupRef.current.rotation.z = 0;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <group ref={bodyGroupRef} position={[0, 0.85, 0]}>

        {/* ===== JAMBES ===== */}
        {/* Jambe gauche */}
        <group ref={legLRef} position={[0.28, -0.6, 0]}>
          {/* Cuisse armure zellige */}
          <ZelligePatch x={0} y={0} z={0} w={0.34} h={0.4} d={0.3} />
          <GoldTrim x={0} y={0.22} z={0} w={0.36} h={0.06} d={0.32} />
          {/* Tibia */}
          <mesh position={[0, -0.45, 0]}>
            <capsuleGeometry args={[0.13, 0.28, 4, 8]} />
            <meshStandardMaterial color="#1a237e" roughness={0.5} />
          </mesh>
          {/* Botte dorée */}
          <mesh position={[0, -0.7, 0.05]}>
            <boxGeometry args={[0.26, 0.18, 0.32]} />
            <meshStandardMaterial color="#c9a227" metalness={0.8} roughness={0.2} />
          </mesh>
          <GoldTrim x={0} y={-0.62} z={0} w={0.28} h={0.06} d={0.22} />
        </group>

        {/* Jambe droite */}
        <group ref={legRRef} position={[-0.28, -0.6, 0]}>
          <ZelligePatch x={0} y={0} z={0} w={0.34} h={0.4} d={0.3} />
          <GoldTrim x={0} y={0.22} z={0} w={0.36} h={0.06} d={0.32} />
          <mesh position={[0, -0.45, 0]}>
            <capsuleGeometry args={[0.13, 0.28, 4, 8]} />
            <meshStandardMaterial color="#1a237e" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.7, 0.05]}>
            <boxGeometry args={[0.26, 0.18, 0.32]} />
            <meshStandardMaterial color="#c9a227" metalness={0.8} roughness={0.2} />
          </mesh>
          <GoldTrim x={0} y={-0.62} z={0} w={0.28} h={0.06} d={0.22} />
        </group>

        {/* ===== TORSE ===== */}
        {/* Corps principal armure zellige */}
        <ZelligePatch x={0} y={0} z={0} w={0.78} h={0.75} d={0.52} />

        {/* Bandes dorées horizontales */}
        <GoldTrim x={0} y={0.4} z={0} w={0.82} h={0.07} d={0.54} />
        <GoldTrim x={0} y={0} z={0} w={0.82} h={0.06} d={0.54} />
        <GoldTrim x={0} y={-0.4} z={0} w={0.82} h={0.07} d={0.54} />

        {/* Médaillon central (emblème) */}
        <group position={[0, 0.12, 0.29]}>
          <mesh>
            <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
            <meshStandardMaterial color="#c9a227" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.04, 0]}>
            <torusGeometry args={[0.1, 0.025, 6, 14]} />
            <meshStandardMaterial color="#8B6914" metalness={0.8} roughness={0.1} />
          </mesh>
        </group>

        {/* Ceinture dorée */}
        <group position={[0, -0.42, 0]}>
          <mesh>
            <boxGeometry args={[0.82, 0.14, 0.56]} />
            <meshStandardMaterial color="#c9a227" metalness={0.85} roughness={0.15} />
          </mesh>
          {/* Boucles de ceinture */}
          {[-0.25, 0, 0.25].map((bx, i) => (
            <mesh key={i} position={[bx, 0, 0.29]}>
              <boxGeometry args={[0.12, 0.1, 0.04]} />
              <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.05} />
            </mesh>
          ))}
        </group>

        {/* ===== BRAS ===== */}
        {/* Bras gauche */}
        <group ref={armLRef} position={[0.58, 0.1, 0]}>
          {/* Épaulière */}
          <mesh position={[0, 0.28, 0]}>
            <sphereGeometry args={[0.22, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
            <meshStandardMaterial color="#1a237e" roughness={0.4} metalness={0.3} />
          </mesh>
          <GoldTrim x={0} y={0.25} z={0} w={0.42} h={0.06} d={0.42} />
          {/* Bras haut */}
          <ZelligePatch x={0} y={0} z={0} w={0.28} h={0.38} d={0.28} />
          {/* Avant-bras */}
          <mesh position={[0, -0.38, 0]}>
            <capsuleGeometry args={[0.12, 0.25, 4, 8]} />
            <meshStandardMaterial color="#1a237e" roughness={0.5} />
          </mesh>
          {/* Gantelet */}
          <mesh position={[0, -0.6, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#546e7a" roughness={0.6} />
          </mesh>
          <GoldTrim x={0} y={-0.52} z={0} w={0.28} h={0.05} d={0.28} />
          {/* Médaillon épaulière */}
          <Medallion x={0.14} y={0.3} z={0.1} side={1} />
        </group>

        {/* Bras droit */}
        <group ref={armRRef} position={[-0.58, 0.1, 0]}>
          <mesh position={[0, 0.28, 0]}>
            <sphereGeometry args={[0.22, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
            <meshStandardMaterial color="#1a237e" roughness={0.4} metalness={0.3} />
          </mesh>
          <GoldTrim x={0} y={0.25} z={0} w={0.42} h={0.06} d={0.42} />
          <ZelligePatch x={0} y={0} z={0} w={0.28} h={0.38} d={0.28} />
          <mesh position={[0, -0.38, 0]}>
            <capsuleGeometry args={[0.12, 0.25, 4, 8]} />
            <meshStandardMaterial color="#1a237e" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.6, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#546e7a" roughness={0.6} />
          </mesh>
          <GoldTrim x={0} y={-0.52} z={0} w={0.28} h={0.05} d={0.28} />
          <Medallion x={-0.14} y={0.3} z={0.1} side={-1} />
        </group>

        {/* ===== TÊTE ===== */}
        {/* Cou / col d'armure */}
        <mesh position={[0, 0.56, 0]}>
          <cylinderGeometry args={[0.2, 0.28, 0.22, 10]} />
          <meshStandardMaterial color="#c9a227" metalness={0.8} roughness={0.15} />
        </mesh>

        {/* Tête requin — gris bleuté */}
        <group position={[0, 0.82, 0]}>
          {/* Crâne principal */}
          <mesh>
            <sphereGeometry args={[0.38, 14, 12]} />
            <meshStandardMaterial color="#78909c" roughness={0.5} />
          </mesh>

          {/* Ventre/museau plus clair */}
          <mesh position={[0, -0.08, 0.24]}>
            <sphereGeometry args={[0.26, 10, 8]} />
            <meshStandardMaterial color="#cfd8dc" roughness={0.4} />
          </mesh>

          {/* Museau arrondi */}
          <mesh position={[0, -0.18, 0.3]} rotation={[0.6, 0, 0]}>
            <capsuleGeometry args={[0.18, 0.12, 6, 10]} />
            <meshStandardMaterial color="#90a4ae" roughness={0.5} />
          </mesh>

          {/* Grande gueule — sourire requin */}
          <mesh position={[0, -0.26, 0.3]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[0.36, 0.1, 0.18]} />
            <meshStandardMaterial color="#c62828" roughness={0.8} />
          </mesh>

          {/* Rangée de dents */}
          {[-0.14, -0.08, -0.02, 0.02, 0.08, 0.14].map((tx, i) => (
            <mesh key={i} position={[tx, -0.22, 0.38]} rotation={[0.3, 0, 0]}>
              <coneGeometry args={[0.025, 0.07, 4]} />
              <meshStandardMaterial color="white" roughness={0.2} />
            </mesh>
          ))}
          {[-0.12, -0.06, 0, 0.06, 0.12].map((tx, i) => (
            <mesh key={i} position={[tx, -0.3, 0.37]} rotation={[Math.PI + 0.3, 0, 0]}>
              <coneGeometry args={[0.025, 0.07, 4]} />
              <meshStandardMaterial color="white" roughness={0.2} />
            </mesh>
          ))}

          {/* Yeux noirs brillants */}
          <mesh position={[0.2, 0.08, 0.3]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshStandardMaterial color="#0d0d0d" roughness={0.1} metalness={0.5} />
          </mesh>
          <mesh position={[-0.2, 0.08, 0.3]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshStandardMaterial color="#0d0d0d" roughness={0.1} metalness={0.5} />
          </mesh>
          {/* Reflet œil */}
          <mesh position={[0.22, 0.11, 0.35]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[-0.18, 0.11, 0.35]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.8} />
          </mesh>

          {/* Nageoire dorsale */}
          <mesh position={[0, 0.42, -0.12]} rotation={[0.15, 0, 0]}>
            <coneGeometry args={[0.1, 0.38, 4]} />
            <meshStandardMaterial color="#607d8b" roughness={0.6} />
          </mesh>

          {/* Ouïes */}
          <mesh position={[0.32, 0, 0.1]} rotation={[0, -0.4, 0.2]}>
            <boxGeometry args={[0.04, 0.22, 0.08]} />
            <meshStandardMaterial color="#546e7a" roughness={0.8} />
          </mesh>
          <mesh position={[-0.32, 0, 0.1]} rotation={[0, 0.4, -0.2]}>
            <boxGeometry args={[0.04, 0.22, 0.08]} />
            <meshStandardMaterial color="#546e7a" roughness={0.8} />
          </mesh>

          {/* Collier d'armure doré */}
          <mesh position={[0, -0.34, 0]}>
            <torusGeometry args={[0.22, 0.05, 6, 16]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>

      </group>
    </group>
  );
}
