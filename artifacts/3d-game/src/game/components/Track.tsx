import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const TRACK_LENGTH = 100;
const TRACK_SEGMENTS = 4;
const SEG_LENGTH = TRACK_LENGTH / TRACK_SEGMENTS;

interface TrackProps {
  speed: number;
}

/* ── Route ─────────────────────────────────────────────────── */
function RoadSegment({ zOffset }: { zOffset: number }) {
  const dashCount = Math.floor(SEG_LENGTH / 4);

  return (
    <group>
      {/* Asphalte gris — bien visible */}
      <mesh position={[0, -0.02, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[7, 0.04, SEG_LENGTH]} />
        <meshBasicMaterial color="#3a404e" />
      </mesh>

      {/* Trottoir gauche */}
      <mesh position={[-4.8, 0.03, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[2.2, 0.06, SEG_LENGTH]} />
        <meshBasicMaterial color="#4a3c28" />
      </mesh>
      {/* Trottoir droit */}
      <mesh position={[4.8, 0.03, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[2.2, 0.06, SEG_LENGTH]} />
        <meshBasicMaterial color="#4a3c28" />
      </mesh>

      {/* Motifs zellige trottoir gauche */}
      {Array.from({ length: Math.floor(SEG_LENGTH / 3) }, (_, i) => (
        <mesh key={`zl${i}`} position={[-4.8, 0.04, zOffset + i * 3 + 1.5]}>
          <boxGeometry args={[2.1, 0.01, 2.8]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#1e4976" : "#2c5f8a"} />
        </mesh>
      ))}
      {/* Motifs zellige trottoir droit */}
      {Array.from({ length: Math.floor(SEG_LENGTH / 3) }, (_, i) => (
        <mesh key={`zr${i}`} position={[4.8, 0.04, zOffset + i * 3 + 1.5]}>
          <boxGeometry args={[2.1, 0.01, 2.8]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#1e4976" : "#2c5f8a"} />
        </mesh>
      ))}

      {/* Bordures trottoir */}
      <mesh position={[-3.65, 0.05, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[0.16, 0.12, SEG_LENGTH]} />
        <meshBasicMaterial color="#5d4520" />
      </mesh>
      <mesh position={[3.65, 0.05, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[0.16, 0.12, SEG_LENGTH]} />
        <meshBasicMaterial color="#5d4520" />
      </mesh>

      {/* Lignes de voie — blanc pur, toujours visible */}
      {Array.from({ length: dashCount }, (_, i) => (
        <mesh key={`ll${i}`} position={[-1.17, 0.015, zOffset + i * 4 + 1]}>
          <boxGeometry args={[0.13, 0.04, 2.5]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      {Array.from({ length: dashCount }, (_, i) => (
        <mesh key={`rl${i}`} position={[1.17, 0.015, zOffset + i * 4 + 1]}>
          <boxGeometry args={[0.13, 0.04, 2.5]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      <StreetDecorations zOffset={zOffset} />
    </group>
  );
}

/* ── Palmier ───────────────────────────────────────────────── */
function PalmTree({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.08, 0.14, 4.4, 6]} />
        <meshBasicMaterial color="#6d4c41" />
      </mesh>
      {[-1, -0.5, 0, 0.5, 1].map((a, i) => (
        <group key={i} position={[0, 4.5, 0]} rotation={[0.5, (a * Math.PI) / 2, 0]}>
          <mesh position={[0.8, 0, 0]}>
            <boxGeometry args={[1.6, 0.05, 0.4]} />
            <meshBasicMaterial color={i % 2 === 0 ? "#2e7d32" : "#388e3c"} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ── Arbre rond ────────────────────────────────────────────── */
function RoundTree({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.09, 0.13, 3.2, 6]} />
        <meshBasicMaterial color="#5d4037" />
      </mesh>
      <mesh position={[0, 3.4, 0]}>
        <sphereGeometry args={[0.85, 8, 8]} />
        <meshBasicMaterial color="#2e7d32" />
      </mesh>
      <mesh position={[0.15, 3.7, 0.15]}>
        <sphereGeometry args={[0.45, 6, 6]} />
        <meshBasicMaterial color="#43a047" />
      </mesh>
    </group>
  );
}

/* ── Étal de marché ────────────────────────────────────────── */
function MarketStall({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {([[-0.55, 0.55], [0.55, 0.55], [-0.55, -0.55], [0.55, -0.55]] as [number,number][]).map(([px, pz], i) => (
        <mesh key={i} position={[px, 0.7, pz]}>
          <cylinderGeometry args={[0.05, 0.05, 1.4, 5]} />
          <meshBasicMaterial color="#6d4c41" />
        </mesh>
      ))}
      {/* Toit rouge vif */}
      <mesh position={[0, 1.5, 0]} rotation={[0.12, 0, 0]}>
        <boxGeometry args={[1.5, 0.07, 1.5]} />
        <meshBasicMaterial color="#c62828" />
      </mesh>
      {/* Franges */}
      {([-0.55, -0.28, 0, 0.28, 0.55] as number[]).map((fx, i) => (
        <mesh key={i} position={[fx, 1.37, 0.73]}>
          <boxGeometry args={[0.15, 0.22, 0.05]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#ef9a9a" : "#f48fb1"} />
        </mesh>
      ))}
      {/* Table */}
      <mesh position={[0, 0.62, 0]}>
        <boxGeometry args={[1.1, 0.07, 0.85]} />
        <meshBasicMaterial color="#8d6e63" />
      </mesh>
      {/* Produits colorés */}
      {([[-0.3, "#e53935"], [0, "#ff8f00"], [0.3, "#43a047"]] as [number, string][]).map(([bx, bc], i) => (
        <mesh key={i} position={[bx, 0.72, 0]}>
          <boxGeometry args={[0.18, 0.12, 0.18]} />
          <meshBasicMaterial color={bc} />
        </mesh>
      ))}
      {/* Lanterne jaune au-dessus */}
      <mesh position={[0, 1.7, 0]}>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshBasicMaterial color="#ffca28" />
      </mesh>
    </group>
  );
}

/* ── Bâtiment marocain ─────────────────────────────────────── */
function MoroccanBuilding({ x, z, w, h, hasDome, hasTower, wallColor }: {
  x: number; z: number; w: number; h: number;
  hasDome?: boolean; hasTower?: boolean; wallColor?: string;
}) {
  const wc = wallColor ?? "#3d2e12";
  const trim = "#b8860b";

  return (
    <group position={[x, 0, z]}>
      {/* Corps principal */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, w * 0.85]} />
        <meshBasicMaterial color={wc} />
      </mesh>
      {/* Créneaux */}
      {Array.from({ length: Math.floor(w * 1.8) }, (_, i) => {
        const spacing = w / Math.max(1, Math.floor(w * 1.8) - 1);
        return (
          <mesh key={i} position={[-w / 2 + i * spacing, h + 0.15, 0]}>
            <boxGeometry args={[0.22, 0.3, w * 0.87]} />
            <meshBasicMaterial color="#5a4010" />
          </mesh>
        );
      })}
      {/* Fenêtres éclairées — jaune vif */}
      {Array.from({ length: Math.max(1, Math.floor(w / 1.4)) }, (_, i) => {
        const spacing = w / Math.max(1, Math.floor(w / 1.4));
        const wx = -w / 2 + i * spacing + spacing / 2;
        return (
          <mesh key={i} position={[wx, h * 0.55, w * 0.43]}>
            <boxGeometry args={[0.28, 0.45, 0.06]} />
            <meshBasicMaterial color="#ffca28" />
          </mesh>
        );
      })}
      {/* Dôme */}
      {hasDome && (
        <group position={[0, h, 0]}>
          <mesh>
            <sphereGeometry args={[w * 0.32, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            <meshBasicMaterial color="#0d3a7c" />
          </mesh>
          <mesh position={[0, w * 0.35, 0]}>
            <sphereGeometry args={[0.09, 7, 7]} />
            <meshBasicMaterial color="#ffd54f" />
          </mesh>
        </group>
      )}
      {/* Tour */}
      {hasTower && (
        <mesh position={[w * 0.35, h + 1.2, 0]}>
          <boxGeometry args={[0.9, 2.4, 0.9]} />
          <meshBasicMaterial color={wc} />
        </mesh>
      )}
      {/* Porte */}
      <mesh position={[0, h * 0.22, w * 0.43]}>
        <boxGeometry args={[0.55, 0.85, 0.1]} />
        <meshBasicMaterial color="#1a0c00" />
      </mesh>
    </group>
  );
}

/* ── Lampadaire ────────────────────────────────────────────── */
function Lamppost({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* Poteau */}
      <mesh position={[0, 2.0, 0]}>
        <cylinderGeometry args={[0.035, 0.06, 4.0, 6]} />
        <meshBasicMaterial color="#37474f" />
      </mesh>
      {/* Bras */}
      <mesh position={[0.3, 3.9, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.65, 5]} />
        <meshBasicMaterial color="#37474f" />
      </mesh>
      {/* Lanterne jaune-orange vif */}
      <mesh position={[0.6, 3.75, 0]}>
        <boxGeometry args={[0.22, 0.28, 0.22]} />
        <meshBasicMaterial color="#ffca28" />
      </mesh>
      {/* Halo visible */}
      <mesh position={[0.6, 3.7, 0]}>
        <sphereGeometry args={[0.18, 7, 7]} />
        <meshBasicMaterial color="#ff8f00" transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

/* ── Décorations de rue ────────────────────────────────────── */
function StreetDecorations({ zOffset }: { zOffset: number }) {
  const data = useMemo(() => {
    return {
      buildings: [
        { x: -7.8, z: zOffset + 4,  w: 3.5, h: 4.5, hasDome: true,  hasTower: false, wallColor: "#3d2e12" },
        { x:  8.5, z: zOffset + 8,  w: 4.0, h: 5.5, hasDome: false, hasTower: true,  wallColor: "#2e2010" },
        { x: -8.2, z: zOffset + 14, w: 2.8, h: 3.8, hasDome: false, hasTower: false, wallColor: "#3a2c14" },
        { x:  7.9, z: zOffset + 18, w: 3.2, h: 4.2, hasDome: true,  hasTower: true,  wallColor: "#322412" },
        { x: -7.5, z: zOffset + 22, w: 4.5, h: 6.0, hasDome: true,  hasTower: false, wallColor: "#2c2010" },
      ],
      trees: [
        { x: -4.2, z: zOffset + 2,  type: "palm" as const },
        { x:  4.2, z: zOffset + 6,  type: "round" as const },
        { x: -4.2, z: zOffset + 11, type: "round" as const },
        { x:  4.2, z: zOffset + 15, type: "palm" as const },
        { x: -4.2, z: zOffset + 19, type: "round" as const },
        { x:  4.2, z: zOffset + 23, type: "palm" as const },
      ],
      stalls: Math.abs(Math.floor(zOffset)) % 3 === 0
        ? [{ x: -5.5, z: zOffset + 7 }, { x: -5.5, z: zOffset + 10 }]
        : Math.abs(Math.floor(zOffset)) % 3 === 1
          ? [{ x: 5.8, z: zOffset + 13 }]
          : [],
      lampposts: [
        { x: -3.85, z: zOffset + 4 },
        { x:  3.85, z: zOffset + 4 },
        { x: -3.85, z: zOffset + 14 },
        { x:  3.85, z: zOffset + 14 },
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
    <group ref={groupRef}>
      {segmentOffsets.map((offset) => (
        <RoadSegment key={offset} zOffset={offset} />
      ))}
    </group>
  );
}
