import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
const loader = new GLTFLoader()

export function generateFloor(data) {
  loader.load(data.path, gltf => {
    data.sceneObject = gltf.scene
    data.scene.add(gltf.scene)
  })
}