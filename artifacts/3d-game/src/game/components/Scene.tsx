import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   CIEL CYBERPUNK — Dégradé multicouches façon NFS Heat
   ───────────────────────────────────────────────────────────── */
function CyberSky() {
  return (
    <>
      {/* Voûte céleste : violet profond tout en haut */}
      <mesh position={[0, 60, -120]}>
        <planeGeometry args={[500, 80]} />
        <meshBasicMaterial color="#0a0822" toneMapped={false} />
      </mesh>
      {/* Couche violet électrique */}
      <mesh position={[0, 30, -120]}>
        <planeGeometry args={[500, 30]} />
        <meshBasicMaterial color="#2a0e4a" toneMapped={false} />
      </mesh>
      {/* Magenta hot pink */}
      <mesh position={[0, 16, -119]}>
        <planeGeometry args={[500, 16]} />
        <meshBasicMaterial color="#7a1a6c" toneMapped={false} transparent opacity={0.95} />
      </mesh>
      {/* Orange/rose chaud près de l'horizon */}
      <mesh position={[0, 7, -118]}>
        <planeGeometry args={[500, 12]} />
        <meshBasicMaterial color="#ff3d7e" toneMapped={false} transparent opacity={0.92} />
      </mesh>
      {/* Lueur orange juste sur l'horizon */}
      <mesh position={[0, 1.5, -117]}>
        <planeGeometry args={[500, 5]} />
        <meshBasicMaterial color="#ff7e1a" toneMapped={false} transparent opacity={0.85} />
      </mesh>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   ÉTOILES + nuages volumétriques
   ───────────────────────────────────────────────────────────── */
function Stars() {
  const positions = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i < 700; i++) {
      const r = 110 + Math.random() * 40;
      const theta = (Math.random() - 0.5) * Math.PI;
      const phi = Math.random() * Math.PI * 0.45;
      pts.push(
        r * Math.sin(phi) * Math.cos(theta),
        25 + r * Math.cos(phi),
        -80 + r * Math.sin(phi) * Math.sin(theta)
      );
    }
    return new Float32Array(pts);
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.35} color="#ffffff" sizeAttenuation transparent opacity={0.95} toneMapped={false} />
    </points>
  );
}

/* ─────────────────────────────────────────────────────────────
   LUNE — multi-halo cinématique
   ───────────────────────────────────────────────────────────── */
function Moon() {
  return (
    <group position={[18, 35, -95]}>
      {/* Halo extérieur très large */}
      <mesh>
        <circleGeometry args={[14, 32]} />
        <meshBasicMaterial color="#ff8060" transparent opacity={0.08} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh>
        <circleGeometry args={[10, 32]} />
        <meshBasicMaterial color="#ffaa70" transparent opacity={0.18} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh>
        <circleGeometry args={[7, 32]} />
        <meshBasicMaterial color="#ffd07a" transparent opacity={0.32} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {/* Disque lune solide */}
      <mesh>
        <circleGeometry args={[4.2, 32]} />
        <meshBasicMaterial color="#fff5d8" toneMapped={false} />
      </mesh>
      {/* Crater détails */}
      <mesh position={[-1.3, 0.8, 0.01]}>
        <circleGeometry args={[0.4, 12]} />
        <meshBasicMaterial color="#e8d8b0" toneMapped={false} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0.9, -0.6, 0.01]}>
        <circleGeometry args={[0.55, 12]} />
        <meshBasicMaterial color="#e8d8b0" toneMapped={false} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   MONTAGNES DE L'ATLAS — silhouette lointaine
   ───────────────────────────────────────────────────────────── */
