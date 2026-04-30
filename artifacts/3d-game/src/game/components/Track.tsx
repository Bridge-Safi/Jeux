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
      {/* Asphalt road base */}
      <mesh position={[0, -0.02, zOffset + SEG_LENGTH / 2]} receiveShadow>
        <boxGeometry args={[7, 0.04, SEG_LENGTH]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.95} />
      </mesh>

      {/* Left sidewalk */}
      <mesh position={[-4.8, 0.03, zOffset + SEG_LENGTH / 2]} receiveShadow>
        <boxGeometry args={[2.2, 0.06, SEG_LENGTH]} />
        <meshStandardMaterial color="#c8b89a" roughness={0.9} />
      </mesh>
      {/* Right sidewalk */}
      <mesh position={[4.8, 0.03, zOffset + SEG_LENGTH / 2]} receiveShadow>
        <boxGeometry args={[2.2, 0.06, SEG_LENGTH]} />
        <meshStandardMaterial color="#c8b89a" roughness={0.9} />
      </mesh>

      {/* Sidewalk edge stones left */}
      <mesh position={[-3.65, 0.05, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[0.15, 0.1, SEG_LENGTH]} />
        <meshStandardMaterial color="#a89070" roughness={0.85} />
      </mesh>
      {/* Sidewalk edge stones right */}
      <mesh position={[3.65, 0.05, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[0.15, 0.1, SEG_LENGTH]} />
        <meshStandardMaterial color="#a89070" roughness={0.85} />
      </mesh>

      {/* Lane dividers — dashed white lines left */}
      {Array.from({ length: dashCount }, (_, i) => (
        <mesh key={`ll${i}`} position={[-1.17, 0.01, zOffset + i * 4 + 1]} receiveShadow>
          <boxGeometry args={[0.1, 0.02, 2.2]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
      ))}
      {/* Lane dividers — dashed white lines right */}
      {Array.from({ length: dashCount }, (_, i) => (
        <mesh key={`rl${i}`} position={[1.17, 0.01, zOffset + i * 4 + 1]} receiveShadow>
          <boxGeometry args={[0.1, 0.02, 2.2]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
      ))}

      {/* Buildings & decorations along this segment */}
      <StreetDecorations zOffset={zOffset} />
    </group>
  );
}

function RoundTree({ x, z }: { x: number; z: number }) {
  const h = 1.4 + ((Math.abs(x * 3 + z * 7)) % 3) * 0.4;
  return (
    <group position={[x, 0, z]}>
      {/* Trunk */}
      <mesh position={[0, h * 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.13, h * 0.6, 6]} />
        <meshStandardMaterial color="#795548" roughness={0.95} />
      </mesh>
      {/* Foliage ball */}
      <mesh position={[0, h * 0.75, 0]} castShadow>
        <sphereGeometry args={[0.42, 8, 8]} />
        <meshStandardMaterial color="#388e3c" roughness={0.8} />
      </mesh>
      {/* Top highlight */}
      <mesh position={[0.1, h * 0.85, 0.1]} castShadow>
        <sphereGeometry args={[0.25, 6, 6]} />
        <meshStandardMaterial color="#43a047" roughness={0.7} />
      </mesh>
    </group>
  );
}

function CypressTree({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.4, 0]} castShadow>
        <coneGeometry args={[0.3, 2.8, 7]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 0.8, 6]} />
        <meshStandardMaterial color="#5d4037" roughness={0.95} />
      </mesh>
    </group>
  );
}

