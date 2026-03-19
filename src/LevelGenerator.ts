import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export interface TrackPoint {
  position: THREE.Vector3;
  tangent: THREE.Vector3;
  width: number;
}

export class LevelGenerator {
  private scene: THREE.Scene;
  private world: CANNON.World;
  private trackPoints: TrackPoint[] = [];
  private trackMesh: THREE.Mesh | null = null;

  constructor(scene: THREE.Scene, world: CANNON.World) {
    this.scene = scene;
    this.world = world;
  }

  public generateRiftValleyTrack(length: number = 2000, trackNarrowness: number = 0.5) {
    this.trackPoints = [];
    let currentPos = new THREE.Vector3(0, 0, 0);
    let currentDir = new THREE.Vector3(0, 0, 1);
    
    const segmentLength = 20;
    const numSegments = length / segmentLength;

    // Base width is 20, narrowness reduces it up to 15 units (min width 5)
    const baseWidth = 20 - (trackNarrowness * 15);

    for (let i = 0; i < numSegments; i++) {
      const t = i / numSegments;
      
      // Add Rift Valley characteristics: hairpins and elevation
      // Use sine waves and noise for elevation
      const elevation = Math.sin(t * 10) * 15 + Math.cos(t * 5) * 10;
      currentPos.y = elevation;

      // Add hairpins: sharp turns at certain intervals
      if (i > 0 && i % 15 === 0) {
        const turnAngle = (Math.random() > 0.5 ? 1 : -1) * Math.PI * 0.8; // Sharp 144 degree turn
        const rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), turnAngle);
        currentDir.applyQuaternion(rotation);
      } else {
        // Normal winding road
        const windingAngle = Math.sin(t * 20) * 0.2;
        const rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), windingAngle);
        currentDir.applyQuaternion(rotation);
      }

      this.trackPoints.push({
        position: currentPos.clone(),
        tangent: currentDir.clone(),
        width: baseWidth + Math.sin(t * 30) * (baseWidth * 0.2) // Varying width based on base
      });

      currentPos.add(currentDir.clone().multiplyScalar(segmentLength));
    }

    this.createTrackMesh();
    this.createTrackPhysics();
    this.addEnvironmentDetails();
  }

  private createTrackMesh() {
    const geometry = new THREE.PlaneGeometry(1, 1, 1, this.trackPoints.length - 1);
    const vertices = geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < this.trackPoints.length; i++) {
      const point = this.trackPoints[i];
      const side = new THREE.Vector3().crossVectors(point.tangent, new THREE.Vector3(0, 1, 0)).normalize();
      
      const left = point.position.clone().add(side.clone().multiplyScalar(point.width / 2));
      const right = point.position.clone().add(side.clone().multiplyScalar(-point.width / 2));

      // Left vertex
      vertices[i * 6] = left.x;
      vertices[i * 6 + 1] = left.y;
      vertices[i * 6 + 2] = left.z;

      // Right vertex
      vertices[i * 6 + 3] = right.x;
      vertices[i * 6 + 4] = right.y;
      vertices[i * 6 + 5] = right.z;
    }

    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: 0x8b4513, // Dirt brown
      roughness: 1,
      metalness: 0,
      side: THREE.DoubleSide
    });

    this.trackMesh = new THREE.Mesh(geometry, material);
    this.trackMesh.receiveShadow = true;
    this.scene.add(this.trackMesh);
  }

  private createTrackPhysics() {
    for (let i = 0; i < this.trackPoints.length - 1; i++) {
      const p1 = this.trackPoints[i];
      const p2 = this.trackPoints[i + 1];
      
      const center = p1.position.clone().add(p2.position).multiplyScalar(0.5);
      const diff = p2.position.clone().sub(p1.position);
      const length = diff.length();
      
      const shape = new CANNON.Box(new CANNON.Vec3(p1.width / 2, 0.1, length / 2));
      const body = new CANNON.Body({ mass: 0 });
      body.addShape(shape);
      body.position.set(center.x, center.y - 0.1, center.z);
      
      // Rotate body to align with track direction
      const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), diff.clone().normalize());
      body.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
      
      this.world.addBody(body);
    }
  }

  private addEnvironmentDetails() {
    // Add lush greenery along the track
    const bushGeom = new THREE.SphereGeometry(1, 8, 8);
    const bushMat = new THREE.MeshStandardMaterial({ color: 0x2d5a27 });

    for (let i = 0; i < this.trackPoints.length; i += 5) {
      const point = this.trackPoints[i];
      const side = new THREE.Vector3().crossVectors(point.tangent, new THREE.Vector3(0, 1, 0)).normalize();
      
      for (let j = 0; j < 3; j++) {
        const offset = (point.width / 2 + 2 + Math.random() * 10) * (Math.random() > 0.5 ? 1 : -1);
        const bushPos = point.position.clone().add(side.clone().multiplyScalar(offset));
        
        const bush = new THREE.Mesh(bushGeom, bushMat);
        bush.position.copy(bushPos);
        bush.scale.setScalar(0.5 + Math.random() * 1.5);
        bush.castShadow = true;
        this.scene.add(bush);
      }
    }
  }

  public getStartPosition(): THREE.Vector3 {
    return this.trackPoints[0]?.position.clone().add(new THREE.Vector3(0, 2, 0)) || new THREE.Vector3(0, 2, 0);
  }

  public getFinishPosition(): THREE.Vector3 {
    return this.trackPoints[this.trackPoints.length - 1]?.position.clone() || new THREE.Vector3(0, 0, 100);
  }
}
