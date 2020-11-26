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

  private init(){
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xaaa);
    this.renderer.shadowMap.enabled = true;
    document.body.appendChild(this.renderer.domElement);

    const camera = this.makeCamera();
    camera.position.set(8, 4, 10).multiplyScalar(3);
    camera.lookAt(0, 0, 0);

    {
      const light = new THREE.DirectionalLight(0xfff, 1);
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
      const light = new THREE.DirectionalLight(0xfff, 1);
      light.position.set(1, 2, 4);
      this.scene.add(light);
    }


  }

  private makeCamera(fov = 40) {
    const aspect = 2;
    const zNear = .1;
    const zFar = 1000;
    return new THREE.PerspectiveCamera(fov, aspect, zNear, zFar);
  }
}
