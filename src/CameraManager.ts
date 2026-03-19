import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export enum CameraMode {
  CHASE,
  COCKPIT,
  CINEMATIC
}

export class CameraManager {
  private camera: THREE.PerspectiveCamera;
  private mode: CameraMode = CameraMode.CHASE;
  private target: CANNON.Body;
  private lerpFactor: number = 0.1;

  constructor(camera: THREE.PerspectiveCamera, target: CANNON.Body) {
    this.camera = camera;
    this.target = target;
  }

  public setMode(mode: CameraMode) {
    this.mode = mode;
  }

  public toggleMode() {
    this.mode = (this.mode + 1) % 3;
  }

  public update(deltaTime: number, isJumping: boolean) {
    const chassisPos = this.target.position;
    const chassisQuat = this.target.quaternion;
    const threeQuat = new THREE.Quaternion(chassisQuat.x, chassisQuat.y, chassisQuat.z, chassisQuat.w);

    let targetPos = new THREE.Vector3();
    let lookAtPos = new THREE.Vector3(chassisPos.x, chassisPos.y, chassisPos.z);

    // Cinematic Jump Cam: If vehicle's Y-axis velocity exceeds a threshold
    if (isJumping && this.mode !== CameraMode.COCKPIT) {
      // Cinematic Jump Cam: side profile
      const sideOffset = new THREE.Vector3(15, 2, 0).applyQuaternion(threeQuat);
      targetPos.copy(lookAtPos).add(sideOffset);
      this.camera.position.lerp(targetPos, 0.05);
      this.camera.lookAt(lookAtPos);
      return;
    }

    switch (this.mode) {
      case CameraMode.CHASE:
        const chaseOffset = new THREE.Vector3(0, 4, -10).applyQuaternion(threeQuat);
        targetPos.copy(lookAtPos).add(chaseOffset);
        this.camera.position.lerp(targetPos, this.lerpFactor);
        this.camera.lookAt(lookAtPos.add(new THREE.Vector3(0, 1, 5).applyQuaternion(threeQuat)));
        break;

      case CameraMode.COCKPIT:
        const cockpitOffset = new THREE.Vector3(0, 0.8, 0.5).applyQuaternion(threeQuat);
        targetPos.copy(lookAtPos).add(cockpitOffset);
        this.camera.position.copy(targetPos);
        const lookForward = new THREE.Vector3(0, 0, 10).applyQuaternion(threeQuat);
        this.camera.lookAt(lookAtPos.add(lookForward));
        break;

      case CameraMode.CINEMATIC:
        // Slow cinematic pan
        const time = performance.now() * 0.001;
        const cinOffset = new THREE.Vector3(
          Math.sin(time) * 12,
          6,
          Math.cos(time) * 12
        ).applyQuaternion(threeQuat);
        targetPos.copy(lookAtPos).add(cinOffset);
        this.camera.position.lerp(targetPos, 0.02);
        this.camera.lookAt(lookAtPos);
        break;
    }
  }

  public getMode(): CameraMode {
    return this.mode;
  }
}
