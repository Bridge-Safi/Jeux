import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const TRACK_LENGTH = 80;
const TRACK_SEGMENTS = 4;
const SEG_LENGTH = TRACK_LENGTH / TRACK_SEGMENTS;

interface TrackProps {
  speed: number;
}

function ZelligeTile({ x, z, size = 1 }: { x: number; z: number; size?: number }) {
  const colors = useMemo(
    () => ["#1a6bb0", "#1e88e5", "#0d4f8b", "#2196f3", "#1565c0", "#ffffff", "#e3f2fd"],
    []
  );
  const color = useMemo(() => colors[Math.floor((Math.abs(x * 13 + z * 7)) % colors.length)], [x, z, colors]);

  return (
    <mesh position={[x, -0.05, z]} receiveShadow>
      <boxGeometry args={[size * 0.92, 0.08, size * 0.92]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
    </mesh>
  );
}

function TrackSegment({ zOffset }: { zOffset: number }) {
  const tiles = useMemo(() => {
    const t: JSX.Element[] = [];
    const tileSize = 1;
    for (let row = 0; row < SEG_LENGTH; row++) {
      for (let col = -3; col <= 3; col++) {
        t.push(
          <ZelligeTile
            key={`${row}-${col}`}
            x={col * tileSize}
            z={zOffset + row * tileSize}
            size={tileSize}
          />
        );
      }
    }
    return t;
  }, [zOffset]);

  return (
    <>
      {tiles}
      {/* Side walls / buildings */}
      <TrackWalls zOffset={zOffset} />
    </>
  );
}

function TrackWalls({ zOffset }: { zOffset: number }) {
  const wallData = useMemo(() => {
    const data: { key: string; x: number; z: number; w: number; h: number; color: string }[] = [];
    const numBuildings = Math.floor(SEG_LENGTH / 6);
    for (let i = 0; i < numBuildings; i++) {
      const z = zOffset + i * 6 + 3;
      const h = 3 + ((i * 7 + Math.abs(zOffset)) % 4);
      data.push({
        key: `L${i}`,
        x: -5.5,
        z,
        w: 2.0,
        h,
        color: ["#d4a96a", "#c9915e", "#bf8050", "#e8c4a0"][i % 4],
      });
      data.push({
        key: `R${i}`,
        x: 5.5,
        z,
        w: 2.0,
        h,
        color: ["#c8955a", "#d4a96a", "#bf8050", "#d9b480"][i % 4],
      });
    }
    return data;
  }, [zOffset]);

  return (
    <>
      {wallData.map(({ key, x, z, w, h, color }) => (
        <group key={key}>
          <mesh position={[x, h / 2, z]} castShadow receiveShadow>
            <boxGeometry args={[w, h, 4.5]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
          {/* Arch detail */}
          <mesh position={[x, h * 0.5 + 0.3, z]}>
            <torusGeometry args={[0.4, 0.08, 6, 16, Math.PI]} />
            <meshStandardMaterial color="#b87a40" roughness={0.7} />
          </mesh>
          {/* Window */}
          <mesh position={[x, h * 0.6, z]}>
            <boxGeometry args={[0.3, 0.45, 0.12]} />
            <meshStandardMaterial color="#87ceeb" metalness={0.5} />
          </mesh>
        </group>
      ))}
      {/* Left side floor border */}
      <mesh position={[-3.7, 0.05, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[0.4, 0.1, SEG_LENGTH]} />
        <meshStandardMaterial color="#b87a40" roughness={0.7} />
      </mesh>
      {/* Right side floor border */}
      <mesh position={[3.7, 0.05, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[0.4, 0.1, SEG_LENGTH]} />
        <meshStandardMaterial color="#b87a40" roughness={0.7} />
      </mesh>
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
        <TrackSegment key={offset} zOffset={offset} />
      ))}
    </group>
  );
}
