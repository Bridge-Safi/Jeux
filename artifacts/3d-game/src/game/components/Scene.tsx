import { useMemo } from "react";
import * as THREE from "three";

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

/* ── Rempart Safi avec créneaux ────────────────────────────── */
function SafiRampart({ x, z, w, h, lit }: { x: number; z: number; w: number; h: number; lit: boolean }) {
  const wallColor = lit ? "#c9923a" : "#8b6432"; // sandstone chaud illuminé / non
  const shadowColor = "#5d4520";
  const merlonColor = lit ? "#a8782a" : "#6e4f1f";

  const merlonCount = Math.max(3, Math.floor(w / 0.7));
  const merlonW = w / merlonCount;

  return (
    <group position={[x, 0, z]}>
      {/* Mur principal sandstone */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, 1.5]} />
        <meshBasicMaterial color={wallColor} />
      </mesh>
      {/* Bande d'ombre haute */}
      <mesh position={[0, h - 0.3, 0.78]}>
        <boxGeometry args={[w, 0.2, 0.04]} />
        <meshBasicMaterial color={shadowColor} />
      </mesh>
      {/* Créneaux (merlons) sur le dessus */}
      {Array.from({ length: Math.floor(merlonCount / 2) }, (_, i) => (
        <mesh key={i} position={[-w / 2 + (i * 2 + 0.5) * merlonW, h + 0.4, 0]}>
          <boxGeometry args={[merlonW * 0.85, 0.8, 1.6]} />
          <meshBasicMaterial color={merlonColor} />
        </mesh>
      ))}
      {/* Petites fenêtres-meurtrières éclairées */}
      {lit && Array.from({ length: Math.max(2, Math.floor(w / 1.4)) }, (_, i) => {
        const spacing = w / Math.max(2, Math.floor(w / 1.4));
        const wx = -w / 2 + spacing * 0.5 + i * spacing;
        return (
          <mesh key={i} position={[wx, h * 0.6, 0.78]}>
            <boxGeometry args={[0.16, 0.5, 0.05]} />
            <meshBasicMaterial color="#ffb74d" />
          </mesh>
        );
      })}
      {/* Rangées de pierres horizontales */}
      {Array.from({ length: Math.max(2, Math.floor(h / 1.5)) }, (_, i) => (
        <mesh key={`r${i}`} position={[0, (i + 1) * (h / Math.max(2, Math.floor(h / 1.5))), 0.78]}>
          <boxGeometry args={[w, 0.05, 0.04]} />
          <meshBasicMaterial color={shadowColor} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Tour de garde Safi ────────────────────────────────────── */
function SafiTower({ x, z, h }: { x: number; z: number; h: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* Corps tour */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[2.4, h, 2.4]} />
        <meshBasicMaterial color="#c9923a" />
      </mesh>
      {/* Bande sombre haute */}
      <mesh position={[0, h - 0.5, 0]}>
        <boxGeometry args={[2.5, 0.25, 2.5]} />
        <meshBasicMaterial color="#5d4520" />
      </mesh>
      {/* Créneaux carrés */}
      {([[-0.85, -0.85], [0.85, -0.85], [-0.85, 0.85], [0.85, 0.85], [0, -0.85], [0, 0.85], [-0.85, 0], [0.85, 0]] as [number,number][]).map(([cx, cz], i) => (
        <mesh key={i} position={[cx, h + 0.4, cz]}>
          <boxGeometry args={[0.55, 0.8, 0.55]} />
          <meshBasicMaterial color="#a8782a" />
        </mesh>
      ))}
      {/* Fenêtres éclairées sur tour */}
      {([0, h * 0.4, h * 0.7] as number[]).map((wy, i) => (
        <mesh key={i} position={[0, wy + h * 0.15, 1.21]}>
          <boxGeometry args={[0.25, 0.55, 0.05]} />
          <meshBasicMaterial color={i === 1 ? "#ffb74d" : "#ff8f00"} />
        </mesh>
      ))}
      {/* Lanterne au sommet — point lumineux jaune chaud */}
      <mesh position={[0, h + 1.2, 0]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshBasicMaterial color="#ffeb3b" />
      </mesh>
      <mesh position={[0, h + 1.2, 0]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshBasicMaterial color="#ff8f00" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

/* ── Mosquée avec dôme ─────────────────────────────────────── */
function SafiMosque({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* Corps mosquée */}
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[5, 6, 5]} />
        <meshBasicMaterial color="#c9923a" />
      </mesh>
      {/* Dôme bleu turquoise */}
      <mesh position={[0, 6, 0]}>
        <sphereGeometry args={[2, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshBasicMaterial color="#1976d2" />
      </mesh>
      {/* Anneau or sous le dôme */}
      <mesh position={[0, 6.05, 0]}>
        <cylinderGeometry args={[2.05, 2.05, 0.25, 14]} />
        <meshBasicMaterial color="#ffc107" />
      </mesh>
      {/* Pinacle doré */}
      <mesh position={[0, 8.5, 0]}>
        <coneGeometry args={[0.18, 0.6, 6]} />
        <meshBasicMaterial color="#ffd54f" />
      </mesh>
      <mesh position={[0, 8.95, 0]}>
        <sphereGeometry args={[0.13, 8, 8]} />
        <meshBasicMaterial color="#ffd54f" />
      </mesh>
      {/* Minaret accolé */}
      <mesh position={[3.2, 5, 0]}>
        <boxGeometry args={[1.4, 10, 1.4]} />
        <meshBasicMaterial color="#c9923a" />
      </mesh>
      <mesh position={[3.2, 10.4, 0]}>
        <sphereGeometry args={[0.7, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshBasicMaterial color="#1976d2" />
      </mesh>
      {/* Fenêtres éclairées */}
      {([0, 1, 2] as number[]).map((i) => (
        <mesh key={i} position={[-1.2 + i * 1.2, 3.5, 2.55]}>
          <boxGeometry args={[0.5, 1.2, 0.06]} />
          <meshBasicMaterial color="#ffb74d" />
        </mesh>
      ))}
      {/* Porte arche */}
      <mesh position={[0, 1.2, 2.55]}>
        <boxGeometry args={[1.3, 2.4, 0.08]} />
        <meshBasicMaterial color="#3d2510" />
      </mesh>
    </group>
  );
}

export function Scene() {
  return (
    <>
      {/* Ciel nuit dégradé */}
      <mesh position={[0, 25, -100]}>
        <planeGeometry args={[400, 130]} />
        <meshBasicMaterial color="#1a1f3a" side={THREE.FrontSide} />
      </mesh>
      <mesh position={[0, 8, -100]}>
        <planeGeometry args={[400, 25]} />
        <meshBasicMaterial color="#2c1f3a" side={THREE.FrontSide} />
      </mesh>
      {/* Horizon orangé chaud — lumières médina */}
      <mesh position={[0, 1, -100]}>
        <planeGeometry args={[400, 8]} />
        <meshBasicMaterial color="#5c2a0a" side={THREE.FrontSide} />
      </mesh>

      {/* Sol au-delà de la route — sable sombre */}
      <mesh position={[0, -0.05, -50]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[140, 200]} />
        <meshBasicMaterial color="#2a1f10" />
      </mesh>

      <Stars />
      <Moon />

      {/* === REMPARTS DE LA MÉDINA DE SAFI === */}
      {/* Mur fortifié à gauche — proche route */}
      <SafiRampart x={-12} z={-25} w={10} h={6}  lit />
      <SafiRampart x={-12} z={-45} w={10} h={5.5} lit />
      <SafiRampart x={-12} z={-65} w={10} h={6.5} lit={false} />

      {/* Mur fortifié à droite */}
      <SafiRampart x={12}  z={-30} w={10} h={6}  lit />
      <SafiRampart x={12}  z={-50} w={10} h={5.8} lit />
      <SafiRampart x={12}  z={-70} w={10} h={5.5} lit={false} />

      {/* === TOURS DE GARDE === */}
      <SafiTower x={-7.5} z={-20} h={9} />
      <SafiTower x={7.5}  z={-20} h={9} />
      <SafiTower x={-7.5} z={-50} h={10} />
      <SafiTower x={7.5}  z={-50} h={8.5} />
      <SafiTower x={-7.5} z={-80} h={9} />
      <SafiTower x={7.5}  z={-80} h={9} />

      {/* === GRANDES MOSQUÉES === */}
      <SafiMosque x={-22} z={-65} />
      <SafiMosque x={22}  z={-75} />
      <SafiMosque x={0}   z={-95} />

      {/* Bâtiments lointains derrière — silhouette ville */}
      {([-35, -28, -22, -16, 16, 22, 28, 35] as number[]).map((bx, i) => (
        <mesh key={i} position={[bx, (3 + (i % 3)) / 2, -100]}>
          <boxGeometry args={[5, 3 + (i % 3), 4]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#5d4020" : "#4a3415"} />
        </mesh>
      ))}
    </>
  );
}
