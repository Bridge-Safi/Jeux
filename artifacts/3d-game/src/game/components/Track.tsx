import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

const TRACK_LENGTH = 100;
const TRACK_SEGMENTS = 4;
const SEG_LENGTH = TRACK_LENGTH / TRACK_SEGMENTS;

interface TrackProps {
  speed: number;
}

/* ── Sol ville — texture Safi vue de haut, teinté chaud ─── */
function CityGround({ speed }: { speed: number }) {
  const sat = useLoader(THREE.TextureLoader, `${import.meta.env.BASE_URL}safi-satellite.png`);

  useMemo(() => {
    sat.wrapS = THREE.RepeatWrapping;
    sat.wrapT = THREE.RepeatWrapping;
    sat.repeat.set(1.5, 6);
    sat.minFilter = THREE.LinearFilter;
    sat.magFilter = THREE.LinearFilter;
    // @ts-ignore
    sat.colorSpace = THREE.SRGBColorSpace ?? sat.colorSpace;
  }, [sat]);

  useFrame((_, delta) => {
    sat.offset.y -= speed * delta * 0.012;
  });

  return (
    <mesh position={[0, -0.06, -50]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[60, 220]} />
      <meshBasicMaterial map={sat} color="#9bb3d6" toneMapped={false} />
    </mesh>
  );
}

