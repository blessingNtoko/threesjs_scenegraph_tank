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

      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setClearColor(0xaaaaaa);
      this.renderer.shadowMap.enabled = true;
      document.body.appendChild(this.renderer.domElement);

      const overAllcamera = this.makeCamera();
      overAllcamera.position.set(8, 4, 10).multiplyScalar(3);
      overAllcamera.lookAt(0, 0, 0);

      window.addEventListener('resize', () => {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        overAllcamera.aspect = window.innerWidth / window.innerHeight;
        overAllcamera.updateProjectionMatrix();
      }, false);

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

      const groundGeometry = new THREE.PlaneBufferGeometry(50, 50);
      const groundMaterial = new THREE.MeshPhongMaterial({
        color: 0xcc8866
      });
      const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
      groundMesh.rotation.x = Math.PI * -.5;
      groundMesh.receiveShadow = true;
      this.scene.add(groundMesh);

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

      try {

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
      } catch (error) {
        console.error('Error with wheels ->', error);
      }

      try {

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
      } catch (error) {
        console.error('Error with dome ->', error);
      }

      try {

        const turrentWidth = .1;
        const turretHeight = .1;
        const turretLength = carLength * .75 * .2;
        const turretGeometry = new THREE.BoxBufferGeometry(
          turrentWidth, turretHeight, turretLength
        );
        const turretMesh = new THREE.Mesh(turretGeometry, bodyMaterial);
        const turretPivot = new THREE.Object3D();
        turretMesh.castShadow = true;
        turretPivot.scale.set(5, 5, 5);
        turretPivot.position.y = .5;
        turretPivot.position.z = turretLength * .5;
        turretPivot.add(turretMesh);
        bodyMesh.add(turretPivot);
      } catch (error) {
        console.error('Error with turret ->', error);
      }


      try {

        const animate = () => {
          wheelMeshes.forEach(mesh => {
            mesh.rotation.x += .03;
          });

          this.renderer.render(this.scene, overAllcamera)
          requestAnimationFrame(animate);
        }
        animate();
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
