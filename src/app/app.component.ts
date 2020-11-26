import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public scene = new THREE.Scene();
  public renderer = new THREE.WebGLRenderer({
    antialias: true
  });

  ngOnInit() {
    this.init();
  }

  private init() {
    try {
      // ================================================================= Renderer and Camera ==============================================================

      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setClearColor(0xaaaaaa);
      this.renderer.shadowMap.enabled = true;
      document.body.appendChild(this.renderer.domElement);

      const overAllcamera = this.makeCamera();
      overAllcamera.position.set(8, 4, 10).multiplyScalar(3);
      overAllcamera.lookAt(0, 0, 0);

      // ================================================================= Lights ==============================================================


      {
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 20, 0);
        this.scene.add(light);
        light.castShadow = true;
        light.shadow.mapSize.width = 2048
        light.shadow.mapSize.height = 2048

        const d = 50;
        light.shadow.camera.left = -d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 50;
        light.shadow.bias = .001;
      }

      {
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1, 2, 4);
        this.scene.add(light);
      }

      // ================================================================= Ground ==============================================================


      const groundGeometry = new THREE.PlaneBufferGeometry(50, 50);
      const groundMaterial = new THREE.MeshPhongMaterial({
        color: 0xcc8866
      });
      const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
      groundMesh.rotation.x = Math.PI * -.5;
      groundMesh.receiveShadow = true;
      this.scene.add(groundMesh);

      // ================================================================= Tank body & Tank Camera ==============================================================

      const carWidth = 4;
      const carHeight = 1;
      const carLength = 8;

      const tank = new THREE.Object3D();
      this.scene.add(tank);

      const bodyGeometry = new THREE.BoxBufferGeometry(carWidth, carHeight, carLength);
      const bodyMaterial = new THREE.MeshPhongMaterial({
        color: 0x6688aa
      });
      const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
      bodyMesh.position.y = 1.4;
      bodyMesh.castShadow = true;
      tank.add(bodyMesh);

      const tankCamFOV = 75;
      const tankCamera = this.makeCamera(tankCamFOV);
      tankCamera.position.y = 3;
      tankCamera.position.z = -6;
      tankCamera.rotation.y = Math.PI;
      bodyMesh.add(tankCamera);

      // ============================================================ Wheels ========================================================================

      const wheelRadius = 1;
      const wheelThickness = .5;
      const wheelSegments = 6;
      const wheelGeometry = new THREE.CylinderBufferGeometry(
        wheelRadius, // top radius
        wheelRadius, // bottom radius
        wheelThickness, // height of cylinder
        wheelSegments
      );
      const wheelMaterial = new THREE.MeshPhongMaterial({
        color: 0x888888
      });
      const wheelPositions = [
        [-carWidth / 2 - wheelThickness / 2, -carHeight / 2, carLength / 3],
        [carWidth / 2 + wheelThickness / 2, -carHeight / 2, carLength / 3],
        [-carWidth / 2 - wheelThickness / 2, -carHeight / 2, 0],
        [carWidth / 2 + wheelThickness / 2, -carHeight / 2, 0],
        [-carWidth / 2 - wheelThickness / 2, -carHeight / 2, -carLength / 3],
        [carWidth / 2 + wheelThickness / 2, -carHeight / 2, -carLength / 3],
      ];

      const wheelMeshes = wheelPositions.map(position => {
        const mesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
        mesh.position.set(position[0], position[1], position[2]);
        // mesh.position.set(...position);
        mesh.rotation.z = Math.PI * .5;
        mesh.castShadow = true;
        bodyMesh.add(mesh);
        return mesh;
      });

      // ============================================================= Dome =======================================================================

      const domeRadius = 2;
      const domeWidthSubdivisions = 12;
      const domeHeightSubdivisions = 12;
      const domePhiStart = 0;
      const domePhiEnd = Math.PI * 2;
      const domeThetaStart = 0;
      const domeThetaEnd = Math.PI * .5;
      const domeGeometry = new THREE.SphereBufferGeometry(
        domeRadius, domeWidthSubdivisions, domeHeightSubdivisions, domePhiStart,
        domePhiEnd, domeThetaStart, domeThetaEnd
      );
      const domeMesh = new THREE.Mesh(domeGeometry, bodyMaterial);
      domeMesh.castShadow = true;
      bodyMesh.add(domeMesh);
      domeMesh.position.y = .5;

