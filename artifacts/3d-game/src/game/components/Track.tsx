import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

const TRACK_LENGTH = 100;
const TRACK_SEGMENTS = 4;
const SEG_LENGTH = TRACK_LENGTH / TRACK_SEGMENTS;

interface TrackProps {
  speed: number;
}

/* ── Sol GPS satellite Safi ────────────────────────────────── */
function SafiGroundMap({ speed }: { speed: number }) {
  const sat = useLoader(THREE.TextureLoader, `${import.meta.env.BASE_URL}safi-satellite.png`);

  useMemo(() => {
    sat.wrapS = THREE.RepeatWrapping;
    sat.wrapT = THREE.RepeatWrapping;
    sat.repeat.set(1.2, 5);
    sat.minFilter = THREE.LinearFilter;
    sat.magFilter = THREE.LinearFilter;
    // @ts-ignore
    sat.colorSpace = THREE.SRGBColorSpace ?? sat.colorSpace;
  }, [sat]);

  useFrame((_, delta) => {
    sat.offset.y -= speed * delta * 0.012;
  });

  return (
    <mesh position={[0, -0.05, -50]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[60, 220]} />
      <meshBasicMaterial map={sat} color="#5a7298" toneMapped={false} />
    </mesh>
  );
}

/* ── Maison médina de Safi (sandstone, fenêtres, porte) ───── */
function MedinaHouse({
  x, z, w, h, d, wallColor, hasArch, hasShop, shopColor,
}: {
  x: number; z: number; w: number; h: number; d: number;
  wallColor: string; hasArch?: boolean; hasShop?: boolean; shopColor?: string;
}) {
  const trimColor = "#ffd54f";
  const isLeft = x < 0;
  const facadeZ = d / 2 * (isLeft ? 1 : -1) * 0 + 0; // façade vers la route
  const facadeNormalX = isLeft ? 1 : -1; // direction normale vers la route

  return (
    <group position={[x, 0, z]}>
      {/* Corps de la maison */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshBasicMaterial color={wallColor} />
      </mesh>

      {/* Toit terrasse plate avec petit muret */}
      <mesh position={[0, h + 0.1, 0]}>
        <boxGeometry args={[w + 0.05, 0.2, d + 0.05]} />
        <meshBasicMaterial color="#6d4c2f" />
      </mesh>

      {/* Bandeau bleu majorelle en haut (signature Safi) */}
      <mesh position={[w / 2 * facadeNormalX * 0.99, h - 0.15, 0]}>
        <boxGeometry args={[0.06, 0.25, d * 0.92]} />
        <meshBasicMaterial color="#1565c0" toneMapped={false} />
      </mesh>

      {/* Fenêtres éclairées rectangulaires sur la façade vers la route */}
      {Array.from({ length: Math.max(1, Math.floor(h / 1.2)) }, (_, row) => {
        const ny = (row + 1) * (h / (Math.floor(h / 1.2) + 1));
        return Array.from({ length: 2 }, (_, col) => {
          const nz = -d * 0.25 + col * d * 0.5;
          const lit = (row + col) % 2 === 0;
          return (
            <group key={`w${row}-${col}`}>
              {/* Cadre fenêtre */}
              <mesh position={[w / 2 * facadeNormalX * 0.99, ny, nz]}>
                <boxGeometry args={[0.06, 0.55, 0.35]} />
                <meshBasicMaterial color={trimColor} />
              </mesh>
              {/* Vitre */}
              <mesh position={[w / 2 * facadeNormalX * 1.005, ny, nz]}>
                <boxGeometry args={[0.02, 0.42, 0.26]} />
                <meshBasicMaterial color={lit ? "#ffca28" : "#1a1f3a"} toneMapped={false} />
              </mesh>
              {/* Volet bleu si éclairée */}
              {lit && (
                <mesh position={[w / 2 * facadeNormalX * 1.01, ny, nz]}>
                  <boxGeometry args={[0.01, 0.42, 0.04]} />
                  <meshBasicMaterial color="#0d47a1" />
                </mesh>
              )}
            </group>
          );
        });
      })}

      {/* Porte en bois avec arche */}
      <mesh position={[w / 2 * facadeNormalX * 0.99, 0.7, 0]}>
        <boxGeometry args={[0.06, 1.4, 0.55]} />
        <meshBasicMaterial color="#3d2510" />
      </mesh>
      {hasArch && (
        <mesh position={[w / 2 * facadeNormalX * 0.99, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.28, 0.05, 4, 8, Math.PI]} />
          <meshBasicMaterial color={trimColor} />
        </mesh>
      )}

      {/* Décoration arabesque dorée au-dessus de la porte */}
      <mesh position={[w / 2 * facadeNormalX * 1.0, 1.55, 0]}>
        <boxGeometry args={[0.02, 0.08, 0.6]} />
        <meshBasicMaterial color={trimColor} />
      </mesh>

      {/* Devanture boutique au rez-de-chaussée */}
      {hasShop && (
        <>
          <mesh position={[w / 2 * facadeNormalX * 0.98, 0.8, d * 0.3]}>
            <boxGeometry args={[0.08, 1.6, 0.7]} />
            <meshBasicMaterial color={shopColor ?? "#c62828"} toneMapped={false} />
          </mesh>
          {/* Auvent boutique */}
          <mesh position={[w / 2 * facadeNormalX * 1.05, 1.7, d * 0.3]} rotation={[0, 0, isLeft ? -0.2 : 0.2]}>
            <boxGeometry args={[0.5, 0.05, 0.85]} />
            <meshBasicMaterial color={shopColor ?? "#c62828"} toneMapped={false} />
          </mesh>
        </>
      )}
    </group>
  );
}

/* ── Lampadaire arabesque ──────────────────────────────────── */
function MedinaLamp({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.05, 0.09, 3.6, 6]} />
        <meshBasicMaterial color="#3e2723" />
      </mesh>
      {/* Lanterne marocaine étoilée */}
      <mesh position={[0, 3.7, 0]}>
        <octahedronGeometry args={[0.32, 0]} />
        <meshBasicMaterial color="#ffeb3b" toneMapped={false} />
      </mesh>
      {/* Halo lumineux */}
      <mesh position={[0, 3.7, 0]}>
        <sphereGeometry args={[0.55, 8, 8]} />
        <meshBasicMaterial color="#ff8f00" transparent opacity={0.4} toneMapped={false} />
      </mesh>
      <mesh position={[0, 3.7, 0]}>
        <sphereGeometry args={[0.85, 8, 8]} />
        <meshBasicMaterial color="#ffa726" transparent opacity={0.18} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ── Arche traditionnelle au-dessus de la rue ─────────────── */
function StreetArch({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
      {/* Pilier gauche */}
      <mesh position={[-3.5, 2.5, 0]}>
        <boxGeometry args={[0.6, 5, 0.6]} />
        <meshBasicMaterial color="#a8782a" />
      </mesh>
      {/* Pilier droit */}
      <mesh position={[3.5, 2.5, 0]}>
        <boxGeometry args={[0.6, 5, 0.6]} />
        <meshBasicMaterial color="#a8782a" />
      </mesh>
      {/* Arche en haut */}
      <mesh position={[0, 5.5, 0]}>
        <boxGeometry args={[7.6, 0.6, 0.7]} />
        <meshBasicMaterial color="#c9923a" />
      </mesh>
      {/* Décoration zellige bleue sur l'arche */}
      <mesh position={[0, 5.5, 0.36]}>
        <boxGeometry args={[6.5, 0.4, 0.05]} />
        <meshBasicMaterial color="#1565c0" toneMapped={false} />
      </mesh>
      {/* Lanterne suspendue centrale */}
      <mesh position={[0, 4.6, 0]}>
        <octahedronGeometry args={[0.35, 0]} />
        <meshBasicMaterial color="#ffeb3b" toneMapped={false} />
      </mesh>
      <mesh position={[0, 4.6, 0]}>
        <sphereGeometry args={[0.7, 8, 8]} />
        <meshBasicMaterial color="#ff8f00" transparent opacity={0.35} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ── Palmier dattier ──────────────────────────────────────── */
function PalmTree({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.1, 0.16, 5.0, 6]} />
        <meshBasicMaterial color="#5d4037" />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <group key={i} position={[0, 5.0, 0]} rotation={[0.4, (i / 6) * Math.PI * 2, 0]}>
          <mesh position={[0.9, 0, 0]}>
            <boxGeometry args={[1.8, 0.04, 0.45]} />
            <meshBasicMaterial color="#388e3c" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 4.8, 0]}>
        <sphereGeometry args={[0.22, 6, 6]} />
        <meshBasicMaterial color="#ff6f00" />
      </mesh>
    </group>
  );
}