function MountainSilhouette() {
  const peaks = useMemo(() => {
    const arr: { x: number; h: number; w: number }[] = [];
    for (let i = 0; i < 14; i++) {
      arr.push({
        x: -65 + i * 10,
        h: 6 + Math.random() * 10,
        w: 9 + Math.random() * 5,
      });
    }
    return arr;
  }, []);
  return (
    <>
      {peaks.map((p, i) => (
        <mesh key={i} position={[p.x, p.h / 2, -85]} rotation={[0, 0, Math.PI / 4]}>
          <planeGeometry args={[p.w, p.h]} />
          <meshBasicMaterial color="#1a0828" toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   GRATTE-CIELS CYBERPUNK — fenêtres néon
   ───────────────────────────────────────────────────────────── */
function CyberSkyline() {
  const buildings = useMemo(() => {
    const arr: { x: number; h: number; w: number; color: string; windowsCol: string }[] = [];
    const palette = [
      { c: "#0a0a18", w: "#00f0ff" },   // tour à fenêtres cyan
      { c: "#0a0a18", w: "#ff1493" },   // tour à fenêtres magenta
      { c: "#1a0a28", w: "#ffeb3b" },   // tour à fenêtres jaunes
      { c: "#0a0814", w: "#39ff14" },   // tour à fenêtres lime
      { c: "#1a0822", w: "#ff6b00" },   // tour à fenêtres orange
    ];
    for (let i = 0; i < 22; i++) {
      const p = palette[Math.floor(Math.random() * palette.length)];
      arr.push({
        x: -55 + i * 5.2,
        h: 8 + Math.random() * 18,
        w: 3.2 + Math.random() * 2.2,
        color: p.c,
        windowsCol: p.w,
      });
    }
    return arr;
  }, []);

  return (
    <>
      {buildings.map((b, i) => {
        const rows = Math.floor(b.h * 0.8);
        const cols = Math.max(2, Math.floor(b.w * 1.2));
        const windows: { x: number; y: number; lit: boolean }[] = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            windows.push({
              x: -b.w * 0.4 + c * (b.w * 0.8 / Math.max(1, cols - 1)),
              y: 1 + r * (b.h * 0.85 / rows),
              lit: Math.random() > 0.35,
            });
          }
        }
        return (
          <group key={i} position={[b.x, 0, -78]}>
            {/* Corps tour */}
            <mesh position={[0, b.h / 2, 0]}>
              <boxGeometry args={[b.w, b.h, 3.5]} />
              <meshBasicMaterial color={b.color} toneMapped={false} />
            </mesh>
            {/* Antenne lumineuse au sommet */}
            {b.h > 14 && (
              <>
                <mesh position={[0, b.h + 1.5, 0]}>
                  <boxGeometry args={[0.1, 3, 0.1]} />
                  <meshBasicMaterial color="#ff1744" toneMapped={false} />
                </mesh>
                <mesh position={[0, b.h + 3, 0]}>
                  <sphereGeometry args={[0.25, 6, 6]} />
                  <meshBasicMaterial color="#ff1744" toneMapped={false} />
                </mesh>
              </>
            )}
            {/* Fenêtres allumées */}
            {windows.filter((w) => w.lit).map((w, j) => (
              <mesh key={j} position={[w.x, w.y, 1.78]}>
                <boxGeometry args={[0.18, 0.32, 0.05]} />
                <meshBasicMaterial color={b.windowsCol} toneMapped={false} />
              </mesh>
            ))}
            {/* Halo global de la tour */}
            <mesh position={[0, b.h / 2, 1.85]}>
              <planeGeometry args={[b.w * 1.4, b.h * 1.05]} />
              <meshBasicMaterial color={b.windowsCol} transparent opacity={0.06} blending={THREE.AdditiveBlending} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   PANNEAU HOLO FLOTTANT — texte néon publicitaire
   ───────────────────────────────────────────────────────────── */
function HoloBillboard() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) {
      const t = Date.now() * 0.001;
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.55 + Math.sin(t * 2) * 0.15;
    }
  });

  return (
    <group position={[-30, 22, -82]}>
      <mesh ref={ref}>
        <planeGeometry args={[12, 6]} />
        <meshBasicMaterial color="#ff1493" transparent opacity={0.6} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Lettre "S" stylisée géante */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[8, 4]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.4} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function Scene() {
  return (
    <>
      <CyberSky />
      <MountainSilhouette />
      <Stars />
      <Moon />
      <CyberSkyline />
      <HoloBillboard />
    </>
  );
}
