"use client";
import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls, Environment } from "@react-three/drei";
import type { ShapeType } from "../types";

const getSphericalPositions = (count: number, radius: number) => {
  const positions: [number, number, number][] = [];
  const rotations: [number, number, number][] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = phi * i;

    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    positions.push([x * radius, y * radius, z * radius]);
    rotations.push([
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI,
    ]);
  }
  return { positions, rotations };
};

const CuboidsGroup = ({ color }: { color: string }) => {
  // استفاده از متریال استاندارد با خشونت بالا (ماتِ مات بدون براقیت)
  const materialProps = { color, roughness: 1, metalness: 0 };
  const { positions, rotations } = useMemo(
    () => getSphericalPositions(30, 1.8),
    [],
  );

  return (
    <group>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos} rotation={rotations[i]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      ))}
    </group>
  );
};

const PyramidsGroup = ({ color }: { color: string }) => {
  // استفاده از متریال استاندارد مات
  const materialProps = { color, roughness: 1, metalness: 0 };
  const { positions, rotations } = useMemo(
    () => getSphericalPositions(30, 1.8),
    [],
  );

  return (
    <group>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos} rotation={rotations[i]} castShadow>
          <coneGeometry args={[0.45, 0.8, 4]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      ))}
    </group>
  );
};

export function EngineeringObject({
  color,
  shape,
  zoom,
}: {
  color: string;
  shape: ShapeType;
  zoom: number;
}) {
  const s = 0.4 + ((zoom || 50) / 100) * 0.6;
  const safeScale: [number, number, number] = [s, s, s];

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 30 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          outline: "none",
        }}
      >
        <ambientLight intensity={0.8} />
        <Environment preset="city" />

        <Float speed={1.5} rotationIntensity={1.2} floatIntensity={1}>
          <group scale={safeScale}>
            {shape === "cuboids" ? (
              <CuboidsGroup color={color} />
            ) : (
              <PyramidsGroup color={color} />
            )}
          </group>
        </Float>

        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={2}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