function MarketStall({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* Posts */}
      {[[-0.5, 0.5], [0.5, 0.5], [-0.5, -0.5], [0.5, -0.5]].map(([px, pz], i) => (
        <mesh key={i} position={[px as number, 0.6, pz as number]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.2, 6]} />
          <meshStandardMaterial color="#795548" roughness={0.9} />
        </mesh>
      ))}
      {/* Awning */}
      <mesh position={[0, 1.3, 0]} rotation={[0.12, 0, 0]} castShadow>
        <boxGeometry args={[1.3, 0.06, 1.3]} />
        <meshStandardMaterial color="#e57373" roughness={0.7} />
      </mesh>
      {/* Fringe */}
      {[-0.5, -0.25, 0, 0.25, 0.5].map((fx, i) => (
        <mesh key={i} position={[fx, 1.18, 0.63]} castShadow>
          <boxGeometry args={[0.12, 0.18, 0.04]} />
          <meshStandardMaterial color="#ef9a9a" roughness={0.7} />
        </mesh>
      ))}
      {/* Table */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.9, 0.06, 0.7]} />
        <meshStandardMaterial color="#bcaaa4" roughness={0.8} />
      </mesh>
    </group>
  );
}

function MoroccanBuilding({
  x, z, w, h, hasDome, hasTower, color
}: {
  x: number; z: number; w: number; h: number;
  hasDome?: boolean; hasTower?: boolean; color?: string;
}) {
  const wallColor = color ?? "#e8c097";
  const trimColor = "#d4a96a";

  return (
    <group position={[x, 0, z]}>
      {/* Main block */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, w * 0.85]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} />
      </mesh>

      {/* Crenellations (battlements) on top */}
      {Array.from({ length: Math.floor(w * 1.8) }, (_, i) => {
        const spacing = w / Math.max(1, Math.floor(w * 1.8) - 1);
        const bx = -w / 2 + i * spacing;
        return (
          <mesh key={i} position={[bx, h + 0.15, 0]} castShadow>
            <boxGeometry args={[0.22, 0.3, w * 0.87]} />
            <meshStandardMaterial color={trimColor} roughness={0.8} />
          </mesh>
        );
      })}

      {/* Arched windows row */}
      {Array.from({ length: Math.max(1, Math.floor(w / 1.2)) }, (_, i) => {
        const spacing = w / Math.max(1, Math.floor(w / 1.2));
        const wx = -w / 2 + i * spacing + spacing / 2;
        return (
          <group key={i}>
            <mesh position={[wx, h * 0.55, w * 0.43]}>
              <boxGeometry args={[0.28, 0.45, 0.08]} />
              <meshStandardMaterial color="#87ceeb" metalness={0.3} roughness={0.2} />
            </mesh>
            {/* Arch top */}
            <mesh position={[wx, h * 0.55 + 0.25, w * 0.43]}>
              <cylinderGeometry args={[0.14, 0.14, 0.08, 8, 1, false, 0, Math.PI]} />
              <meshStandardMaterial color="#87ceeb" metalness={0.3} />
            </mesh>
            {/* Arch frame */}
            <mesh position={[wx, h * 0.55 + 0.1, w * 0.435]}>
              <torusGeometry args={[0.16, 0.04, 6, 10, Math.PI]} />
              <meshStandardMaterial color={trimColor} roughness={0.6} />
            </mesh>
          </group>
        );
      })}

      {/* Blue dome */}
      {hasDome && (
        <group position={[0, h, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[w * 0.32, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            <meshStandardMaterial color="#1565c0" roughness={0.4} metalness={0.1} />
          </mesh>
          {/* Drum base */}
          <mesh position={[0, -0.18, 0]}>
            <cylinderGeometry args={[w * 0.3, w * 0.3, 0.36, 12]} />
            <meshStandardMaterial color={trimColor} roughness={0.6} />
          </mesh>
          {/* Finial */}
          <mesh position={[0, w * 0.35, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      )}

      {/* Tower */}
      {hasTower && (
        <group position={[w * 0.35, 0, 0]}>
          <mesh position={[0, h + 1.2, 0]} castShadow>
            <boxGeometry args={[0.9, 2.4, 0.9]} />
            <meshStandardMaterial color={wallColor} roughness={0.85} />
          </mesh>
          {/* Tower top crenellations */}
          {[[-0.3, -0.3], [-0.3, 0.3], [0.3, -0.3], [0.3, 0.3]].map(([tx, tz], i) => (
            <mesh key={i} position={[tx as number, h + 2.55, tz as number]} castShadow>
              <boxGeometry args={[0.28, 0.3, 0.28]} />
              <meshStandardMaterial color={trimColor} roughness={0.8} />
            </mesh>
          ))}
        </group>
      )}

      {/* Ground arch entrance */}
      <mesh position={[0, h * 0.22, w * 0.43]}>
        <boxGeometry args={[0.55, 0.85, 0.1]} />
        <meshStandardMaterial color="#b8860b" roughness={0.5} />
      </mesh>
      <mesh position={[0, h * 0.22 + 0.5, w * 0.43]}>
        <torusGeometry args={[0.28, 0.07, 6, 10, Math.PI]} />
        <meshStandardMaterial color={trimColor} roughness={0.5} />
      </mesh>
    </group>
  );
}

function StreetDecorations({ zOffset }: { zOffset: number }) {
  const data = useMemo(() => {
    const idx = Math.abs(Math.floor(zOffset)) % 400;
    return {
      buildings: [
        { x: -7.5, z: zOffset + 4, w: 3.5, h: 4.5, hasDome: true, hasTower: false, color: "#e8c097" },
        { x: 8.2, z: zOffset + 8, w: 4.0, h: 5.5, hasDome: false, hasTower: true, color: "#ddb880" },
        { x: -8.0, z: zOffset + 14, w: 2.8, h: 3.8, hasDome: false, hasTower: false, color: "#f0d0a0" },
        { x: 7.6, z: zOffset + 18, w: 3.2, h: 4.2, hasDome: true, hasTower: true, color: "#e0bb88" },
        { x: -7.2, z: zOffset + 22, w: 4.5, h: 6.0, hasDome: true, hasTower: false, color: "#d8b07a" },
      ],
      trees: [
        { x: -4.3, z: zOffset + 3, type: "round" as const },
        { x: 4.3, z: zOffset + 6, type: "cypress" as const },
        { x: -4.3, z: zOffset + 10, type: "round" as const },
        { x: 4.3, z: zOffset + 14, type: "round" as const },
        { x: -4.3, z: zOffset + 18, type: "cypress" as const },
        { x: 4.3, z: zOffset + 22, type: "round" as const },
      ],
      stalls: idx % 3 === 0
        ? [{ x: -5.2, z: zOffset + 7 }, { x: -5.2, z: zOffset + 9.5 }]
        : idx % 3 === 1
          ? [{ x: 5.5, z: zOffset + 12 }]
          : [],
      lampposts: [
        { x: -3.85, z: zOffset + 5 },
        { x: 3.85, z: zOffset + 5 },
        { x: -3.85, z: zOffset + 15 },
        { x: 3.85, z: zOffset + 15 },
      ],
    };
  }, [zOffset]);

  return (
    <>
      {data.buildings.map((b, i) => (
        <MoroccanBuilding key={i} {...b} />
      ))}
      {data.trees.map((t, i) =>
        t.type === "round"
          ? <RoundTree key={i} x={t.x} z={t.z} />
          : <CypressTree key={i} x={t.x} z={t.z} />
      )}
      {data.stalls.map((s, i) => (
        <MarketStall key={i} x={s.x} z={s.z} />
      ))}
      {data.lampposts.map((lp, i) => (
        <group key={i} position={[lp.x, 0, lp.z]}>
          <mesh position={[0, 1.6, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.06, 3.2, 6]} />
            <meshStandardMaterial color="#607d8b" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, 3.3, 0]}>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshStandardMaterial color="#fff9c4" emissive="#fff176" emissiveIntensity={0.5} />
          </mesh>
          <pointLight position={[lp.x, 3.2, lp.z]} intensity={0.6} color="#fff9c4" distance={8} />
        </group>
      ))}
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
