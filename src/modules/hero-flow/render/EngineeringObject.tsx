"use client";

import React, { useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF, Center } from "@react-three/drei";
import type { ShapeType } from "../types";
import * as THREE from "three";

const MODEL_PATHS: Record<ShapeType, string> = {
  lapJoint: "/3D-Model/0.5-150-LAP-JOINT-FLANGE.glb",
  weldNeck: "/3D-Model/0.5-150-WELD-NECK-FF-XXH-FLANGE.glb",
};

// Preload the models to prevent popping
Object.values(MODEL_PATHS).forEach((path) => useGLTF.preload(path));

function DynamicModel({ type }: { type: ShapeType }) {
  const { scene } = useGLTF(MODEL_PATHS[type]);

  useEffect(() => {
    // Apply a cool, natural metallic texture to all meshes
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.color.set("#ceb9b0ff"); // Realistic steel grey
          mat.emissive.set("#000000"); 
          mat.wireframe = false;
          mat.metalness = 0.85; 
          mat.roughness = 0.35; 
          mat.envMapIntensity = 1.2;
          mat.transparent = false;
          mat.opacity = 1.0;
          mat.polygonOffset = false;
          mat.needsUpdate = true;
        }
        
        // Ensure no custom edges remain
        mesh.children = mesh.children.filter(c => c.name !== 'custom-edges');

        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene, type]);

  // Center perfectly aligns the model's bounding box to the origin.
  return (
    <Center>
      <primitive object={scene} scale={[12, 12, 12]} />
    </Center>
  );
}

// ── Auto-rotate wrapper ───────────────────────────────────────────────────────
function AutoRotate({ children, speed = 0.4 }: { children: React.ReactNode; speed?: number }) {
  const groupRef = React.useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * speed;
  });
  return <group ref={groupRef}>{children}</group>;
}

// ── Public component ──────────────────────────────────────────────────────────
export function EngineeringObject({
  rotation = 0,
  shape,
  zoom = 50,
  compact = false,
  isRtl = false,
  isPlaying = true,
}: {
  rotation?: number;
  shape: ShapeType;
  zoom?: number;
  compact?: boolean;
  isRtl?: boolean;
  isPlaying?: boolean;
}) {
  // Fix zoom jump issue at 0 by providing a linear scaling.
  // 50 => 1.5, 0 => 0.5, 100 => 2.5
  const scaleFactor = 0.5 + (zoom / 50);
  const scale: [number, number, number] = [scaleFactor, scaleFactor, scaleFactor];

  // 🔽 تنظیم پوزیشن (X, Y, Z) خود مدل در صحنه 🔽
  // فرمت: [X, Y, Z] -> (X: چپ/راست | Y: بالا/پایین | Z: جلو/عقب)
  // برای تست موقعیت مدل این اعداد را تغییر دهید (مثلاً 0.5 یا -0.5)
  const modelPosition: [number, number, number] = isRtl
    ? [0.4, 0.4, 0]  // مقادیر راست‌چین (فارسی)
    : [-0.4, 0.4, 0]; // مقادیر چپ‌چین (انگلیسی)
  
  // 🔽 تنظیمات موقعیت دوربین (Camera Position) 🔽
  // فرمت: [X, Y, Z] -> (X: چپ/راست | Y: بالا/پایین | Z: دور/نزدیک)
  const cameraPos: [number, number, number] = compact
    ? [0, 0, 5.5]  // <-- مقادیر نود پریویو (آرایه اول)
    : [0, 0, 6.5]; // <-- مقادیر نمای بزرگ (آرایه دوم)
  const fov = compact ? 38 : 32;

  // Manual rotation from slider
  const rotY = (rotation * Math.PI) / 180;

  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: cameraPos, fov, up: [0, 1, 0] }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%", display: "block", outline: "none" }}
        shadows
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-5, 3, -5]} intensity={0.4} />
        <Environment preset="studio" />

        <group position={modelPosition}>
          <AutoRotate speed={isPlaying ? 0.15 : 0}>
            <group scale={scale} rotation={[0, rotY, 0]}>
              <DynamicModel type={shape} />
            </group>
          </AutoRotate>
        </group>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}