// =============================================================== Turret & Turret camera ======================================================================

      const turretWidth = .1;
      const turretHeight = .1;
      const turretLength = carLength * .75 * .2;
      const turretGeometry = new THREE.BoxBufferGeometry(
        turretWidth, turretHeight, turretLength
      );
      const turretMesh = new THREE.Mesh(turretGeometry, bodyMaterial);
      const turretPivot = new THREE.Object3D();
      turretMesh.castShadow = true;
      turretPivot.scale.set(5, 5, 5);
      turretPivot.position.y = .5;
      turretMesh.position.z = turretLength * .5;
      turretPivot.add(turretMesh);
      bodyMesh.add(turretPivot);
      console.log('Body Mesh ->', bodyMesh);


      const turretCamera = this.makeCamera();
      turretCamera.position.y = .75 * .2;
      turretMesh.add(turretCamera);
      console.log('Turret Mesh ->', turretMesh);


      // ================================================================= Target & Target camera ==============================================================

      const targetGeometry = new THREE.SphereBufferGeometry(.5, 6, 3);
      const targetMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        flatShading: true
      });
      const targetMesh = new THREE.Mesh(targetGeometry, targetMaterial);
      const targetOrbit = new THREE.Object3D();
      const targetElevation = new THREE.Object3D();
      const targetBob = new THREE.Object3D();
      targetMesh.castShadow = true;
      this.scene.add(targetOrbit);
      targetOrbit.add(targetElevation);
      targetElevation.position.z = carLength * 2;
      targetElevation.position.y = 8;
      targetElevation.add(targetBob);
      targetBob.add(targetMesh);
      console.log('Target bob ->', targetBob);


      const targetCamera = this.makeCamera();
      const targetCameraPivot = new THREE.Object3D();
      targetCamera.position.y = 1;
      targetCamera.position.y = -2;
      targetCamera.rotation.y = Math.PI;
      targetBob.add(targetCameraPivot);
      targetCameraPivot.add(targetCamera);
      console.log('Target bob 2 ->', targetBob);

      // ================================================================= Sine-like wave ==============================================================

      const curve = new THREE.SplineCurve([
        new THREE.Vector2(-10, 0),
        new THREE.Vector2(-5, 5),
        new THREE.Vector2(0, 0),
        new THREE.Vector2(5, -5),
        new THREE.Vector2(10, 0),
        new THREE.Vector2(5, 10),
        new THREE.Vector2(-5, 10),
        new THREE.Vector2(-10, -10),
        new THREE.Vector2(-15, -8),
        new THREE.Vector2(-10, 0),
      ]);

      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0xff0000
      });
      const splineObject = new THREE.Line(geometry, material);
      splineObject.rotation.x = Math.PI * .5;
      splineObject.position.y = .05;
      this.scene.add(splineObject);

      // ================================================================= Target, Tank and Cameras ==============================================================

      const targetPosition = new THREE.Vector3();
      const tankPosition = new THREE.Vector2();
      const tankTarget = new THREE.Vector2();

      const cameras = [
        {cam: overAllcamera, desc: 'detached camera'},
        {cam: turretCamera, desc: 'on turret looking at target'},
        {cam: targetCamera, desc: 'near target looking at tank'},
        {cam: tankCamera, desc: 'above back of tank'},
      ];

      const infoElem = document.querySelector('#info');

      // ================================================================= Resize ==============================================================

      window.addEventListener('resize', () => {
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        cameras.forEach(cameraInfo => {
          const camera = cameraInfo.cam;
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
        });
      }, false);

      // ================================================================= Animate ==============================================================

      try {

        const animate = (time) => {
          // console.log('Time ->', time);

          time *= .001;

          // move target
          targetOrbit.rotation.y = time * .27;
          targetBob.position.y = Math.sin(time * 2) * 4;
          targetMesh.rotation.x = time * 7;
          targetMesh.rotation.y = time * 13;
          targetMaterial.emissive.setHSL(time * 10 % 1, 1, .25);
          targetMaterial.color.setHSL(time * 10 % 1, 1, .25);

          // move tank
          const tankTime = time * .05;
          curve.getPointAt(tankTime % 1, tankPosition);
          curve.getPointAt((tankTime + .01) % 1, tankTarget);
          tank.position.set(tankPosition.x, 0, tankPosition.y);
          tank.lookAt(tankTarget.x, 0, tankTarget.y);

          // face turret at target
          targetMesh.getWorldPosition(targetPosition);
          turretPivot.lookAt(targetPosition);

          // make turretCamera look at target
          turretCamera.lookAt(targetPosition);

          // make targetCameraPivot look at the tank
          tank.getWorldPosition(targetPosition);
          targetCameraPivot.lookAt(targetPosition);

          wheelMeshes.forEach(mesh => {
            mesh.rotation.x = time * 3;
          });

          const camera = cameras[time * .25 % cameras.length | 0];

          infoElem.textContent = camera.desc;

          this.renderer.render(this.scene, camera.cam);
          requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);

      } catch (error) {
        console.error('Error in animate() ->', error);
      }

    } catch (error) {
      console.error('Error in init() ->', error);
    }
  }

  private makeCamera(fov = 40) {
    const aspect = 2;
    const zNear = .1;
    const zFar = 1000;
    return new THREE.PerspectiveCamera(fov, aspect, zNear, zFar);
  }
}
