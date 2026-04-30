import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const TRACK_LENGTH = 100;
const TRACK_SEGMENTS = 4;
const SEG_LENGTH = TRACK_LENGTH / TRACK_SEGMENTS;

interface TrackProps {
  speed: number;
}

function RoadSegment({ zOffset }: { zOffset: number }) {
  const dashCount = Math.floor(SEG_LENGTH / 4);

  return (
    <group>
      {/* Asphalte nuit — plus sombre avec reflets */}
      <mesh position={[0, -0.02, zOffset + SEG_LENGTH / 2]} receiveShadow>
        <boxGeometry args={[7, 0.04, SEG_LENGTH]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Trottoir gauche — pierres de Safi */}
      <mesh position={[-4.8, 0.03, zOffset + SEG_LENGTH / 2]} receiveShadow>
        <boxGeometry args={[2.2, 0.06, SEG_LENGTH]} />
        <meshStandardMaterial color="#2a2018" roughness={0.9} />
      </mesh>
      {/* Trottoir droit */}
      <mesh position={[4.8, 0.03, zOffset + SEG_LENGTH / 2]} receiveShadow>
        <boxGeometry args={[2.2, 0.06, SEG_LENGTH]} />
        <meshStandardMaterial color="#2a2018" roughness={0.9} />
      </mesh>

      {/* Motifs zellige sur trottoir gauche */}
      {Array.from({ length: Math.floor(SEG_LENGTH / 3) }, (_, i) => (
        <mesh key={`zl${i}`} position={[-4.8, 0.04, zOffset + i * 3 + 1.5]}>
          <boxGeometry args={[2.1, 0.01, 2.8]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#1a3a5c" : "#0d2240"} roughness={0.6} />
        </mesh>
      ))}
      {/* Motifs zellige trottoir droit */}
      {Array.from({ length: Math.floor(SEG_LENGTH / 3) }, (_, i) => (
        <mesh key={`zr${i}`} position={[4.8, 0.04, zOffset + i * 3 + 1.5]}>
          <boxGeometry args={[2.1, 0.01, 2.8]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#1a3a5c" : "#0d2240"} roughness={0.6} />
        </mesh>
      ))}

      {/* Bordure trottoir */}
      <mesh position={[-3.65, 0.05, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[0.15, 0.1, SEG_LENGTH]} />
        <meshStandardMaterial color="#4a3518" roughness={0.85} />
      </mesh>
      <mesh position={[3.65, 0.05, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[0.15, 0.1, SEG_LENGTH]} />
        <meshStandardMaterial color="#4a3518" roughness={0.85} />
      </mesh>

      {/* Ligne de voie gauche — blanche lumineuse */}
      {Array.from({ length: dashCount }, (_, i) => (
        <mesh key={`ll${i}`} position={[-1.17, 0.01, zOffset + i * 4 + 1]}>
          <boxGeometry args={[0.1, 0.02, 2.2]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} roughness={0.4} />
        </mesh>
      ))}
      {/* Ligne de voie droite */}
      {Array.from({ length: dashCount }, (_, i) => (
        <mesh key={`rl${i}`} position={[1.17, 0.01, zOffset + i * 4 + 1]}>
          <boxGeometry args={[0.1, 0.02, 2.2]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} roughness={0.4} />
        </mesh>
      ))}

      <StreetDecorations zOffset={zOffset} />
    </group>
  );
}

function PalmTree({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.14, 4.4, 7]} />
        <meshStandardMaterial color="#4e342e" roughness={0.95} />
      </mesh>
      {[-1, -0.5, 0, 0.5, 1].map((a, i) => (
        <group key={i} position={[0, 4.5, 0]} rotation={[0.5, (a * Math.PI) / 2, 0]}>
          <mesh position={[0.8, 0, 0]}>
            <boxGeometry args={[1.6, 0.05, 0.4]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#1b5e20" : "#2e7d32"} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function RoundTree({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.13, 3.2, 6]} />
        <meshStandardMaterial color="#3e2723" roughness={0.95} />
      </mesh>
      <mesh position={[0, 3.4, 0]} castShadow>
        <sphereGeometry args={[0.85, 9, 9]} />
        <meshStandardMaterial color="#1b5e20" roughness={0.8} />
      </mesh>
      <mesh position={[0.15, 3.7, 0.15]} castShadow>
        <sphereGeometry args={[0.45, 7, 7]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.75} />
      </mesh>
    </group>
  );
}

function MarketStall({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {[[-0.55, 0.55], [0.55, 0.55], [-0.55, -0.55], [0.55, -0.55]].map(([px, pz], i) => (
        <mesh key={i} position={[px as number, 0.7, pz as number]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 1.4, 6]} />
          <meshStandardMaterial color="#5d4037" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 1.5, 0]} rotation={[0.12, 0, 0]} castShadow>
        <boxGeometry args={[1.5, 0.07, 1.5]} />
        <meshStandardMaterial
          color="#c62828"
          roughness={0.7}
          emissive="#b71c1c"
          emissiveIntensity={0.15}
        />
      </mesh>
      {[-0.55, -0.28, 0, 0.28, 0.55].map((fx, i) => (
        <mesh key={i} position={[fx, 1.37, 0.73]} castShadow>
          <boxGeometry args={[0.15, 0.22, 0.05]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#ef9a9a" : "#f48fb1"} roughness={0.7} />
        </mesh>
      ))}
      {/* Table avec produits */}
      <mesh position={[0, 0.62, 0]}>
        <boxGeometry args={[1.1, 0.07, 0.85]} />
        <meshStandardMaterial color="#6d4c41" roughness={0.8} />
      </mesh>
      {/* Lumière stall */}
      <pointLight position={[x, 1.8, z]} color="#ff8f00" intensity={0.8} distance={5} />
    </group>
  );
}

function MoroccanBuilding({ x, z, w, h, hasDome, hasTower, color }: {
  x: number; z: number; w: number; h: number;
  hasDome?: boolean; hasTower?: boolean; color?: string;
}) {
  const wallColor = color ?? "#2a1e0a";
  const litColor = color ?? "#b8860b";
  const trimColor = "#8B6914";

  return (
    <group position={[x, 0, z]}>
      {/* Corps principal */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, w * 0.85]} />
        <meshStandardMaterial
          color={wallColor}
          roughness={0.85}
          emissive={litColor}
          emissiveIntensity={0.08}
        />
      </mesh>

      {/* Créneaux */}
      {Array.from({ length: Math.floor(w * 1.8) }, (_, i) => {
        const spacing = w / Math.max(1, Math.floor(w * 1.8) - 1);
        const bx = -w / 2 + i * spacing;
        return (
          <mesh key={i} position={[bx, h + 0.15, 0]} castShadow>
            <boxGeometry args={[0.22, 0.3, w * 0.87]} />
            <meshStandardMaterial color="#4a3518" roughness={0.8} />
          </mesh>
        );
      })}

      {/* Fenêtres éclairées de l'intérieur */}
      {Array.from({ length: Math.max(1, Math.floor(w / 1.4)) }, (_, i) => {
        const spacing = w / Math.max(1, Math.floor(w / 1.4));
        const wx = -w / 2 + i * spacing + spacing / 2;
        return (
          <group key={i}>
            <mesh position={[wx, h * 0.55, w * 0.43]}>
              <boxGeometry args={[0.28, 0.45, 0.08]} />
              <meshStandardMaterial
                color="#ffe082"
                emissive="#ff8f00"
                emissiveIntensity={1.5}
                roughness={0.2}
              />
            </mesh>
            {/* Arche dorée */}
            <mesh position={[wx, h * 0.55 + 0.25, w * 0.435]}>
              <torusGeometry args={[0.16, 0.04, 6, 10, Math.PI]} />
              <meshStandardMaterial color={trimColor} roughness={0.5} />
            </mesh>
          </group>
        );
      })}

      {/* Dôme bleu nuit */}
      {hasDome && (
        <group position={[0, h, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[w * 0.32, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            <meshStandardMaterial color="#0d2a5c" roughness={0.3} metalness={0.2} />
          </mesh>
          <mesh position={[0, -0.18, 0]}>
            <cylinderGeometry args={[w * 0.3, w * 0.3, 0.36, 12]} />
            <meshStandardMaterial color={trimColor} roughness={0.6} />
          </mesh>
          <mesh position={[0, w * 0.35, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} emissive="#ffa000" emissiveIntensity={0.6} />
          </mesh>
        </group>
      )}

      {/* Tour */}
      {hasTower && (
        <group position={[w * 0.35, 0, 0]}>
          <mesh position={[0, h + 1.2, 0]} castShadow>
            <boxGeometry args={[0.9, 2.4, 0.9]} />
            <meshStandardMaterial color={wallColor} roughness={0.85} />
          </mesh>
          {[[-0.3, -0.3], [-0.3, 0.3], [0.3, -0.3], [0.3, 0.3]].map(([tx, tz], i) => (
            <mesh key={i} position={[tx as number, h + 2.55, tz as number]} castShadow>
              <boxGeometry args={[0.28, 0.3, 0.28]} />
              <meshStandardMaterial color="#4a3518" roughness={0.8} />
            </mesh>
          ))}
        </group>
      )}

      {/* Entrée en arc */}
      <mesh position={[0, h * 0.22, w * 0.43]}>
        <boxGeometry args={[0.55, 0.85, 0.1]} />
        <meshStandardMaterial color="#1a0800" roughness={0.5} />
      </mesh>
      <mesh position={[0, h * 0.22 + 0.5, w * 0.43]}>
        <torusGeometry args={[0.28, 0.07, 6, 10, Math.PI]} />
        <meshStandardMaterial color={trimColor} roughness={0.5} />
      </mesh>
    </group>
  );
}

function Lamppost({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* Poteau en fer forgé */}
      <mesh position={[0, 2.0, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.06, 4.0, 7]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Bras horizontal */}
      <mesh position={[0.3, 3.9, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.65, 5]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Lanterne — lumière chaude */}
      <mesh position={[0.6, 3.75, 0]}>
        <boxGeometry args={[0.22, 0.3, 0.22]} />
        <meshStandardMaterial color="#c9a227" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Halo de lumière */}
      <mesh position={[0.6, 3.7, 0]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial
          color="#fff3e0"
          emissive="#ff8f00"
          emissiveIntensity={2.5}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Point light orange chaud */}
      <pointLight position={[0.6, 3.6, 0]} color="#ff8f00" intensity={2.5} distance={12} castShadow />
    </group>
  );
}

function StreetDecorations({ zOffset }: { zOffset: number }) {
  const data = useMemo(() => {
    const idx = Math.abs(Math.floor(zOffset)) % 400;
    return {
      buildings: [
        { x: -7.8, z: zOffset + 4, w: 3.5, h: 4.5, hasDome: true, hasTower: false, color: "#2a1e0a" },
        { x: 8.5, z: zOffset + 8, w: 4.0, h: 5.5, hasDome: false, hasTower: true, color: "#221808" },
        { x: -8.2, z: zOffset + 14, w: 2.8, h: 3.8, hasDome: false, hasTower: false, color: "#2e2210" },
        { x: 7.9, z: zOffset + 18, w: 3.2, h: 4.2, hasDome: true, hasTower: true, color: "#261c09" },
        { x: -7.5, z: zOffset + 22, w: 4.5, h: 6.0, hasDome: true, hasTower: false, color: "#1e1608" },
      ],
      trees: [
        { x: -4.2, z: zOffset + 2, type: "palm" as const },
        { x: 4.2, z: zOffset + 6, type: "round" as const },
        { x: -4.2, z: zOffset + 11, type: "round" as const },
        { x: 4.2, z: zOffset + 15, type: "palm" as const },
        { x: -4.2, z: zOffset + 19, type: "round" as const },
        { x: 4.2, z: zOffset + 23, type: "palm" as const },
      ],
      stalls: idx % 3 === 0
        ? [{ x: -5.5, z: zOffset + 7 }, { x: -5.5, z: zOffset + 10 }]
        : idx % 3 === 1
          ? [{ x: 5.8, z: zOffset + 13 }]
          : [],
      lampposts: [
        { x: -3.85, z: zOffset + 4 },
        { x: 3.85, z: zOffset + 4 },
        { x: -3.85, z: zOffset + 14 },
        { x: 3.85, z: zOffset + 14 },
      ],
    };
  }, [zOffset]);

  return (
    <>
      {data.buildings.map((b, i) => <MoroccanBuilding key={i} {...b} />)}
      {data.trees.map((t, i) =>
        t.type === "palm"
          ? <PalmTree key={i} x={t.x} z={t.z} />
          : <RoundTree key={i} x={t.x} z={t.z} />
      )}
      {data.stalls.map((s, i) => <MarketStall key={i} x={s.x} z={s.z} />)}
      {data.lampposts.map((lp, i) => <Lamppost key={i} x={lp.x} z={lp.z} />)}
    </>
  );
}

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
    <group ref={groupRef}>
      {segmentOffsets.map((offset) => (
        <RoadSegment key={offset} zOffset={offset} />
      ))}
    </group>
  );
}
