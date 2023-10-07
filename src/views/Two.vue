<script setup lang="ts">
import { ref, onMounted } from "vue";
import * as THREE from "three";
import AStar from "javascript-astar";
import { gsap } from "gsap";

import { onWindowResize } from "./Common/resize";
import { deleteGroupFromScene } from "./Common/clean";
import { initAll } from "./Init/init";

const renderers = {
  renderer: null,
  labelRenderer: null,
};

const current = {
  scene: null,
  camera: null,
  orbitControls: null,
  data: null,
};

let dom;

// 所有场景List
const baseSceneData = {
  id: null,
  name: null,
  path: "./model/city.glb",
  init: false,
  camera: null,
  control: null,
  scene: null,
  sceneObject: null,
};

let cube,
  line,
  boxGroup = new THREE.Group(),
  edgeGroup = new THREE.Group();

let raycaster, mouse;
let black = new THREE.Color(0x000000);
let white = new THREE.Color(0xffffff);

onMounted(() => {
  dom = document.querySelector("#test");

  window.onresize = () => {
    onWindowResize(current.camera, renderers.renderer, dom);
  };

  init();
});

function init() {
  let data = { ...baseSceneData };
  initAll(renderers, data, dom, current);
  initRaycaster();
  window.addEventListener("click", onMouseClick, false);
  //初始化网格
  generateLine();
  animate();
}

function initRaycaster() {
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2(1, 1);
}

function onMouseClick(event: MouseEvent): void {
  //点击事件, 显示标签信息
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // 根据在屏幕的二维位置以及相机的矩阵更新射线的位置
  raycaster.setFromCamera(mouse, current.camera);
  // 获取射线直线和所有模型相交的数组集合
  const intersects: Array<THREE.Object3D> = raycaster.intersectObjects(
    boxGroup.children,
    true
  );
  if (intersects.length > 0 && intersects[0].object) {
    console.log("点击位置");
    console.log("x:" + intersects[0].point.x, "z:" + intersects[0].point.z);

    let mesh = intersects[0].object;
    //如果是白色, 设为黑色
    if (mesh.material.color.equals(white)) {
      mesh.material.color = black;
      mesh.material.opacity = 0.8;
    } else {
      //如果是黑色, 设为白色
      mesh.material.color = white;
      mesh.material.opacity = 0.1;
    }
  }
}

function animate() {
  render();
  requestAnimationFrame((time) => {
    animate();
  });
}

function render() {
  renderers.renderer.render(current.scene, current.camera);
  renderers.labelRenderer.render(current.scene, current.camera);
}

function generateLine() {
  const gridHelper = new THREE.GridHelper(200, 200);
  current.scene.add(gridHelper);
}

function deleteAll() {
  deleteGroupFromScene(current.scene, boxGroup);
  deleteGroupFromScene(current.scene, edgeGroup);
  deleteGroupFromScene(current.scene, cube);
  deleteGroupFromScene(current.scene, line);
  cube = null;
  line = null;
  boxGroup = new THREE.Group();
  edgeGroup = new THREE.Group();
}

function generate() {
  deleteAll();

  initT(row.value, row.value);
}

function initT(row: number, col: number) {
  //随机生成2维数组
  let grid = generateRandomGrid(row, col);
  console.log(grid, "grid");

  //生成boxGroup
  generateBoxGroup(grid);

  // 执行A*搜索
  const result = astarSearch(grid, row - 1, col - 1);
  console.log(result, "result");

  //生成路线
  generateRoad(grid, result);
}

/**
 * 生成随机的二维数组,根据传入的行和列
 * @param row
 * @param col
 */
function generateRandomGrid(row: number, col: number): number[][] {
  const grid = [];
  for (let i = 0; i < row; i++) {
    const row = [];
    for (let j = 0; j < col; j++) {
      const randomValue = Math.random() < 0.1 ? 0 : 1; // 随机生成 0 或 1
      row.push(randomValue);
    }
    grid.push(row);
  }
  return grid;
}

function astarSearch(grid: number[][], x: number, y: number) {
  const graph = new AStar.Graph(grid, { diagonal: false });

  // 使用 A* 算法寻找路径
  const startNode = graph.grid[0][0];
  const endNode = graph.grid[x][y];

  // 执行A*搜索
  return AStar.astar.search(graph, startNode, endNode);
}

/**
 * 根据生成的二维数组,生成所有盒子
 * 如果是1,生成白色盒子, 如果是0生成黑色盒子(表示路障)
 * @param grid
 */
