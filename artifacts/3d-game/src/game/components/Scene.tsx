import * as THREE from "three";

function CloudPuff({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh>
        <sphereGeometry args={[1.2, 8, 6]} />
        <meshStandardMaterial color="white" roughness={1} />
      </mesh>
      <mesh position={[1.2, -0.2, 0]}>
        <sphereGeometry args={[0.9, 8, 6]} />
        <meshStandardMaterial color="white" roughness={1} />
      </mesh>
      <mesh position={[-1.1, -0.2, 0]}>
        <sphereGeometry args={[0.85, 8, 6]} />
        <meshStandardMaterial color="white" roughness={1} />
      </mesh>
      <mesh position={[0.3, 0.4, 0]}>
        <sphereGeometry args={[0.7, 8, 6]} />
        <meshStandardMaterial color="white" roughness={1} />
      </mesh>
    </group>
  );
}

function DistantCity() {
  const buildings = [
    { x: -22, z: -70, w: 5, h: 7, dome: true },
    { x: -14, z: -80, w: 4, h: 5.5, dome: false },
    { x: -28, z: -65, w: 6, h: 6, dome: false },
    { x: 18, z: -75, w: 5, h: 8, dome: true },
    { x: 25, z: -68, w: 4, h: 5, dome: false },
    { x: 12, z: -85, w: 3.5, h: 6.5, dome: true },
    { x: -6, z: -90, w: 6, h: 5, dome: false },
    { x: 5, z: -78, w: 3, h: 7, dome: false },
    { x: -18, z: -95, w: 5, h: 4.5, dome: true },
    { x: 30, z: -85, w: 4, h: 6, dome: false },
  ];

  return (
    <group>
      {buildings.map((b, i) => (
        <group key={i} position={[b.x, 0, b.z]}>
          <mesh position={[0, b.h / 2, 0]}>
            <boxGeometry args={[b.w, b.h, b.w * 0.8]} />
            <meshStandardMaterial color="#e8c097" roughness={0.9} />
          </mesh>
          {/* Crenellations */}
          {Array.from({ length: 4 }, (_, ci) => (
            <mesh key={ci} position={[(-b.w / 2) + ci * (b.w / 3) + 0.3, b.h + 0.15, 0]}>
              <boxGeometry args={[0.3, 0.3, b.w * 0.82]} />
              <meshStandardMaterial color="#d4a96a" roughness={0.8} />
            </mesh>
          ))}
          {b.dome && (
            <group position={[0, b.h, 0]}>
              <mesh>
                <sphereGeometry args={[b.w * 0.3, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
                <meshStandardMaterial color="#1565c0" roughness={0.4} />
              </mesh>
              <mesh position={[0, -0.12, 0]}>
                <cylinderGeometry args={[b.w * 0.28, b.w * 0.28, 0.24, 10]} />
                <meshStandardMaterial color="#d4a96a" roughness={0.6} />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  );
}

function DistantMinaret({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 5.5, 0]}>
        <boxGeometry args={[1.6, 11, 1.6]} />
        <meshStandardMaterial color="#e8c097" roughness={0.85} />
      </mesh>
      <mesh position={[0, 11.5, 0]}>
        <boxGeometry args={[1.3, 2, 1.3]} />
        <meshStandardMaterial color="#ddb880" roughness={0.8} />
      </mesh>
      {/* Blue dome top */}
      <group position={[0, 12.8, 0]}>
        <mesh>
          <sphereGeometry args={[0.7, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          <meshStandardMaterial color="#1565c0" roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.65, 0.65, 0.2, 10]} />
          <meshStandardMaterial color="#d4a96a" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.75, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
      {/* Crenellations */}
      {[[-0.45, -0.45], [-0.45, 0.45], [0.45, -0.45], [0.45, 0.45]].map(([bx, bz], i) => (
        <mesh key={i} position={[bx as number, 12.2, bz as number]}>
          <boxGeometry args={[0.35, 0.35, 0.35]} />
          <meshStandardMaterial color="#d4a96a" roughness={0.8} />
        </mesh>
      ))}
      {/* Zellige band */}
      <mesh position={[0, 10.2, 0]}>
        <boxGeometry args={[1.35, 0.35, 1.35]} />
        <meshStandardMaterial color="#1565c0" roughness={0.5} />
      </mesh>
      {/* Arch details */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((rot, i) => (
        <mesh key={i} position={[Math.sin(rot) * 0.82, 5.5, Math.cos(rot) * 0.82]} rotation={[0, -rot, 0]}>
          <torusGeometry args={[0.42, 0.07, 5, 10, Math.PI]} />
          <meshStandardMaterial color="#d4a96a" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function DistantRoundTree({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 3.6, 6]} />
        <meshStandardMaterial color="#5d4037" roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.8, 0]}>
        <sphereGeometry args={[0.9, 8, 8]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.8} />
      </mesh>
    </group>
  );
}

export function Scene() {
  return (
    <>
      {/* Sky */}
      <mesh position={[0, 15, -100]}>
        <planeGeometry args={[300, 80]} />
        <meshStandardMaterial color="#87ceeb" side={THREE.FrontSide} roughness={1} />
      </mesh>
      {/* Horizon gradient */}
      <mesh position={[0, 4, -100]}>
        <planeGeometry args={[300, 20]} />
        <meshStandardMaterial color="#b0d4f1" side={THREE.FrontSide} roughness={1} />
      </mesh>

      {/* Ground beyond road */}
      <mesh position={[0, -0.05, -50]} receiveShadow>
        <planeGeometry args={[120, 200]} />
        <meshStandardMaterial color="#c8d8a0" roughness={1} />
      </mesh>

      {/* Clouds */}
      <CloudPuff x={-20} y={22} z={-60} />
      <CloudPuff x={15} y={26} z={-70} />
      <CloudPuff x={-5} y={20} z={-85} />
      <CloudPuff x={25} y={24} z={-50} />

      {/* Distant minarets */}
      <DistantMinaret x={-18} z={-55} />
      <DistantMinaret x={22} z={-65} />
      <DistantMinaret x={-30} z={-75} />
      <DistantMinaret x={35} z={-50} />

      {/* Distant city skyline */}
      <DistantCity />

      {/* Distant trees */}
      <DistantRoundTree x={-12} z={-40} />
      <DistantRoundTree x={14} z={-45} />
      <DistantRoundTree x={-20} z={-50} />
      <DistantRoundTree x={18} z={-38} />
      <DistantRoundTree x={-8} z={-55} />
    </>
  );
}
