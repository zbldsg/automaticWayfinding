import * as THREE from "three";

export function createLight(scene) {
  let ambientLight = new THREE.AmbientLight(0xffffff, 5);
  scene.add(ambientLight);
}
