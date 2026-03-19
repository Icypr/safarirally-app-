import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class HazardManager {
  private scene: THREE.Scene;
  private world: CANNON.World;
  private hazards: { body: CANNON.Body; mesh: THREE.Mesh }[] = [];

  constructor(world: CANNON.World, scene: THREE.Scene, count: number) {
    this.world = world;
    this.scene = scene;
    this.setupHazards(count);
  }

  private setupHazards(count: number) {
    const geometry = new THREE.DodecahedronGeometry(1.5, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x555555 });

    for (let i = 0; i < count; i++) {
      const pos = new THREE.Vector3(
        THREE.MathUtils.randFloatSpread(40),
        1.5,
        THREE.MathUtils.randFloat(20, 200)
      );

      const shape = new CANNON.Sphere(1.5);
      const body = new CANNON.Body({ mass: 0 }); // Static
      body.addShape(shape);
      body.position.copy(pos as any);
      this.world.addBody(body);

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(pos);
      mesh.castShadow = true;
      this.scene.add(mesh);

      this.hazards.push({ body, mesh });
    }
  }

  public destroy() {
    this.hazards.forEach((h) => {
      this.world.removeBody(h.body);
      this.scene.remove(h.mesh);
    });
  }
}