/* ── Bande "route" + lignes au sol ────────────────────────── */
function RoadStripe({ zOffset }: { zOffset: number }) {
  const dashCount = Math.floor(SEG_LENGTH / 4);

  return (
    <group>
      {/* Bande sombre semi-transparente — style chemin éclairé */}
      <mesh position={[0, -0.03, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[6.5, 0.02, SEG_LENGTH]} />
        <meshBasicMaterial color="#1a1409" transparent opacity={0.55} />
      </mesh>

      {/* Bordures cyan style GPS */}
      <mesh position={[-3.2, 0.005, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[0.14, 0.04, SEG_LENGTH]} />
        <meshBasicMaterial color="#00e5ff" toneMapped={false} />
      </mesh>
      <mesh position={[3.2, 0.005, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[0.14, 0.04, SEG_LENGTH]} />
        <meshBasicMaterial color="#00e5ff" toneMapped={false} />
      </mesh>

      {/* Halo glow */}
      <mesh position={[-3.2, 0.001, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[0.5, 0.01, SEG_LENGTH]} />
        <meshBasicMaterial color="#00bcd4" transparent opacity={0.3} toneMapped={false} />
      </mesh>
      <mesh position={[3.2, 0.001, zOffset + SEG_LENGTH / 2]}>
        <boxGeometry args={[0.5, 0.01, SEG_LENGTH]} />
        <meshBasicMaterial color="#00bcd4" transparent opacity={0.3} toneMapped={false} />
      </mesh>

      {/* Chevrons GPS jaunes */}
      {Array.from({ length: dashCount }, (_, i) => (
        <group key={`arrow${i}`} position={[0, 0.012, zOffset + i * 4 + 1]}>
          <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
            <planeGeometry args={[0.5, 0.15]} />
            <meshBasicMaterial color="#ffeb3b" toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 4]}>
            <planeGeometry args={[0.5, 0.15]} />
            <meshBasicMaterial color="#ffeb3b" toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Lignes de voie blanches pointillées */}
      {Array.from({ length: dashCount }, (_, i) => (
        <mesh key={`ll${i}`} position={[-1.0, 0.01, zOffset + i * 4 + 1]}>
          <boxGeometry args={[0.08, 0.02, 1.8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      {Array.from({ length: dashCount }, (_, i) => (
        <mesh key={`rl${i}`} position={[1.0, 0.01, zOffset + i * 4 + 1]}>
          <boxGeometry args={[0.08, 0.02, 1.8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
}

/* ── Bâtiments médina + déco par segment ──────────────────── */
function StreetBuildings({ zOffset, segIdx }: { zOffset: number; segIdx: number }) {
  /* Variation par segment pour éviter répétition visible */
  const data = useMemo(() => {
    const colorPalette = ["#c9923a", "#d4a04d", "#b8821f", "#e0b367", "#a87529", "#cf9a3f"];
    const shopColors = ["#c62828", "#1976d2", "#388e3c", "#f57c00", "#7b1fa2"];

    /* 6 maisons à gauche, 6 à droite, espacement régulier de SEG_LENGTH/6 */
    const houses: any[] = [];
    const spacing = SEG_LENGTH / 6;
    for (let i = 0; i < 6; i++) {
      const baseZ = zOffset + i * spacing + spacing / 2;
      const seed = (segIdx * 100 + i) * 1.7;

      // Gauche
      houses.push({
        side: -1,
        x: -5.2 - ((seed * 0.31) % 0.7),
        z: baseZ,
        w: 2.8 + ((seed * 0.13) % 1.4),
        h: 3.5 + ((seed * 0.27) % 4.5),
        d: spacing * (0.85 + ((seed * 0.07) % 0.15)),
        wallColor: colorPalette[Math.floor(seed) % colorPalette.length],
        hasArch: i % 2 === 0,
        hasShop: i % 3 === 0,
        shopColor: shopColors[Math.floor(seed * 0.41) % shopColors.length],
      });

      // Droite
      houses.push({
        side: 1,
        x: 5.2 + ((seed * 0.43) % 0.7),
        z: baseZ + spacing * 0.4, // décalage léger côté droit
        w: 2.8 + ((seed * 0.19) % 1.4),
        h: 3.5 + ((seed * 0.31) % 4.5),
        d: spacing * (0.85 + ((seed * 0.11) % 0.15)),
        wallColor: colorPalette[Math.floor(seed * 1.7) % colorPalette.length],
        hasArch: i % 2 === 1,
        hasShop: i % 4 === 0,
        shopColor: shopColors[Math.floor(seed * 0.71) % shopColors.length],
      });
    }

    /* Lampadaires entre les maisons */
    const lamps = [
      { x: -3.7, z: zOffset + 4 },
      { x:  3.7, z: zOffset + 4 },
      { x: -3.7, z: zOffset + 13 },
      { x:  3.7, z: zOffset + 13 },
      { x: -3.7, z: zOffset + 22 },
      { x:  3.7, z: zOffset + 22 },
    ];

    /* Palmiers occasionnels */
    const palms = [
      { x: -4.5, z: zOffset + 8 },
      { x:  4.5, z: zOffset + 18 },
    ];

    /* Arche tous les 2 segments */
    const arches = segIdx % 2 === 0 ? [{ z: zOffset + SEG_LENGTH / 2 }] : [];

    return { houses, lamps, palms, arches };
  }, [zOffset, segIdx]);

  return (
    <>
      {data.houses.map((h, i) => <MedinaHouse key={i} {...h} />)}
      {data.lamps.map((l, i) => <MedinaLamp key={`lp${i}`} x={l.x} z={l.z} />)}
      {data.palms.map((p, i) => <PalmTree key={`pl${i}`} x={p.x} z={p.z} />)}
      {data.arches.map((a, i) => <StreetArch key={`ar${i}`} z={a.z} />)}
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
      <SafiGroundMap speed={speed} />

      <group ref={groupRef}>
        {segmentOffsets.map((offset, idx) => (
          <group key={offset}>
            <RoadStripe zOffset={offset} />
            <StreetBuildings zOffset={offset} segIdx={idx} />
          </group>
        ))}
      </group>
    </>
  );
}