/* ── Voie ferrée : rails métalliques + traverses bois ────── */
function Railway({ zOffset }: { zOffset: number }) {
  const sleepers = Math.floor(SEG_LENGTH / 1.2);

  return (
    <group>
      {/* Ballast (cailloux) sous les rails */}
      <mesh position={[0, -0.04, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[6.8, 0.04, SEG_LENGTH]} />
        <meshBasicMaterial color="#5d4e37" />
      </mesh>

      {/* Rails métalliques (4 rails pour 3 voies) */}
      {[-2.7, -0.95, 0.95, 2.7].map((rx, i) => (
        <group key={i}>
          <mesh position={[rx, 0.04, zOffset + SEG_LENGTH / 2]}>
            <boxGeometry args={[0.12, 0.08, SEG_LENGTH]} />
            <meshBasicMaterial color="#9e9e9e" toneMapped={false} />
          </mesh>
          {/* Reflet brillant sur le rail */}
          <mesh position={[rx, 0.085, zOffset + SEG_LENGTH / 2]}>
            <boxGeometry args={[0.06, 0.005, SEG_LENGTH]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Traverses bois */}
      {Array.from({ length: sleepers }, (_, i) => (
        <mesh key={`sl${i}`} position={[0, -0.005, zOffset + i * 1.2 + 0.6]}>
          <boxGeometry args={[6.4, 0.06, 0.35]} />
          <meshBasicMaterial color="#4e342e" />
        </mesh>
      ))}
    </group>
  );
}

/* ── Mur graffiti coloré (à côté de la voie) ─────────────── */
function GraffitiWall({ side, zOffset }: { side: -1 | 1; zOffset: number }) {
  const colors = ["#ff5252", "#ffd740", "#69f0ae", "#40c4ff", "#e040fb"];
  const palette = useMemo(() => {
    const p: string[] = [];
    for (let i = 0; i < 8; i++) p.push(colors[Math.floor(Math.random() * colors.length)]);
    return p;
  }, []);

  return (
    <group position={[side * 4.5, 0, zOffset]}>
      {/* Mur béton de base */}
      <mesh position={[0, 1.3, SEG_LENGTH / 2]}>
        <boxGeometry args={[0.3, 2.6, SEG_LENGTH]} />
        <meshBasicMaterial color="#bdbdbd" toneMapped={false} />
      </mesh>

      {/* Bandeau noir en haut (style cartoon) */}
      <mesh position={[0, 2.6, SEG_LENGTH / 2]}>
        <boxGeometry args={[0.35, 0.1, SEG_LENGTH]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>

      {/* Tags graffitis colorés */}
      {Array.from({ length: 5 }, (_, i) => {
        const tagZ = i * (SEG_LENGTH / 5) + 2;
        const isLetters = i % 2 === 0;
        return (
          <group key={i} position={[side * 0.16, 1 + (i % 3) * 0.3, tagZ]}>
            {/* Bulle / forme du tag */}
            <mesh rotation={[0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
              <planeGeometry args={[2.2, 0.7]} />
              <meshBasicMaterial color={palette[i]} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
            {/* Contour cartoon noir */}
            {isLetters && (
              <>
                <mesh position={[0, 0.32, 0]} rotation={[0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
                  <planeGeometry args={[2.2, 0.05]} />
                  <meshBasicMaterial color="#1a1a1a" side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[0, -0.32, 0]} rotation={[0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
                  <planeGeometry args={[2.2, 0.05]} />
                  <meshBasicMaterial color="#1a1a1a" side={THREE.DoubleSide} />
                </mesh>
              </>
            )}
          </group>
        );
      })}
    </group>
  );
}

/* ── Poteau électrique avec câbles ───────────────────────── */
function PowerPole({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* Poteau bois */}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 6, 6]} />
        <meshBasicMaterial color="#5d4037" />
      </mesh>
      {/* Traverse horizontale */}
      <mesh position={[0, 5.4, 0]}>
        <boxGeometry args={[1.6, 0.12, 0.12]} />
        <meshBasicMaterial color="#4e342e" />
      </mesh>
      {/* Isolateurs blancs */}
      {[-0.6, 0, 0.6].map((ox, i) => (
        <mesh key={i} position={[ox, 5.55, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.18, 6]} />
          <meshBasicMaterial color="#fafafa" toneMapped={false} />
        </mesh>
      ))}
      {/* Mini-lampe orange en haut */}
      <mesh position={[0, 5.9, 0]}>
        <boxGeometry args={[0.18, 0.18, 0.18]} />
        <meshBasicMaterial color="#ffeb3b" toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ── Train ONCF stationné en arrière-plan ────────────────── */
function ParkedTrain({ side, z }: { side: -1 | 1; z: number }) {
  const x = side * 8;
  const carColors = ["#e53935", "#1e88e5", "#fdd835", "#43a047"];

  return (
    <group position={[x, 0, z]}>
      {[0, 1, 2, 3].map((i) => {
        const c = carColors[i % carColors.length];
        return (
          <group key={i} position={[0, 0, i * 5.5 - 8]}>
            {/* Corps wagon */}
            <mesh position={[0, 1.3, 0]}>
              <boxGeometry args={[2.2, 2.2, 5]} />
              <meshBasicMaterial color={c} toneMapped={false} />
            </mesh>
            {/* Toit cartoon noir */}
            <mesh position={[0, 2.45, 0]}>
              <boxGeometry args={[2.25, 0.12, 5.05]} />
              <meshBasicMaterial color="#1a1a1a" />
            </mesh>
            {/* Bande blanche horizontale */}
            <mesh position={[side * 1.11, 1.7, 0]}>
              <boxGeometry args={[0.02, 0.2, 4.8]} />
              <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
            {/* Fenêtres */}
            {[-1.5, -0.5, 0.5, 1.5].map((wz, j) => (
              <mesh key={j} position={[side * 1.11, 1.95, wz]}>
                <boxGeometry args={[0.02, 0.45, 0.7]} />
                <meshBasicMaterial color="#fff59d" toneMapped={false} />
              </mesh>
            ))}
            {/* Roues */}
            {[-1.5, 1.5].map((wz, j) => (
              <mesh key={j} position={[side * 1.0, 0.25, wz]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.25, 0.25, 0.15, 10]} />
                <meshBasicMaterial color="#212121" />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

/* ── Bande "route" GPS au-dessus du ballast ─────────────── */
function RoadStripe({ zOffset }: { zOffset: number }) {
  const dashCount = Math.floor(SEG_LENGTH / 4);

  return (
    <group>
      {/* Bordures cyan glow GPS */}
      <mesh position={[-3.4, 0.105, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[0.16, 0.04, SEG_LENGTH]} />
        <meshBasicMaterial color="#00e5ff" toneMapped={false} />
      </mesh>
      <mesh position={[3.4, 0.105, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[0.16, 0.04, SEG_LENGTH]} />
        <meshBasicMaterial color="#00e5ff" toneMapped={false} />
      </mesh>

      {/* Halo glow extérieur */}
      <mesh position={[-3.4, 0.101, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[0.55, 0.01, SEG_LENGTH]} />
        <meshBasicMaterial color="#00bcd4" transparent opacity={0.35} toneMapped={false} />
      </mesh>
      <mesh position={[3.4, 0.101, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[0.55, 0.01, SEG_LENGTH]} />
        <meshBasicMaterial color="#00bcd4" transparent opacity={0.35} toneMapped={false} />
      </mesh>

      {/* Chevrons jaunes */}
      {Array.from({ length: dashCount }, (_, i) => (
        <group key={`arrow${i}`} position={[0, 0.115, zOffset + i * 4 + 1]}>
          <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
            <planeGeometry args={[0.55, 0.16]} />
            <meshBasicMaterial color="#ffeb3b" toneMapped={false} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, -Math.PI / 4]}>
            <planeGeometry args={[0.55, 0.16]} />
            <meshBasicMaterial color="#ffeb3b" toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ── Décorations urbaines par segment ────────────────────── */
function StreetProps({ zOffset, segIdx }: { zOffset: number; segIdx: number }) {
  const poles = useMemo(() => [
    { x: -4.2, z: zOffset + 5 },
    { x:  4.2, z: zOffset + 11 },
    { x: -4.2, z: zOffset + 17 },
    { x:  4.2, z: zOffset + 23 },
  ], [zOffset]);

  const trains = useMemo(() => {
    if (segIdx % 2 === 0) return [{ side: -1 as const, z: zOffset + 12 }];
    return [{ side: 1 as const, z: zOffset + 14 }];
  }, [zOffset, segIdx]);

  return (
    <>
      <Railway zOffset={zOffset} />
      <RoadStripe zOffset={zOffset} />
      <GraffitiWall side={-1} zOffset={zOffset} />
      <GraffitiWall side={ 1} zOffset={zOffset} />
      {poles.map((p, i) => <PowerPole key={`pp${i}`} x={p.x} z={p.z} />)}
      {trains.map((t, i) => <ParkedTrain key={`tr${i}`} side={t.side} z={t.z} />)}
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
      <CityGround speed={speed} />
      <group ref={groupRef}>
        {segmentOffsets.map((offset, idx) => (
          <group key={offset}>
            <StreetProps zOffset={offset} segIdx={idx} />
          </group>
        ))}
      </group>
    </>
  );
}
