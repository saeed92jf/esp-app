"use client";
import { Canvas } from "@react-three/fiber";
import {
  Float,
  OrbitControls,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import type { ShapeType } from "../types";

const CuboidsGroup = ({ color }: { color: string }) => {
  const materialProps = { color, metalness: 0.2, roughness: 0.1, clearcoat: 1 };
  const size: [number, number, number] = [0.5, 0.5, 0.5];
  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[0.1, 0.2, 0.3]} castShadow>
        <boxGeometry args={size} />
        <meshPhysicalMaterial {...materialProps} />
      </mesh>
      <mesh position={[0.8, 0.6, 0.2]} rotation={[0.4, 0.1, 0.5]} castShadow>
        <boxGeometry args={size} />
        <meshPhysicalMaterial {...materialProps} />
      </mesh>
      <mesh position={[-0.7, -0.6, 0.4]} rotation={[0.2, 0.7, 0.1]} castShadow>
        <boxGeometry args={size} />
        <meshPhysicalMaterial {...materialProps} />
      </mesh>
      <mesh position={[0.4, -0.8, -0.6]} rotation={[0.8, 0.3, 0.2]} castShadow>
        <boxGeometry args={size} />
        <meshPhysicalMaterial {...materialProps} />
      </mesh>
      <mesh position={[-0.8, 0.7, -0.4]} rotation={[0.3, 0.9, 0.4]} castShadow>
        <boxGeometry args={size} />
        <meshPhysicalMaterial {...materialProps} />
      </mesh>
      <mesh position={[1.0, -0.4, -0.3]} rotation={[0.6, 0.2, 0.8]} castShadow>
        <boxGeometry args={size} />
        <meshPhysicalMaterial {...materialProps} />
      </mesh>
      <mesh position={[-0.9, 0.1, 0.8]} rotation={[0.1, 0.5, 0.9]} castShadow>
        <boxGeometry args={size} />
        <meshPhysicalMaterial {...materialProps} />
      </mesh>
      <mesh position={[0.2, 1.0, 0.7]} rotation={[0.5, 0.4, 0.1]} castShadow>
        <boxGeometry args={size} />
        <meshPhysicalMaterial {...materialProps} />
      </mesh>
    </group>
  );
};

const PyramidsGroup = ({ color }: { color: string }) => {
  const materialProps = { color, metalness: 0.2, roughness: 0.1, clearcoat: 1 };
  const size: [number, number, number] = [0.4, 0.6, 4];
  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[0.2, 0, 0.1]} castShadow>
        <coneGeometry args={size} />
        <meshPhysicalMaterial {...materialProps} />
      </mesh>
      <mesh position={[0.8, 0.5, 0.2]} rotation={[0.5, 0.4, -0.2]} castShadow>
        <coneGeometry args={size} />
        <meshPhysicalMaterial {...materialProps} />
      </mesh>
      <mesh position={[-0.7, -0.5, 0.4]} rotation={[-0.4, 0.2, 0.5]} castShadow>
        <coneGeometry args={size} />
        <meshPhysicalMaterial {...materialProps} />
      </mesh>
      <mesh position={[0.4, -0.8, -0.5]} rotation={[0.1, -0.6, 0.3]} castShadow>
        <coneGeometry args={size} />
        <meshPhysicalMaterial {...materialProps} />
      </mesh>
      <mesh
        position={[-0.8, 0.6, -0.4]}
        rotation={[-0.3, 0.5, -0.4]}
        castShadow
      >
        <coneGeometry args={size} />
        <meshPhysicalMaterial {...materialProps} />
      </mesh>
      <mesh position={[0.9, -0.4, -0.3]} rotation={[0.6, -0.2, 0.1]} castShadow>
        <coneGeometry args={size} />
        <meshPhysicalMaterial {...materialProps} />
      </mesh>
      <mesh position={[-0.9, 0.1, 0.7]} rotation={[-0.1, 0.8, 0.6]} castShadow>
        <coneGeometry args={size} />
        <meshPhysicalMaterial {...materialProps} />
      </mesh>
      <mesh position={[0.1, 1.0, 0.5]} rotation={[0.4, 0.1, -0.5]} castShadow>
        <coneGeometry args={size} />
        <meshPhysicalMaterial {...materialProps} />
      </mesh>
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
  // تبدیل کردن ضریب زوم به یک آرایه برای جلوگیری از باگ‌های scale در Three.js
  const s = 0.5 + ((zoom || 50) / 100) * 0.8;
  const safeScale: [number, number, number] = [s, s, s];

  return (
    <div className="absolute inset-0 h-full w-full">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <Environment preset="city" />

        <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
          {/* اعمال اسکیل امن به گروه */}
          <group scale={safeScale}>
            {shape === "cuboids" ? (
              <CuboidsGroup color={color} />
            ) : (
              <PyramidsGroup color={color} />
            )}
          </group>
        </Float>

        <ContactShadows
          position={[0, -2, 0]}
          opacity={0.6}
          scale={10}
          blur={2.5}
          far={4}
          color="#000000"
        />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
      </Canvas>
    </div>
  );
}
