import { useMemo } from "react";

/* ── Étoiles ───────────────────────────────────────────────── */
function Stars() {
  const positions = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i < 500; i++) {
      const r = 100 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5;
      pts.push(
        r * Math.sin(phi) * Math.cos(theta),
        20 + r * Math.cos(phi),
        -60 + r * Math.sin(phi) * Math.sin(theta)
      );
    }
    return new Float32Array(pts);
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.4} color="#ffffff" sizeAttenuation transparent opacity={0.95} />
    </points>
  );
}

function Moon() {
  return (
    <group position={[25, 38, -90]}>
      <mesh>
        <sphereGeometry args={[4.2, 12, 12]} />
        <meshBasicMaterial color="#fffde7" />
      </mesh>
      <mesh>
        <sphereGeometry args={[5.8, 10, 10]} />
        <meshBasicMaterial color="#fff9c4" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

/* ── Silhouette ville lointaine ─────────────────────────────── */
function CitySkyline() {
  const buildings = useMemo(() => {
    const arr: { x: number; h: number; w: number; lit: boolean }[] = [];
    for (let i = 0; i < 18; i++) {
      arr.push({
        x: -45 + i * 5.2,
        h: 4 + Math.random() * 5,
        w: 3 + Math.random() * 2,
        lit: Math.random() > 0.4,
      });
    }
    return arr;
  }, []);
  return (
    <>
      {buildings.map((b, i) => (
        <group key={i}>
          <mesh position={[b.x, b.h / 2, -90]}>
            <boxGeometry args={[b.w, b.h, 4]} />
            <meshBasicMaterial color={b.lit ? "#8b6432" : "#3a2814"} />
          </mesh>
          {/* Fenêtre éclairée si lit */}
          {b.lit && (
            <mesh position={[b.x, b.h * 0.55, -87.95]}>
              <boxGeometry args={[b.w * 0.45, b.h * 0.18, 0.05]} />
              <meshBasicMaterial color="#ffb74d" toneMapped={false} />
            </mesh>
          )}
        </group>
      ))}
    </>
  );
}

export function Scene() {
  return (
    <>
      {/* Ciel nuit dégradé */}
      <mesh position={[0, 25, -100]}>
        <planeGeometry args={[400, 130]} />
        <meshBasicMaterial color="#1a1f3a" />
      </mesh>
      <mesh position={[0, 8, -100]}>
        <planeGeometry args={[400, 25]} />
        <meshBasicMaterial color="#2c1f3a" />
      </mesh>
      <mesh position={[0, 1, -100]}>
        <planeGeometry args={[400, 8]} />
        <meshBasicMaterial color="#5c2a0a" />
      </mesh>

      <Stars />
      <Moon />
      <CitySkyline />
    </>
  );
}
