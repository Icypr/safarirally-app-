import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { CarConfig, UpgradeConfig, upgrades } from './gameData';

export class VehicleController {
  public vehicle: CANNON.RaycastVehicle;
  public chassisBody: CANNON.Body;
  private world: CANNON.World;
  private scene: THREE.Scene;
  public mesh: THREE.Group;
  public config: CarConfig;
  public activeUpgrades: UpgradeConfig[];

  constructor(world: CANNON.World, scene: THREE.Scene, config: CarConfig, customColor?: string, ownedUpgradeIds: string[] = []) {
    this.world = world;
    this.scene = scene;
    this.config = config;
    this.activeUpgrades = upgrades.filter(u => ownedUpgradeIds.includes(u.id));

    // Calculate bonuses
    const engineBonus = this.activeUpgrades.filter(u => u.type === 'engine').reduce((acc, u) => acc + u.bonus, 0);
    const tireBonus = this.activeUpgrades.filter(u => u.type === 'tires').reduce((acc, u) => acc + u.bonus, 0);
    const suspensionBonus = this.activeUpgrades.filter(u => u.type === 'suspension').reduce((acc, u) => acc + u.bonus, 0);

    // Chassis
    const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2));
    this.chassisBody = new CANNON.Body({ mass: config.mass });
    this.chassisBody.addShape(chassisShape);
    this.chassisBody.position.set(0, 4, 0);
    this.chassisBody.angularVelocity.set(0, 0, 0);

    this.vehicle = new CANNON.RaycastVehicle({
      chassisBody: this.chassisBody,
      indexRightAxis: 0,
      indexUpAxis: 1,
      indexForwardAxis: 2,
    });

    // Wheel options
    const wheelOptions = {
      radius: 0.5,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: 30 + (suspensionBonus * 50),
      suspensionRestLength: 0.3,
      frictionSlip: 5 + (tireBonus * 10),
      dampingRelaxation: 2.3,
      dampingCompression: 4.4,
      maxSuspensionForce: 100000,
      rollInfluence: 0.01,
      axleLocal: new CANNON.Vec3(1, 0, 0),
      chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
      maxSuspensionTravel: 0.3,
      customSlidingRotationalSpeed: -30,
      useCustomSlidingRotationalSpeed: true,
    };

    // Add wheels
    const wheelPositions = [
      new CANNON.Vec3(-1, 0, 1.5),
      new CANNON.Vec3(1, 0, 1.5),
      new CANNON.Vec3(-1, 0, -1.5),
      new CANNON.Vec3(1, 0, -1.5),
    ];

    wheelPositions.forEach((pos) => {
      wheelOptions.chassisConnectionPointLocal.copy(pos);
      this.vehicle.addWheel(wheelOptions);
    });

    this.vehicle.addToWorld(this.world);

    // Visuals
    this.mesh = new THREE.Group();
    
    // Chassis Body
    const bodyGeom = new THREE.BoxGeometry(2, 0.8, 4);
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: customColor || config.color,
      roughness: 0.7,
      metalness: 0.3
    });
    const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    bodyMesh.castShadow = true;
    this.mesh.add(bodyMesh);

    // Cabin
    const cabinGeom = new THREE.BoxGeometry(1.8, 0.8, 1.5);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const cabinMesh = new THREE.Mesh(cabinGeom, cabinMat);
    cabinMesh.position.set(0, 0.8, -0.2);
    cabinMesh.castShadow = true;
    this.mesh.add(cabinMesh);

    // Wheels Visuals
    const wheelGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 24);
    wheelGeom.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222 });

    this.vehicle.wheelInfos.forEach(() => {
      const wheelMesh = new THREE.Mesh(wheelGeom, wheelMat);
      wheelMesh.castShadow = true;
      this.mesh.add(wheelMesh);
    });

    this.scene.add(this.mesh);

    // Store final engine force with bonus
    this.config = { ...config, engineForce: config.engineForce + engineBonus };
  }

  public update(viscosity: number) {
    // Apply viscosity: reduce max engine force and increase drag
    const speed = this.chassisBody.velocity.length();
    const dragForce = speed * speed * viscosity * 0.5;
    const dragVector = this.chassisBody.velocity.clone().scale(-dragForce);
    this.chassisBody.applyForce(dragVector, this.chassisBody.position);

    // Update visual mesh
    this.mesh.position.copy(this.chassisBody.position as any);
    this.mesh.quaternion.copy(this.chassisBody.quaternion as any);

    // Update wheel meshes
    for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
      this.vehicle.updateWheelTransform(i);
      const transform = this.vehicle.wheelInfos[i].worldTransform;
      const wheelMesh = this.mesh.children[i + 2]; // +2 because of body and cabin
      wheelMesh.position.copy(transform.position as any);
      wheelMesh.quaternion.copy(transform.quaternion as any);
    }
  }

  public applyInput(engineForce: number, steeringValue: number, brakeForce: number) {
    this.vehicle.applyEngineForce(engineForce, 2);
    this.vehicle.applyEngineForce(engineForce, 3);
    this.vehicle.setSteeringValue(steeringValue, 0);
    this.vehicle.setSteeringValue(steeringValue, 1);
    this.vehicle.setBrake(brakeForce, 0);
    this.vehicle.setBrake(brakeForce, 1);
    this.vehicle.setBrake(brakeForce, 2);
    this.vehicle.setBrake(brakeForce, 3);
  }
}
