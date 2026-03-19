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

    // Chassis Physics (Low-poly Box Collider)
    // We offset the shape downwards to lower the Center of Mass (CoM)
    const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.4, 2));
    this.chassisBody = new CANNON.Body({ 
      mass: config.mass,
      linearDamping: 0.1,
      angularDamping: 0.5
    });
    
    // Add shape with offset to lower the center of mass
    // The visual mesh will be centered, but the physics weight will be lower
    this.chassisBody.addShape(chassisShape, new CANNON.Vec3(0, -0.5, 0));
    
    this.chassisBody.position.set(0, 4, 0);
    this.chassisBody.angularVelocity.set(0, 0, 0);

    this.vehicle = new CANNON.RaycastVehicle({
      chassisBody: this.chassisBody,
      indexRightAxis: 0,
      indexUpAxis: 1,
      indexForwardAxis: 2,
    });

    // Wheel options (Enhanced for Rift Valley mud/viscosity)
    const wheelOptions = {
      radius: 0.6,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: 45 + (suspensionBonus * 60), // Increased for better ground clearance
      suspensionRestLength: 0.4,
      frictionSlip: 8 + (tireBonus * 15), // Better grip for mud
      dampingRelaxation: 3.5, // Better damping for heavy landings
      dampingCompression: 5.5,
      maxSuspensionForce: 200000,
      rollInfluence: 0.005, // Reduced to prevent flipping
      axleLocal: new CANNON.Vec3(1, 0, 0),
      chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
      maxSuspensionTravel: 0.5,
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
    
    // 1. Visual Mesh (High-detail procedural truck)
    // In a production environment, this is where you would use GLTFLoader to load models
    // like the Peugeot 504 or Toyota Hilux.
    const bodyGeom = new THREE.BoxGeometry(2.1, 0.6, 4.2);
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: customColor || config.color,
      roughness: 0.8,
      metalness: 0.2
    });
    const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    bodyMesh.position.y = 0.3;
    bodyMesh.castShadow = true;
    this.mesh.add(bodyMesh); // Index 0

    const cabinGeom = new THREE.BoxGeometry(1.9, 0.9, 1.8);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const cabinMesh = new THREE.Mesh(cabinGeom, cabinMat);
    cabinMesh.position.set(0, 1.0, 0.2);
    cabinMesh.castShadow = true;
    this.mesh.add(cabinMesh); // Index 1

    const bedGeom = new THREE.BoxGeometry(1.9, 0.4, 1.8);
    const bedMesh = new THREE.Mesh(bedGeom, bodyMat);
    bedMesh.position.set(0, 0.8, -1.2);
    bedMesh.castShadow = true;
    this.mesh.add(bedMesh); // Index 2

    const cageGeom = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
    const cageMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const bar1 = new THREE.Mesh(cageGeom, cageMat);
    bar1.rotation.z = Math.PI / 2;
    bar1.position.set(0, 1.5, 0.2);
    this.mesh.add(bar1); // Index 3

    // Wheels Visuals (Rugged Off-road Tires)
    const wheelGeom = new THREE.CylinderGeometry(0.6, 0.6, 0.5, 24);
    wheelGeom.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });

    this.vehicle.wheelInfos.forEach(() => {
      const wheelMesh = new THREE.Mesh(wheelGeom, wheelMat);
      wheelMesh.castShadow = true;
      this.mesh.add(wheelMesh); // Indices 4-7
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

    // 1. Implement Downforce: Downforce = Constant * Speed^2
    // This keeps the car glued to the track at high speeds
    const downforceConstant = 1.5;
    const downforceMagnitude = downforceConstant * speed * speed;
    const downforceVector = new CANNON.Vec3(0, -downforceMagnitude, 0);
    this.chassisBody.applyForce(downforceVector, this.chassisBody.position);

    // 2. Anti-Roll Bar Logic
    // Distribute pressure between left and right wheels to prevent flipping during sharp turns
    this.applyAntiRollBar(0, 1); // Front axle
    this.applyAntiRollBar(2, 3); // Rear axle

    // Update visual mesh
    this.mesh.position.copy(this.chassisBody.position as any);
    this.mesh.quaternion.copy(this.chassisBody.quaternion as any);

    // Update wheel meshes
    for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
      this.vehicle.updateWheelTransform(i);
      const transform = this.vehicle.wheelInfos[i].worldTransform;
      const wheelMesh = this.mesh.children[i + 4]; // +4 because of body, cabin, bed, and bar
      wheelMesh.position.copy(transform.position as any);
      wheelMesh.quaternion.copy(transform.quaternion as any);
    }
  }

  private applyAntiRollBar(wheelIndexL: number, wheelIndexR: number) {
    const wheelL = this.vehicle.wheelInfos[wheelIndexL];
    const wheelR = this.vehicle.wheelInfos[wheelIndexR];
    
    const travelL = wheelL.suspensionRelativeVelocity; // Using velocity as proxy for travel difference
    const travelR = wheelR.suspensionRelativeVelocity;
    
    const antiRollForce = (travelL - travelR) * 1000;
    
    if (wheelL.isInContact) {
      this.chassisBody.applyForce(new CANNON.Vec3(0, -antiRollForce, 0), wheelL.chassisConnectionPointWorld);
    }
    if (wheelR.isInContact) {
      this.chassisBody.applyForce(new CANNON.Vec3(0, antiRollForce, 0), wheelR.chassisConnectionPointWorld);
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
