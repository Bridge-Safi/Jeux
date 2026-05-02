import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

const TRACK_LENGTH = 100;
const TRACK_SEGMENTS = 4;
const SEG_LENGTH = TRACK_LENGTH / TRACK_SEGMENTS;

interface TrackProps {
  speed: number;
}

/* ── Sol GPS — vraie image satellite de Safi qui défile ────── */
function SafiGroundMap({ speed }: { speed: number }) {
  /* Texture satellite réelle de Safi (rayon ~2km depuis le centre-ville) */
  const sat = useLoader(THREE.TextureLoader, `${import.meta.env.BASE_URL}safi-satellite.png`);

  /* Setup texture une seule fois */
  const setup = useMemo(() => {
    sat.wrapS = THREE.RepeatWrapping;
    sat.wrapT = THREE.RepeatWrapping;
    sat.repeat.set(1.5, 6); // tile la carte 6× sur la longueur de la route
    sat.minFilter = THREE.LinearFilter;
    sat.magFilter = THREE.LinearFilter;
    // @ts-ignore
    sat.colorSpace = THREE.SRGBColorSpace ?? sat.colorSpace;
    return true;
  }, [sat]);

  /* Scroll du texture vers la caméra à chaque frame */
  useFrame((_, delta) => {
    if (setup) {
      sat.offset.y -= speed * delta * 0.012;
    }
  });

  return (
    <mesh position={[0, -0.05, -50]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[40, 200]} />
      {/* Couleur tinted bleu nuit pour matcher l'ambiance nocturne */}
      <meshBasicMaterial map={sat} color="#7088b0" toneMapped={false} />
    </mesh>
  );
}

