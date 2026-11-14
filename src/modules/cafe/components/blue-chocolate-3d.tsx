"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Maximize2,
  X,
  Volume2,
  VolumeX,
  Layers,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

interface BlueChocolate3DProps {
  onClose?: () => void;
  inline?: boolean;
}

export function BlueChocolate3D({ onClose, inline = false }: BlueChocolate3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [ambientParticles, setAmbientParticles] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameId = useRef<number | null>(null);
  const glassRef = useRef<THREE.Group | null>(null);
  const liquidMeshRef = useRef<THREE.Mesh | null>(null);
  const foamMeshRef = useRef<THREE.Mesh | null>(null);
  const powderParticlesRef = useRef<THREE.Points | null>(null);
  const milkStreamRef = useRef<THREE.Mesh | null>(null);
  const stageRef = useRef<number>(1);
  stageRef.current = currentStage;

  const STAGES = [
    {
      id: 1,
      title: "مرحله ۱ – پودر شکلات آبی اصیل",
      titleEn: "Stage 1 – Pure Blue Chocolate Powder",
      desc: "ابرهای معلق از پودر آبی مخملی با عطر کاکائوی ماداگاسکار و آنتوسیانین ارگانیک به درون جام فرود می‌آیند.",
      glassLiquidHeight: 0.15,
      liquidColor: "#174A8B",
      milkStreamVisible: false,
      foamVisible: false,
    },
    {
      id: 2,
      title: "مرحله ۲ – ورود شیر بخار داده شده (Microfoam)",
      titleEn: "Stage 2 – Steamed Milk Infusion",
      desc: "جریان ابریشمی شیر گرم با دمای ۶۵ درجه، گردابه‌ای خروشان و چرخان در قلب جام پدید می‌آورد.",
      glassLiquidHeight: 0.55,
      liquidColor: "#2B5FA3",
      milkStreamVisible: true,
      foamVisible: false,
    },
    {
      id: 3,
      title: "مرحله ۳ – دگرگونی و رقص ماربلینگ",
      titleEn: "Stage 3 – Marbling Transformation",
      desc: "انحلال ذرات پودر آبی در جریان شیر، موج‌های آبسترکت لاجوردی و عاجی مسحورکننده خلق می‌کند.",
      glassLiquidHeight: 0.85,
      liquidColor: "#3D70B7",
      milkStreamVisible: false,
      foamVisible: false,
    },
    {
      id: 4,
      title: "مرحله ۴ – تکامل بافت کرمی و فوم مخملی",
      titleEn: "Stage 4 – Rich Creamy Foam",
      desc: "لایه‌ای متراکم و معلق از فوم شیر ابریشمی بر فراز نوشیدنی متولد شده و ترکیب را به تعادل نهایی می‌رساند.",
      glassLiquidHeight: 0.95,
      liquidColor: "#4B82C9",
      milkStreamVisible: false,
      foamVisible: true,
    },
    {
      id: 5,
      title: "مرحله ۵ – امضای نهایی ژین کافی",
      titleEn: "Stage 5 – Signature Reveal & Dusting",
      desc: "غبارآرایی نهایی پودر آبی بر روی فوم و چرخش ۳۶۰ درجه برای نمایش اثر هنری شکلات آبی.",
      glassLiquidHeight: 1.0,
      liquidColor: "#3D70B7",
      milkStreamVisible: false,
      foamVisible: true,
    },
  ];

  // Auto-progression when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev >= 5 ? 1 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Three.js Scene Setup & Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Radial gradient background approximation using fog and ambient light
    scene.fog = new THREE.FogExp2(0x071b35, 0.05);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 4.5);
    camera.lookAt(0, 0.3, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0x174a8b, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.SpotLight(0xa8c9e8, 5.5, 20, Math.PI / 4, 0.5, 1.5);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.SpotLight(0x3d70b7, 6.0, 20, Math.PI / 3, 0.6, 2);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    const bottomWarmGlow = new THREE.PointLight(0xd8c2a3, 1.2, 10);
    bottomWarmGlow.position.set(0, -2, 2);
    scene.add(bottomWarmGlow);

    // 5. Main Glass & Beverage Group
    const glassGroup = new THREE.Group();
    glassRef.current = glassGroup;
    scene.add(glassGroup);

    // Glass Material: High transmission / transparent physics-based glass
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.38,
      roughness: 0.05,
      metalness: 0.05,
      transmission: 0.9,
      ior: 1.52, // Standard borosilicate glassware
      thickness: 0.25,
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xa8c9e8),
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });

    // Glass Outer Geometry (Lathe profile or Cylinder with open top)
    const glassHeight = 2.4;
    const glassRadiusTop = 0.85;
    const glassRadiusBottom = 0.65;
    const glassOuterGeom = new THREE.CylinderGeometry(glassRadiusTop, glassRadiusBottom, glassHeight, 48, 1, true);
    const glassOuterMesh = new THREE.Mesh(glassOuterGeom, glassMaterial);
    glassOuterMesh.position.y = glassHeight / 2;
    glassGroup.add(glassOuterMesh);

    // Glass Thick Bottom Base
    const glassBaseGeom = new THREE.CylinderGeometry(glassRadiusBottom, glassRadiusBottom - 0.05, 0.35, 48);
    const glassBaseMesh = new THREE.Mesh(glassBaseGeom, glassMaterial);
    glassBaseMesh.position.y = 0.175;
    glassGroup.add(glassBaseMesh);

    // Inner Liquid Mesh
    const liquidGeom = new THREE.CylinderGeometry(glassRadiusTop - 0.06, glassRadiusBottom - 0.04, glassHeight - 0.4, 48);
    const liquidMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x3d70b7),
      roughness: 0.2,
      metalness: 0.08,
      transmission: 0.45,
      ior: 1.34,
      clearcoat: 0.8,
    });
    const liquidMesh = new THREE.Mesh(liquidGeom, liquidMaterial);
    liquidMesh.position.y = (glassHeight - 0.4) / 2 + 0.35;
    liquidMesh.scale.set(0.98, 0.1, 0.98);
    liquidMeshRef.current = liquidMesh;
    glassGroup.add(liquidMesh);

    // Top Foam Layer
    const foamGeom = new THREE.CylinderGeometry(glassRadiusTop - 0.05, glassRadiusTop - 0.06, 0.28, 48);
    const foamMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f0e8,
      roughness: 0.85,
      metalness: 0.0,
    });
    const foamMesh = new THREE.Mesh(foamGeom, foamMaterial);
    foamMesh.position.y = glassHeight - 0.1;
    foamMesh.visible = false;
    foamMeshRef.current = foamMesh;
    glassGroup.add(foamMesh);

    // Milk Stream (falling ribbon cylinder)
    const milkStreamGeom = new THREE.CylinderGeometry(0.04, 0.07, 3.0, 16);
    const milkStreamMat = new THREE.MeshStandardMaterial({
      color: 0xfdfbf7,
      roughness: 0.3,
      metalness: 0.1,
    });
    const milkStreamMesh = new THREE.Mesh(milkStreamGeom, milkStreamMat);
    milkStreamMesh.position.set(0.1, 2.8, 0);
    milkStreamMesh.visible = false;
    milkStreamRef.current = milkStreamMesh;
    glassGroup.add(milkStreamMesh);

    // 6. Floating Particles (Blue Chocolate powder & ambient drifting dust)
    const particleCount = 1200;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const powderBlue = new THREE.Color(0x3d70b7);
    const softBlue = new THREE.Color(0xa8c9e8);
    const creamWhite = new THREE.Color(0xf5f0e8);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 6;
      particlePositions[i * 3 + 1] = (Math.random() - 0.2) * 5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 6;

      const c = i % 3 === 0 ? powderBlue : i % 3 === 1 ? softBlue : creamWhite;
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;
    }

    const particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeom.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeom, particleMat);
    powderParticlesRef.current = particleSystem;
    scene.add(particleSystem);

    // 7. Ground Pedestal Mirror
    const groundGeom = new THREE.CircleGeometry(3.5, 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x051326,
      roughness: 0.2,
      metalness: 0.8,
    });
    const groundMesh = new THREE.Mesh(groundGeom, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = 0;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Mouse drag interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !glassGroup) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      glassGroup.rotation.y += deltaX * 0.01;
      glassGroup.rotation.x = Math.max(-0.2, Math.min(0.3, glassGroup.rotation.x + deltaY * 0.005));
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Touch events for mobile/tablet
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || !glassGroup || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      glassGroup.rotation.y += deltaX * 0.01;
      prevMouseX = e.touches[0].clientX;
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // Animation Render Loop
    let clock = new THREE.Clock();
    let currentLiquidScaleY = 0.2;

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      const stageInfo = STAGES[(stageRef.current || 1) - 1];
      const targetHeight = stageInfo ? stageInfo.glassLiquidHeight : 0.5;

      // Smooth interpolation for liquid level
      currentLiquidScaleY += (targetHeight - currentLiquidScaleY) * 0.05;
      if (liquidMeshRef.current) {
        liquidMeshRef.current.scale.y = currentLiquidScaleY;
        liquidMeshRef.current.position.y = ((glassHeight - 0.4) * currentLiquidScaleY) / 2 + 0.35;
        (liquidMeshRef.current.material as THREE.MeshPhysicalMaterial).color.lerp(
          new THREE.Color(stageInfo.liquidColor),
          0.05
        );
      }

      // Foam visibility
      if (foamMeshRef.current) {
        foamMeshRef.current.visible = stageInfo.foamVisible;
        if (stageInfo.foamVisible) {
          foamMeshRef.current.position.y = (glassHeight - 0.4) * currentLiquidScaleY + 0.35;
        }
      }

      // Milk Stream animation
      if (milkStreamRef.current) {
        milkStreamRef.current.visible = stageInfo.milkStreamVisible;
        if (stageInfo.milkStreamVisible) {
          milkStreamRef.current.rotation.y = elapsedTime * 3;
          milkStreamRef.current.scale.x = 0.8 + Math.sin(elapsedTime * 8) * 0.2;
        }
      }

      // Particle float & slow swirl
      if (powderParticlesRef.current && powderParticlesRef.current.geometry) {
        const positions = powderParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 1] -= 0.006;
          // Loop particles when they fall below pedestal
          if (positions[i * 3 + 1] < 0) {
            positions[i * 3 + 1] = 4.5 + Math.random();
          }
          // gentle swirl around center
          const x = positions[i * 3];
          const z = positions[i * 3 + 2];
          positions[i * 3] = x * Math.cos(0.002) - z * Math.sin(0.002);
          positions[i * 3 + 2] = x * Math.sin(0.002) + z * Math.cos(0.002);
        }
        powderParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Subtle levitation floating of the entire glass group
      if (glassGroup && !isDragging) {
        glassGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.06;
        if (autoRotate || stageRef.current === 5) {
          glassGroup.rotation.y += 0.007;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      renderer.dispose();
      container.innerHTML = "";
    };
  }, [autoRotate]);

  return (
    <div
      className={
        inline
          ? "relative w-full h-[620px] rounded-lg overflow-hidden border border-border/60 bg-gradient-to-b from-[#071B35] via-[#0D2447] to-[#040C1A] text-white select-none"
          : "fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-6 select-none"
      }
    >
      <div
        className={
          inline
            ? "relative w-full h-full flex flex-col justify-between"
            : "relative w-full max-w-6xl h-[92vh] max-h-[850px] rounded-lg overflow-hidden border border-[#2B5FA3]/50 bg-gradient-to-b from-[#071B35] via-[#0E2850] to-[#040C1A] text-white flex flex-col justify-between shadow-2xl"
        }
      >
        {/* Top Header Bar */}
        <div className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-[#2B5FA3]/30 bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-md bg-[#174A8B]/70 border border-[#A8C9E8]/40 flex items-center justify-center shadow-lg">
              <Sparkles className="size-5 text-[#A8C9E8] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-base text-[#F5F0E8] font-['Anta']">
                  ZHEEN COFFEE
                </span>
                <Badge className="bg-[#174A8B] text-[#A8C9E8] border border-[#3D70B7] text-[10px] py-0 px-1.5 rounded-md">
                  3D Cinematic Experience
                </Badge>
              </div>
              <p className="text-xs text-[#A8C9E8]/80 font-medium">تجربه تعاملی آماده‌سازی نوشیدنی شکلات آبی</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRotate(!autoRotate)}
              className="rounded-md h-8 text-xs bg-white/10 hover:bg-white/20 text-[#F5F0E8] border-white/20 cursor-pointer"
            >
              {autoRotate ? "چرخش خودکار: روشن" : "چرخش خودکار: خاموش"}
            </Button>

            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-md size-8 text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="size-5" />
              </Button>
            )}
          </div>
        </div>

        {/* 3D Three.js Viewport */}
        <div ref={mountRef} className="absolute inset-0 z-0 w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Cinematic Watermark / Brand Title Overlay */}
        <div className="absolute top-20 start-6 z-10 pointer-events-none max-w-sm">
          <motion.div
            key={currentStage}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl sm:text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#F5F0E8] via-[#A8C9E8] to-[#3D70B7] drop-shadow-md">
              BLUE CHOCOLATE
            </h1>
            <p className="text-sm font-semibold text-[#D8C2A3] mt-1 tracking-wide">
              A little magic in every sip.
            </p>
            <p className="text-xs text-white/60 mt-1">Discover our signature blue chocolate experience.</p>
          </motion.div>
        </div>

        {/* Floating Stage Description Card */}
        <div className="relative z-20 px-6 pb-4 pt-2">
          <div className="max-w-3xl mx-auto bg-black/45 backdrop-blur-xl border border-[#2B5FA3]/50 rounded-md p-4 shadow-xl">
            {/* Stage Timeline Badges */}
            <div className="grid grid-cols-5 gap-1.5 mb-3">
              {STAGES.map((s) => {
                const isActive = currentStage === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setCurrentStage(s.id);
                      setIsPlaying(false);
                    }}
                    className={`h-11 px-2 rounded-md flex flex-col items-center justify-center transition-all duration-150 cursor-pointer border ${
                      isActive
                        ? "bg-[#3D70B7] border-[#A8C9E8] text-white font-bold shadow-md ring-1 ring-[#A8C9E8]/50"
                        : "bg-black/30 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span className="text-[10px] tracking-wider leading-none">مرحله {s.id}</span>
                    <span className="text-[9px] truncate max-w-full opacity-80 mt-1">
                      {s.id === 1 ? "پودر" : s.id === 2 ? "شیر داغ" : s.id === 3 ? "ماربلینگ" : s.id === 4 ? "فوم" : "رونمایی"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Stage Title and Description */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-white/10">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[#A8C9E8] animate-ping" />
                  <h3 className="text-sm font-bold text-[#F5F0E8]">{STAGES[currentStage - 1].title}</h3>
                </div>
                <p className="text-xs text-white/80 mt-1 leading-relaxed">
                  {STAGES[currentStage - 1].desc}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStage((prev) => (prev <= 1 ? 5 : prev - 1))}
                  className="rounded-md size-8 p-0 bg-white/10 hover:bg-white/20 border-white/20 text-white cursor-pointer"
                >
                  <ChevronRight className="size-4" />
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="rounded-md h-8 px-3 bg-[#3D70B7] hover:bg-[#2B5FA3] text-white border border-[#A8C9E8]/40 gap-1.5 cursor-pointer text-xs font-semibold"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="size-3.5" /> توقف
                    </>
                  ) : (
                    <>
                      <Play className="size-3.5" /> پخش خودکار
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStage((prev) => (prev >= 5 ? 1 : prev + 1))}
                  className="rounded-md size-8 p-0 bg-white/10 hover:bg-white/20 border-white/20 text-white cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentStage(1);
                    setIsPlaying(true);
                  }}
                  className="rounded-md size-8 p-0 bg-white/10 hover:bg-white/20 border-white/20 text-white cursor-pointer"
                  title="شروع مجدد از مرحله ۱"
                >
                  <RotateCcw className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
