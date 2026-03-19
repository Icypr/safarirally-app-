import * as THREE from 'three';

export class WildlifeAI {
  private scene: THREE.Scene;
  private animals: THREE.Group[] = [];
  private count: number = 20;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.setupAnimals();
  }

  private setupAnimals() {
    const geometry = new THREE.BoxGeometry(0.5, 0.8, 1.2);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff }); // Zebra-ish

    for (let i = 0; i < this.count; i++) {
      const animal = new THREE.Group();
      const mesh = new THREE.Mesh(geometry, material);
      animal.add(mesh);
      
      animal.position.set(
        THREE.MathUtils.randFloatSpread(100),
        0.4,
        THREE.MathUtils.randFloatSpread(100)
      );
      
      this.animals.push(animal);
      this.scene.add(animal);
    }
  }

  public update(playerPos: THREE.Vector3, playerSpeed: number) {
    const scatterRadius = 15;
    const scatterSpeed = 5;

    this.animals.forEach((animal) => {
      const dist = animal.position.distanceTo(playerPos);
      if (dist < scatterRadius && playerSpeed > 5) {
        const dir = new THREE.Vector3()
          .subVectors(animal.position, playerPos)
          .normalize();
        animal.position.add(dir.multiplyScalar(scatterSpeed * 0.1));
        animal.lookAt(animal.position.clone().add(dir));
      }
    });
  }
}
