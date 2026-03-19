import * as THREE from 'three';

export interface BiomeConfig {
  id: string;
  name: string;
  friction: number;
  viscosity: number;
  elevationVariance: number;
  visibility: number;
  weather: string;
  windForce?: number;
}

export class EnvironmentManager {
  private scene: THREE.Scene;
  private rainParticles: THREE.Points | null = null;
  private currentBiome: BiomeConfig;
  private stormTime: number = 0;
  private stormIntensity: number = 0; // 0 to 1
  private sunLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;

  constructor(scene: THREE.Scene, initialBiome: BiomeConfig, sunLight: THREE.DirectionalLight, ambientLight: THREE.AmbientLight, weather: string = 'Clear') {
    this.scene = scene;
    this.currentBiome = initialBiome;
    this.sunLight = sunLight;
    this.ambientLight = ambientLight;
    this.setupFog();
    this.setupWeather();
    this.setInitialWeather(weather);
  }

  private setInitialWeather(weather: string) {
    switch (weather) {
      case 'Clear': this.stormIntensity = 0; break;
      case 'Dusty': this.stormIntensity = 0.2; break;
      case 'Mist': this.stormIntensity = 0.4; break;
      case 'Light Rain': this.stormIntensity = 0.6; break;
      case 'Heavy Storm': this.stormIntensity = 1.0; break;
      default: this.stormIntensity = 0;
    }
  }

  private setupFog() {
    // Start with Heat Haze (low density)
    this.scene.fog = new THREE.FogExp2(0x1a202c, 0.01);
  }

  private setupWeather() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 15000; i++) {
      vertices.push(
        THREE.MathUtils.randFloatSpread(100),
        THREE.MathUtils.randFloatSpread(50),
        THREE.MathUtils.randFloatSpread(100)
      );
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({
      color: 0xaaaaaa,
      size: 0.1,
      transparent: true,
      opacity: 0 // Start invisible
    });
    this.rainParticles = new THREE.Points(geometry, material);
    this.scene.add(this.rainParticles);
  }

  public update(deltaTime: number) {
    this.stormTime += deltaTime;

    // Subtle variation around the base storm intensity
    const variation = Math.sin(this.stormTime * 0.2) * 0.05;
    const effectiveIntensity = Math.max(0, Math.min(1, this.stormIntensity + variation));

    // Update Fog (FogDensity lerp)
    if (this.scene.fog instanceof THREE.FogExp2) {
      const targetDensity = 0.01 + (0.07 * effectiveIntensity);
      this.scene.fog.density = THREE.MathUtils.lerp(this.scene.fog.density, targetDensity, 0.1);
      
      const stormColor = new THREE.Color(0x4a5568);
      const clearColor = new THREE.Color(0x1a202c);
      this.scene.fog.color.lerpColors(clearColor, stormColor, effectiveIntensity);
    }

    // Update Rain
    if (this.rainParticles) {
      (this.rainParticles.material as THREE.PointsMaterial).opacity = effectiveIntensity * 0.6;
      const positions = this.rainParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= (20 + 20 * effectiveIntensity) * deltaTime;
        if (positions[i] < -25) positions[i] = 25;
      }
      this.rainParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Update Lighting (God Rays effect)
    this.sunLight.intensity = 1.0 - (0.7 * effectiveIntensity);
    this.ambientLight.intensity = 0.5 - (0.3 * effectiveIntensity);
    
    if (effectiveIntensity > 0.5) {
      this.sunLight.color.setHex(0xffccaa); // Golden/God ray tint through storm clouds
    } else {
      this.sunLight.color.setHex(0xffffff);
    }
  }

  public getViscosity(): number {
    // Turn the track into 'high-viscosity' mud during heavy showers
    const variation = Math.sin(this.stormTime * 0.2) * 0.05;
    const effectiveIntensity = Math.max(0, Math.min(1, this.stormIntensity + variation));
    return this.currentBiome.viscosity + (0.8 * effectiveIntensity);
  }

  public getFriction(): number {
    // Reduce grip as 'Heavy Showers' saturate the 'Black Cotton' soil
    const variation = Math.sin(this.stormTime * 0.2) * 0.05;
    const effectiveIntensity = Math.max(0, Math.min(1, this.stormIntensity + variation));
    return this.currentBiome.friction * (1 - 0.5 * effectiveIntensity);
  }

  public getStormIntensity(): number {
    const variation = Math.sin(this.stormTime * 0.2) * 0.05;
    return Math.max(0, Math.min(1, this.stormIntensity + variation));
  }
}