function generateBoxGroup(grid: number[][]) {
  const outer = grid.length;
  const inner = grid[0].length;

  const matrix = new THREE.Matrix4();
  const box = new THREE.BoxGeometry(1, 1, 1);
  const black = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.8,
  });
  const white = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.1,
  });
  const edges = new THREE.EdgesGeometry(box);
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

  for (let i = 0; i < outer; i++) {
    //内部创建一个group
    const innerGroup = new THREE.Group();
    for (let j = 0; j < inner; j++) {
      let cube;
      if (grid[i][j] === 0) {
        cube = new THREE.Mesh(box, black.clone());
      } else {
        cube = new THREE.Mesh(box, white.clone());
      }
      // 将矩阵应用到立方体的位置
      //x 为二维数组里层长度 减去内层长度的一半(移动到中心)
      //y 为二维数组外层长度 减去外层长度的一半(移动到中心)
      let x = j - inner / 2 + 0.5;
      let z = i - outer / 2 + 0.5;
      matrix.makeTranslation(x, 0.5, z);
      cube.applyMatrix4(matrix);
      innerGroup.add(cube);

      //生成盒子边框
      const edgeLine = new THREE.LineSegments(edges, lineMaterial);
      edgeLine.position.set(cube.position.x, cube.position.y, cube.position.z);
      edgeGroup.add(edgeLine);
    }
    boxGroup.add(innerGroup);
  }

  current.scene.add(boxGroup);
  current.scene.add(edgeGroup);

  console.log(boxGroup, "Group");
}

/**
 *
 * @param grid 生成路线
 * @param result
 */
function generateRoad(grid: number[][], result: any) {
  //总长度 x轴, 二维数组的里层数组
  const length = grid[0].length;
  //总宽度 z轴 二维数组的外层数组
  const width = grid.length;

  let xNum = -0.5;
  let zNum = -0.5;

  let arr = [];
  for (let i = 0; i < result.length; i++) {
    // result 的结果是这样[x:1,y:0] [x:1,y:1] [x:2,y:1] [x:3,y:1] [x:3,y:2] [x:3,y:3] [x:3,y:4] [x:3,y:5]
    arr.push(
      new THREE.Vector3(
        result[i].y - width / 2 - xNum,
        0.5,
        result[i].x - length / 2 - zNum
      )
    );
  }

  //加入起点
  arr.unshift(
    new THREE.Vector3(0 - width / 2 - xNum, 0.5, 0 - length / 2 - zNum)
  );

  const pathMaterial = new THREE.LineBasicMaterial({
    color: 0xff0000,
    linewidth: 4,
  });
  const pathGeometry = new THREE.BufferGeometry().setFromPoints(
    arr.map((node) => new THREE.Vector3(node.x, node.y, node.z))
  );
  line = new THREE.Line(pathGeometry, pathMaterial);
  current.scene.add(line);

  anima(arr);
}

function anima(arr) {
  if (!cube) {
    const box = new THREE.BoxGeometry(1, 1, 1);
    const black = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.8,
    });
    cube = new THREE.Mesh(box, black);

    cube.position.set(arr[0].x, 0.5, arr[0].z);
    current.scene.add(cube);
  } else {
    cube.position.set(arr[0].x, 0.5, arr[0].z);
  }

  let count = 0;

  gsap.to(cube.position, {
    duration: arr.length / 10,
    onUpdate: () => {
      if (Math.random() < 0.2) {
        if (count < arr.length) {
          cube.position.set(arr[count].x, 0.5, arr[count].z);
          count++;
        }
      }
    },
  });
}

/**
 *
 * @param grid 根据盒子生成数组
 */
function generateArrayBasedOnBoxes(): number[][] {
  const grid = [];

  const outer = boxGroup.children.length;
  const inner = boxGroup.children[0].children.length;
  for (let i = 0; i < outer; i++) {
    const row = [];
    for (let j = 0; j < inner; j++) {
      let material = boxGroup.children[i].children[j].material;
      row.push(material.color.equals(black) ? 0 : 1);
    }
    grid.push(row);
  }

  console.log(grid, "我是数组");

  return grid;
}

const row = ref(10);

const numbers = ref([
  { name: "10*10", value: 10 },
  { name: "20*20", value: 20 },
  { name: "30*30", value: 30 },
  { name: "40*40", value: 40 },
]);
</script>

<template>
  <div class="test" id="test">
    <div class="menu">
      <button @click="generate">生成地图</button>
      <button @click="deleteAll">删除</button>
      <button @click="generateArrayBasedOnBoxes">生成数组</button>
      <div>
        <label for="rowSelect">地图大小：</label>
        <select id="rowSelect" v-model="row">
          <option v-for="num in numbers" :key="num" :value="num.value">
            {{ num.name }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<style lang="less">
.test {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #070a2b;
  background-size: 100%;

  .menu {
    z-index: 200;
    position: absolute;
    padding-left: 20px;
    height: 80px;
    width: 150px;
    background-color: white;
  }
}
</style>
