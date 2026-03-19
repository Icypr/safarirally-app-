import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { VehicleController } from './VehicleController';
import { EnvironmentManager, BiomeConfig } from './EnvironmentManager';
import { WildlifeAI } from './WildlifeAI';
import { MudSplatter } from './MudSplatter';
import { RivalAI } from './RivalAI';
import { HazardManager } from './HazardManager';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { RaceEnd } from './components/RaceEnd';
import { Showroom } from './components/Showroom';
import { MobileControls } from './components/MobileControls';
import { RotateCcw } from 'lucide-react';
import { CameraManager, CameraMode } from './CameraManager';
import { LevelGenerator } from './LevelGenerator';
import { WindshieldMud } from './components/WindshieldMud';
import biomesData from './biomes.json';
import { CarConfig, LevelConfig, UpgradeConfig, cars, levels, upgrades } from './gameData';

import { LoadingScreen } from './components/LoadingScreen';
import { RaceConfig } from './campaignData';
import { audioManager } from './AudioManager';

const biomes = biomesData as BiomeConfig[];

type GameState = 'menu' | 'playing' | 'finished' | 'showroom' | 'loading';

interface CarCustomization {
  color: string;
  upgrades: string[]; // IDs of owned upgrades
}

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game State
  const [gameState, setGameState] = useState<GameState>('menu');
  const [tokens, setTokens] = useState(() => {
    const saved = localStorage.getItem('safari-tokens');
    return saved ? parseInt(saved) : 1000;
  });
  const [ownedCars, setOwnedCars] = useState<string[]>(() => {
    const saved = localStorage.getItem('safari-owned-cars');
    return saved ? JSON.parse(saved) : ['vw-beetle'];
  });
  const [selectedCarId, setSelectedCarId] = useState(() => {
    const saved = localStorage.getItem('safari-selected-car');
    return saved || 'vw-beetle';
  });
  const [carCustomizations, setCarCustomizations] = useState<{ [carId: string]: CarCustomization }>(() => {
    const saved = localStorage.getItem('safari-customizations');
    return saved ? JSON.parse(saved) : {
      'vw-beetle': { color: '#D45D31', upgrades: [] }
    };
  });
  const [currentLevel, setCurrentLevel] = useState<RaceConfig | null>(null);
  const [raceResult, setRaceResult] = useState<{ success: boolean; time: number; reward: number } | null>(null);
  
  // Showroom State
  const [showroomIndex, setShowroomIndex] = useState(0);

  // Runtime State
  const [speed, setSpeed] = useState(0);
  const [raceTime, setRaceTime] = useState(0);
  const [position, setPosition] = useState(1);
  const [stormIntensity, setStormIntensity] = useState(0);

  // Persistence
  useEffect(() => {
    localStorage.setItem('safari-tokens', tokens.toString());
    localStorage.setItem('safari-owned-cars', JSON.stringify(ownedCars));
    localStorage.setItem('safari-selected-car', selectedCarId);
    localStorage.setItem('safari-customizations', JSON.stringify(carCustomizations));
  }, [tokens, ownedCars, selectedCarId, carCustomizations]);

  const gameRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    world: CANNON.World;
    vehicle: VehicleController;
    env: EnvironmentManager;
    wildlife: WildlifeAI;
    mud: MudSplatter;
    rivals: RivalAI[];
    hazards: HazardManager;
    cameraManager: CameraManager;
    levelGen: LevelGenerator;
    keys: { [key: string]: boolean };
    startTime: number;
    active: boolean;
  } | null>(null);

  const buyCar = (carId: string) => {
    const car = cars.find(c => c.id === carId)!;
    if (tokens >= car.cost && !ownedCars.includes(carId)) {
      setTokens(prev => prev - car.cost);
      setOwnedCars(prev => [...prev, carId]);
      setCarCustomizations(prev => ({
        ...prev,
        [carId]: { color: car.color, upgrades: [] }
      }));
      console.log(`Unlocked: ${car.name}`);
    }
  };

  const customizeCar = (carId: string, color: string) => {
    setCarCustomizations(prev => ({
      ...prev,
      [carId]: { ...prev[carId], color }
    }));
  };

  const buyUpgrade = (carId: string, upgradeId: string) => {
    const upgrade = upgrades.find(u => u.id === upgradeId)!;
    const customization = carCustomizations[carId];
    if (tokens >= upgrade.cost && !customization.upgrades.includes(upgradeId)) {
      setTokens(prev => prev - upgrade.cost);
      setCarCustomizations(prev => ({
        ...prev,
        [carId]: { ...prev[carId], upgrades: [...prev[carId].upgrades, upgradeId] }
      }));
    }
  };

  const startRace = (level: RaceConfig) => {
    setCurrentLevel(level);
    setGameState('loading');
    setRaceTime(0);
    setSpeed(0);
    setPosition(1);
  };

  useEffect(() => {
    if (gameState !== 'playing' || !currentLevel || !containerRef.current) return;

    const biome = biomes.find(b => b.id === currentLevel.biomeId)!;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a202c);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // --- Physics Setup ---
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new CANNON.SAPBroadphase(world);
    (world.solver as CANNON.GSSolver).iterations = 10;
    world.defaultContactMaterial.friction = 0.3;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(10, 20, 10);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // --- Game Objects ---
    const carConfig = cars.find(c => c.id === selectedCarId)!;
    const customization = carCustomizations[selectedCarId];
    const vehicle = new VehicleController(world, scene, carConfig, customization?.color, customization?.upgrades);
    
    // Level Generation
    const levelGen = new LevelGenerator(scene, world);
    levelGen.generateRiftValleyTrack(1500, currentLevel.trackNarrowness);
    const startPos = levelGen.getStartPosition();
    vehicle.chassisBody.position.copy(startPos as any);

    const cameraManager = new CameraManager(camera, vehicle.chassisBody);
    camera.add(audioManager.getListener()); // Add audio listener to camera

    const env = new EnvironmentManager(scene, biome, sunLight, ambientLight, currentLevel.weather);
    const wildlife = new WildlifeAI(scene);
    const mud = new MudSplatter(scene, currentLevel.mudDepth);
    const hazards = new HazardManager(world, scene, currentLevel.hazardCount);
    
    // Rivals
    const rivals: RivalAI[] = [];
    for (let i = 0; i < currentLevel.rivalCount; i++) {
      const rivalPos = startPos.clone().add(new THREE.Vector3((i + 1) * 5, 0, 0));
      rivals.push(new RivalAI(world, scene, rivalPos, currentLevel.rivalSpeed + Math.random() * 5, currentLevel.aiAggression));
    }

    // --- Input ---
    const keys: { [key: string]: boolean } = {};
    const onKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true;
      if (e.key.toLowerCase() === 'c') {
        cameraManager.toggleMode();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => (keys[e.key] = false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    gameRef.current = { 
      scene, camera, renderer, world, vehicle, env, wildlife, mud, rivals, hazards, cameraManager, levelGen, keys, 
      startTime: performance.now(),
      active: true 
    };

    // --- Animation Loop ---
    let frameId: number;
    let timeScale = 1.0;
    const animate = () => {
      if (!gameRef.current?.active) return;
      
      const time = performance.now();
      const { world, vehicle, env, wildlife, mud, rivals, hazards, cameraManager, keys, camera, renderer, scene, startTime } = gameRef.current;

      // Jump detection for Cinematic Jump Cam and Slow Motion
      const velocityY = vehicle.chassisBody.velocity.y;
      const isJumping = Math.abs(velocityY) > 5;
      
      if (isJumping) {
        timeScale = THREE.MathUtils.lerp(timeScale, 0.3, 0.1); // Smooth transition to slow motion
      } else {
        timeScale = THREE.MathUtils.lerp(timeScale, 1.0, 0.1);
      }

      const deltaTime = (1 / 60) * timeScale;

      // Update Race Time
      const elapsed = (time - startTime) / 1000;
      setRaceTime(elapsed);

      // Finish Condition
      const finishPos = levelGen.getFinishPosition();
      const distToFinish = vehicle.chassisBody.position.distanceTo(finishPos as any);
      if (distToFinish < 20) {
        const success = elapsed <= currentLevel.targetTime;
        const reward = success ? currentLevel.reward : 0;
        setTokens(prev => prev + reward);
        setRaceResult({ success, time: elapsed, reward });
        setGameState('finished');
        gameRef.current.active = false;
        return;
      }

      // Position Calculation (Simple)
      let currentPos = 1;
      rivals.forEach(r => {
        if (r.body.position.z > vehicle.chassisBody.position.z) currentPos++;
      });
      setPosition(currentPos);

      // Physics Input
      let engineForce = 0;
      let steeringValue = 0;
      let brakeForce = 0;

      if (keys['ArrowUp'] || keys['w']) engineForce = vehicle.config.engineForce;
      if (keys['ArrowDown'] || keys['s']) engineForce = -vehicle.config.engineForce * 0.5;
      if (keys['ArrowLeft'] || keys['a']) steeringValue = 0.5;
      if (keys['ArrowRight'] || keys['d']) steeringValue = -0.5;
      if (keys[' ']) brakeForce = 100;

      vehicle.applyInput(engineForce, steeringValue, brakeForce);
      
      // Step Physics
      world.step(deltaTime);

      // Update Systems
      const viscosity = env.getViscosity();
      vehicle.update(viscosity);
      env.update(deltaTime);
      setStormIntensity(env.getStormIntensity()); // Need to add this method to EnvironmentManager

      wildlife.update(vehicle.chassisBody.position as any, vehicle.chassisBody.velocity.length());
      mud.update(deltaTime);
      rivals.forEach(r => r.update(deltaTime, stormIntensity));

      if (vehicle.chassisBody.velocity.length() > 5 && viscosity > 0.5) {
        mud.emit(vehicle.chassisBody.position as any, vehicle.chassisBody.velocity as any);
      }

      // Camera Follow
      cameraManager.update(deltaTime, isJumping);

      setSpeed(vehicle.chassisBody.velocity.length() * 3.6);
      renderer.render(scene, camera);
      
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (gameRef.current) {
        gameRef.current.camera.aspect = window.innerWidth / window.innerHeight;
        gameRef.current.camera.updateProjectionMatrix();
        gameRef.current.renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (containerRef.current && gameRef.current) {
        containerRef.current.removeChild(gameRef.current.renderer.domElement);
      }
      gameRef.current = null;
    };
  }, [gameState, currentLevel, selectedCarId]);

  return (
    <div className="w-full h-screen bg-safari-storm overflow-hidden">
      {/* Landscape Warning */}
      <div className="fixed inset-0 z-[100] bg-safari-storm flex flex-col items-center justify-center p-8 text-center lg:hidden portrait:flex landscape:hidden">
        <div className="w-24 h-24 border-4 border-safari-gold rounded-2xl animate-bounce flex items-center justify-center mb-6">
          <RotateCcw className="w-12 h-12 text-safari-gold" />
        </div>
        <h2 className="text-3xl font-black italic uppercase mb-2">Rotate Device</h2>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Safari Rally Legends requires landscape mode for racing.</p>
      </div>

      {gameState === 'playing' && (
        <>
          <div ref={containerRef} className="w-full h-full" />
          <WindshieldMud 
            intensity={stormIntensity} 
            active={gameRef.current?.cameraManager.getMode() === CameraMode.COCKPIT} 
          />
          <HUD 
            speed={speed} 
            biomeName={currentLevel?.name || 'Safari Rally'} 
            position={position} 
            totalRivals={currentLevel?.rivalCount || 0} 
          />
          <MobileControls onInput={(key, pressed) => {
            if (gameRef.current) gameRef.current.keys[key] = pressed;
          }} />
          <div className="fixed top-8 left-1/2 -translate-x-1/2 glass-card px-6 py-2 rounded-full border-t-2 border-safari-gold">
            <p className="text-xs font-bold uppercase tracking-widest">Time: {raceTime.toFixed(2)}s / {currentLevel?.targetTime}s</p>
          </div>
        </>
      )}

      {gameState === 'menu' && (
        <MainMenu 
          tokens={tokens}
          ownedCars={ownedCars}
          selectedCarId={selectedCarId}
          carCustomizations={carCustomizations}
          onSelectCar={setSelectedCarId}
          onBuyCar={buyCar}
          onCustomizeCar={customizeCar}
          onBuyUpgrade={buyUpgrade}
          onStartLevel={startRace}
          onEnterShowroom={() => setGameState('showroom')}
        />
      )}

      {gameState === 'showroom' && cars[showroomIndex] && (
        <Showroom 
          selectedCar={cars[showroomIndex]}
          tokens={tokens}
          isUnlocked={ownedCars.includes(cars[showroomIndex].id)}
          onBuy={buyCar}
          onBack={() => setGameState('menu')}
          onSelect={(id) => {
            setSelectedCarId(id);
            setGameState('menu');
          }}
          onNext={() => setShowroomIndex((prev) => (prev + 1) % cars.length)}
          onPrev={() => setShowroomIndex((prev) => (prev - 1 + cars.length) % cars.length)}
        />
      )}

      {gameState === 'loading' && currentLevel && (
        <LoadingScreen 
          race={currentLevel} 
          onComplete={() => setGameState('playing')} 
        />
      )}

      {gameState === 'finished' && raceResult && (
        <RaceEnd 
          success={raceResult.success}
          time={raceResult.time}
          reward={raceResult.reward}
          onRetry={() => currentLevel && startRace(currentLevel)}
          onHome={() => setGameState('menu')}
        />
      )}
    </div>
  );
}
