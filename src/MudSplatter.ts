import * as THREE from 'three';

export class MudSplatter {
  private particles: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private count: number = 500;
  private mudDepth: number;
  private positions: Float32Array;
  private velocities: THREE.Vector3[] = [];
  private lifetimes: number[] = [];

  constructor(scene: THREE.Scene, mudDepth: number = 0.5) {
    this.mudDepth = mudDepth;
    this.count = 500 + Math.floor(mudDepth * 1000);
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.count * 3);
    
    for (let i = 0; i < this.count; i++) {
      this.velocities.push(new THREE.Vector3());
      this.lifetimes.push(0);
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.material = new THREE.PointsMaterial({
      color: 0x4a3728,
      size: 0.2,
      transparent: true,
      opacity: 0.8
    });

    this.particles = new THREE.Points(this.geometry, this.material);
    scene.add(this.particles);
  }

  public emit(position: THREE.Vector3, velocity: THREE.Vector3) {
    for (let i = 0; i < this.count; i++) {
      if (this.lifetimes[i] <= 0) {
        this.positions[i * 3] = position.x;
        this.positions[i * 3 + 1] = position.y;
        this.positions[i * 3 + 2] = position.z;

        this.velocities[i].set(
          (Math.random() - 0.5) * 2 + velocity.x * 0.5,
          Math.random() * 5,
          (Math.random() - 0.5) * 2 + velocity.z * 0.5
        );
        this.lifetimes[i] = 1.0;
        break;
      }
    }
  }

  public update(deltaTime: number) {
    const positions = this.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < this.count; i++) {
      if (this.lifetimes[i] > 0) {
        positions[i * 3] += this.velocities[i].x * deltaTime;
        positions[i * 3 + 1] += this.velocities[i].y * deltaTime;
        positions[i * 3 + 2] += this.velocities[i].z * deltaTime;

        this.velocities[i].y -= 9.8 * deltaTime; // Gravity
        this.lifetimes[i] -= deltaTime;

        if (positions[i * 3 + 1] < 0) {
          this.lifetimes[i] = 0;
        }
      } else {
        positions[i * 3 + 1] = -100; // Hide
      }
    }
    this.geometry.attributes.position.needsUpdate = true;
  }
}
