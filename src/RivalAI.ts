import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class RivalAI {
  public body: CANNON.Body;
  public mesh: THREE.Group;
  private speed: number;
  private aiAggression: number;
  private scene: THREE.Scene;
  private world: CANNON.World;

  constructor(world: CANNON.World, scene: THREE.Scene, startPos: THREE.Vector3, speed: number, aiAggression: number = 0.5) {
    this.world = world;
    this.scene = scene;
    this.speed = speed;
    this.aiAggression = aiAggression;

    const shape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2));
    this.body = new CANNON.Body({ mass: 1000 });
    this.body.addShape(shape);
    this.body.position.copy(startPos as any);
    this.world.addBody(this.body);

    this.mesh = new THREE.Group();
    const bodyGeom = new THREE.BoxGeometry(2, 0.8, 4);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    this.mesh.add(bodyMesh);

    this.scene.add(this.mesh);
  }

  public update(deltaTime: number, stormIntensity: number = 0) {
    // Simple AI: drive forward with some random steering
    const forward = new CANNON.Vec3(0, 0, 1);
    const quat = this.body.quaternion;
    const worldForward = quat.vmult(forward);
    
    // Reduce speed based on storm intensity, but increase based on aggression
    const aggressionBonus = this.speed * 0.2 * this.aiAggression;
    const currentSpeed = (this.speed + aggressionBonus) * (1 - 0.3 * stormIntensity);
    
    this.body.velocity.x = worldForward.x * currentSpeed;
    this.body.velocity.z = worldForward.z * currentSpeed;

    // Random steering to avoid being too static
    // More erratic steering in heavy rain and with high aggression
    const steeringNoise = (Math.random() - 0.5) * (0.5 + stormIntensity + this.aiAggression * 0.5);
    this.body.angularVelocity.y = steeringNoise;

    this.mesh.position.copy(this.body.position as any);
    this.mesh.quaternion.copy(this.body.quaternion as any);
  }

  public destroy() {
    this.world.removeBody(this.body);
    this.scene.remove(this.mesh);
  }
}
