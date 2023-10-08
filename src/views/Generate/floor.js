import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
const loader = new GLTFLoader();

const generateFloor = (data) => {
  loader.load(data.path, (gltf) => {
    replaceMaterial(gltf.scene);
    data.sceneObject = gltf.scene;
    data.sceneObject.position.y = -1;
    data.scene.add(gltf.scene);
  });
};
function replaceMaterial(group) {
  group.traverse((item) => {
    if (item instanceof THREE.Mesh) {
      item.material.metalness = 0.1;
      item.material.needsUpdate = true;
    }
  });
}

export { generateFloor };
