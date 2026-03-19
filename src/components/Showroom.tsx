import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { motion, AnimatePresence } from 'motion/react';
import { CarConfig, colors } from '../gameData';
import { Shield, Zap, Wind, Check, Lock, Coins, ArrowLeft, ArrowRight } from 'lucide-react';

interface ShowroomProps {
  selectedCar: CarConfig;
  tokens: number;
  isUnlocked: boolean;
  onBuy: (carId: string) => void;
  onSelect: (carId: string) => void;
  onBack: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Showroom: React.FC<ShowroomProps> = ({
  selectedCar,
  tokens,
  isUnlocked,
  onBuy,
  onSelect,
  onBack,
  onNext,
  onPrev
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const carGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.Fog(0x050505, 10, 50);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(8, 4, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 15;
    controls.maxPolarAngle = Math.PI / 2 - 0.1; // Don't go below floor

    // Reflective Floor
    const floorGeom = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.MeshStandardMaterial({ 
      color: 0x111111,
      roughness: 0.1,
      metalness: 0.8
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid helper for that "tech" look
    const grid = new THREE.GridHelper(100, 50, 0x333333, 0x111111);
    grid.position.y = 0.01;
    scene.add(grid);

    // Three-Point Studio Lighting
    // 1. Key Light (Main source)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2);
    keyLight.position.set(5, 10, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    // 2. Fill Light (Soften shadows)
    const fillLight = new THREE.DirectionalLight(0x4444ff, 1);
    fillLight.position.set(-5, 5, 5);
    scene.add(fillLight);

    // 3. Rim Light (Highlight edges/curves)
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.5);
    rimLight.position.set(0, 5, -10);
    scene.add(rimLight);

    // Ambient Light
    const ambient = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambient);

    // Car Group
    const carGroup = new THREE.Group();
    scene.add(carGroup);
    carGroupRef.current = carGroup;

    // Animation Loop
    let frameId: number;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Car Visuals when selectedCar changes
  useEffect(() => {
    if (!carGroupRef.current) return;
    const group = carGroupRef.current;
    
    // Clear previous car
    while(group.children.length > 0) {
      const child = group.children[0];
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
      group.remove(child);
    }

    // Simple Procedural Car Mesh (representing the selected car)
    // In a real app, we'd load a GLTF model here
    const bodyGeom = new THREE.BoxGeometry(4, 1, 2);
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: selectedCar.color,
      roughness: 0.2,
      metalness: 0.8
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = 0.8;
    body.castShadow = true;
    group.add(body);

    const cabinGeom = new THREE.BoxGeometry(2, 0.8, 1.8);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const cabin = new THREE.Mesh(cabinGeom, cabinMat);
    cabin.position.set(-0.2, 1.6, 0);
    cabin.castShadow = true;
    group.add(cabin);

    // Safari Snorkel (Visual Highlight)
    const snorkelGeom = new THREE.CylinderGeometry(0.1, 0.1, 1.5);
    const snorkelMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const snorkel = new THREE.Mesh(snorkelGeom, snorkelMat);
    snorkel.position.set(0.5, 1.8, 0.9);
    snorkel.rotation.z = Math.PI / 8;
    group.add(snorkel);

    // Wheels
    const wheelGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 32);
    wheelGeom.rotateX(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });

    const wheelPositions = [
      [1.5, 0.5, 1], [1.5, 0.5, -1],
      [-1.5, 0.5, 1], [-1.5, 0.5, -1]
    ];

    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeom, wheelMat);
      wheel.position.set(pos[0], pos[1], pos[2]);
      wheel.castShadow = true;
      group.add(wheel);
    });

    // Play Revving Sound (Placeholder logic)
    if (selectedCar) {
      console.log("Playing Revving Audio for:", selectedCar.name);
    }
    
  }, [selectedCar]);

  if (!selectedCar) return null;

  return (
    <div className="relative w-full h-screen bg-black text-white font-sans overflow-hidden">
      {/* 3D Container */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* UI Overlays */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8">
        {/* Header */}
        <div className="flex justify-between items-start pointer-events-auto">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 glass-card px-4 py-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold uppercase tracking-widest text-xs">Back to Menu</span>
          </button>

          <div className="glass-card px-6 py-3 rounded-2xl border-t-2 border-safari-gold flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Your Balance</span>
              <span className="text-2xl font-black italic text-safari-gold">{tokens.toLocaleString()}</span>
            </div>
            <Coins className="w-8 h-8 text-safari-gold" />
          </div>
        </div>

        {/* Tech Sheet Overlay */}
        <div className="flex justify-between items-end">
          <motion.div 
            key={selectedCar.id}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="glass-card p-8 rounded-3xl border-l-4 border-safari-gold max-w-md pointer-events-auto"
          >
            <div className="mb-6">
              <h2 className="text-4xl font-black italic uppercase leading-none mb-2">{selectedCar.name}</h2>
              <p className="text-safari-gold font-bold uppercase tracking-widest text-xs">{selectedCar.specialty}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-8">
              <StatBar icon={<Shield className="w-4 h-4" />} label="Durability" value={selectedCar.durability} />
              <StatBar icon={<Zap className="w-4 h-4" />} label="Torque" value={selectedCar.torque} />
              <StatBar icon={<Wind className="w-4 h-4" />} label="Suspension" value={selectedCar.suspensionTravel} />
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-8 italic">
              "{selectedCar.description}"
            </p>

            <div className="flex gap-4">
              {!isUnlocked ? (
                <button 
                  onClick={() => onBuy(selectedCar.id)}
                  disabled={tokens < selectedCar.cost}
                  className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                    tokens >= selectedCar.cost 
                    ? 'bg-safari-gold text-black hover:scale-105 active:scale-95' 
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  Buy for {selectedCar.cost.toLocaleString()}
                </button>
              ) : (
                <button 
                  onClick={() => onSelect(selectedCar.id)}
                  className="flex-1 py-4 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-500/30 transition-all"
                >
                  <Check className="w-5 h-5" />
                  Select Vehicle
                </button>
              )}
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex gap-4 pointer-events-auto">
            <button 
              onClick={onPrev}
              className="w-16 h-16 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-8 h-8" />
            </button>
            <button 
              onClick={onNext}
              className="w-16 h-16 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ArrowRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBar: React.FC<{ icon: React.ReactNode; label: string; value: number }> = ({ icon, label, value }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
      <span className={value > 7 ? 'text-emerald-400' : 'text-white'}>{value}/10</span>
    </div>
    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value * 10}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-full rounded-full ${
          value > 8 ? 'bg-emerald-500' : value > 5 ? 'bg-safari-gold' : 'bg-red-500'
        }`}
      />
    </div>
  </div>
);