/* ── Bande "route éclairée" sur le sol satellite ──────────── */
function RoadStripe({ zOffset }: { zOffset: number }) {
  const dashCount = Math.floor(SEG_LENGTH / 4);

  return (
    <group>
      {/* Bande sombre semi-transparente pour la route active */}
      <mesh position={[0, -0.02, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[7.2, 0.02, SEG_LENGTH]} />
        <meshBasicMaterial color="#1a1f2e" transparent opacity={0.78} />
      </mesh>

      {/* Bordures lumineuses bleu cyan — style GPS navigation */}
      <mesh position={[-3.5, 0.005, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[0.18, 0.04, SEG_LENGTH]} />
        <meshBasicMaterial color="#00e5ff" toneMapped={false} />
      </mesh>
      <mesh position={[3.5, 0.005, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[0.18, 0.04, SEG_LENGTH]} />
        <meshBasicMaterial color="#00e5ff" toneMapped={false} />
      </mesh>

      {/* Halo sous-bord — effet GPS glow */}
      <mesh position={[-3.5, 0.001, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[0.5, 0.01, SEG_LENGTH]} />
        <meshBasicMaterial color="#00bcd4" transparent opacity={0.35} />
      </mesh>
      <mesh position={[3.5, 0.001, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[0.5, 0.01, SEG_LENGTH]} />
        <meshBasicMaterial color="#00bcd4" transparent opacity={0.35} />
      </mesh>

      {/* Flèches de direction GPS (chevrons pointant vers l'avant) */}
      {Array.from({ length: dashCount }, (_, i) => (
        <group key={`arrow${i}`} position={[0, 0.012, zOffset + i * 4 + 1]}>
          <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
            <planeGeometry args={[0.6, 0.18]} />
            <meshBasicMaterial color="#ffeb3b" toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 4]}>
            <planeGeometry args={[0.6, 0.18]} />
            <meshBasicMaterial color="#ffeb3b" toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Lignes de voie (séparation 3 lanes) — pointillés blancs */}
      {Array.from({ length: dashCount }, (_, i) => (
        <mesh key={`ll${i}`} position={[-1.17, 0.01, zOffset + i * 4 + 1]}>
          <boxGeometry args={[0.1, 0.02, 2]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      {Array.from({ length: dashCount }, (_, i) => (
        <mesh key={`rl${i}`} position={[1.17, 0.01, zOffset + i * 4 + 1]}>
          <boxGeometry args={[0.1, 0.02, 2]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
}

/* ── Lampadaire ────────────────────────────────────────────── */
function Lamppost({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2.0, 0]}>
        <cylinderGeometry args={[0.04, 0.07, 4.0, 6]} />
        <meshBasicMaterial color="#37474f" />
      </mesh>
      <mesh position={[0.3, 3.9, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.65, 5]} />
        <meshBasicMaterial color="#37474f" />
      </mesh>
      <mesh position={[0.6, 3.75, 0]}>
        <boxGeometry args={[0.22, 0.28, 0.22]} />
        <meshBasicMaterial color="#ffeb3b" toneMapped={false} />
      </mesh>
      <mesh position={[0.6, 3.7, 0]}>
        <sphereGeometry args={[0.32, 8, 8]} />
        <meshBasicMaterial color="#ff8f00" transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

/* ── Palmier ───────────────────────────────────────────────── */
function PalmTree({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2.4, 0]}>
        <cylinderGeometry args={[0.1, 0.16, 4.8, 6]} />
        <meshBasicMaterial color="#5d4037" />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} position={[0, 4.7, 0]} rotation={[0.4, (i / 5) * Math.PI * 2, 0]}>
          <mesh position={[0.85, 0, 0]}>
            <boxGeometry args={[1.7, 0.04, 0.4]} />
            <meshBasicMaterial color="#388e3c" />
          </mesh>
        </group>
      ))}
      {/* Dattes */}
      <mesh position={[0, 4.5, 0]}>
        <sphereGeometry args={[0.22, 6, 6]} />
        <meshBasicMaterial color="#ff6f00" />
      </mesh>
    </group>
  );
}

/* ── Décorations le long de la route ───────────────────────── */
function StreetDecorations({ zOffset }: { zOffset: number }) {
  const lampposts = useMemo(() => [
    { x: -3.85, z: zOffset + 4 },
    { x:  3.85, z: zOffset + 4 },
    { x: -3.85, z: zOffset + 14 },
    { x:  3.85, z: zOffset + 14 },
    { x: -3.85, z: zOffset + 24 },
    { x:  3.85, z: zOffset + 24 },
  ], [zOffset]);
  const palms = useMemo(() => [
    { x: -5.5, z: zOffset + 3 },
    { x:  5.5, z: zOffset + 9 },
    { x: -5.5, z: zOffset + 17 },
    { x:  5.5, z: zOffset + 22 },
  ], [zOffset]);

  return (
    <>
      {lampposts.map((lp, i) => <Lamppost key={i} x={lp.x} z={lp.z} />)}
      {palms.map((p, i) => <PalmTree key={i} x={p.x} z={p.z} />)}
    </>
  );
}

/* ── Track principal ───────────────────────────────────────── */
export function Track({ speed }: TrackProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.z += speed * delta;
    if (groupRef.current.position.z >= SEG_LENGTH) {
      groupRef.current.position.z -= SEG_LENGTH;
    }
  });

  const segmentOffsets = useMemo(() => {
    const offs: number[] = [];
    for (let i = 0; i < TRACK_SEGMENTS; i++) {
      offs.push(-TRACK_LENGTH + i * SEG_LENGTH);
    }
    return offs;
  }, []);

  return (
    <>
      {/* Sol GPS satellite — fixe (texture scroll dedans) */}
      <SafiGroundMap speed={speed} />

      {/* Bande route + déco scrollent ensemble */}
      <group ref={groupRef}>
        {segmentOffsets.map((offset) => (
          <group key={offset}>
            <RoadStripe zOffset={offset} />
            <StreetDecorations zOffset={offset} />
          </group>
        ))}
      </group>
    </>
  );
}
