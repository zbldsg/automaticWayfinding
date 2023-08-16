<script setup lang="ts">
import {ref, onMounted} from "vue";
import * as THREE from "three";
import AStar from "javascript-astar";

import {onWindowResize} from "./Common/resize";
import {initAll} from "./Init/init";
import {generateFloor} from "./Generate/floor";

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

const menu = ref({
  display: true,
});

onMounted(() => {
  dom = document.querySelector("#test");

  window.onresize = () => {
    onWindowResize(current.camera, renderers.renderer, dom);
  };

  init();
});

function init() {
  let data = {...baseSceneData};
  initAll(renderers, data, dom, current);
  // generateFloor(data);
  // initGrid();
  // initLine();
  // initBox();
  initT();
  animate();
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


function initT() {
  //length必须是偶数
  // let grid = [
  //   [1, 0, 1, 0, 1, 1],
  //   [1, 1, 1, 0, 0, 1],
  //   [0, 1, 0, 1, 0, 1],
  //   [1, 1, 1, 1, 1, 1]
  // ];

  //随机生成2维数组
  let grid = generateRandomGrid(20,22)

  // 执行A*搜索
  const result = astarSearch(grid,19,21);

  //初始化网格
  generateLine()
  //生成box
  map(grid)
  //生成路线
  generateRoad(grid, result)
}

function generateLine() {
  const gridHelper = new THREE.GridHelper(200, 200);
  current.scene.add(gridHelper);
}

function astarSearch(grid,x,y) {
  const graph = new AStar.Graph(grid, {diagonal: false});

  // 使用 A* 算法寻找路径
  const startNode = graph.grid[0][0];
  const endNode = graph.grid[x][y];

  // 执行A*搜索
  return AStar.astar.search(graph, startNode, endNode);
}

function generateRoad(grid, result) {
  //总长度 x轴, 二维数组的里层数组
  const length = grid[0].length;
  //总宽度 z轴 二维数组的外层数组
  const width = grid.length;

  let xNum = .5
  let zNum = -1.5

  let arr = []
  for (let i = 0; i < result.length; i++) {
    // result 的结果是这样[x:1,y:0] [x:1,y:1] [x:2,y:1] [x:3,y:1] [x:3,y:2] [x:3,y:3] [x:3,y:4] [x:3,y:5]
    arr.push(new THREE.Vector3(result[i].y - width / 2 - xNum, .5, result[i].x - length / 2 - zNum))
  }

  //加入起点
  arr.unshift(new THREE.Vector3(0 - width / 2 - xNum, .5, 0 - length / 2 - zNum))

  const pathMaterial = new THREE.LineBasicMaterial({color: 0xff0000, linewidth: 4});
  const pathGeometry = new THREE.BufferGeometry().setFromPoints(arr.map(node => new THREE.Vector3(node.x, node.y, node.z)));
  const pathLine = new THREE.Line(pathGeometry, pathMaterial);
  current.scene.add(pathLine);
}

function map(grid) {
  const one = grid.length;
  const two = grid[0].length;

  const matrix = new THREE.Matrix4();
  const box = new THREE.BoxGeometry(1, 1, 1);
  const black = new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: .8});
  const white = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: .1});
  const edges = new THREE.EdgesGeometry(box);
  const lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff})

  for (let i = 0; i < one; i++) {
    for (let j = 0; j < two; j++) {
      let cube;
      if (grid[i][j] === 0) {
        cube = new THREE.Mesh(box, black);
      } else {
        cube = new THREE.Mesh(box, white);
      }
      // 将矩阵应用到立方体的位置
      //x 为二维数组里层长度 减去内层长度的一半(移动到中心)
      //y 为二维数组外层长度 减去外层长度的一半(移动到中心)
      matrix.makeTranslation(j - two / 2 + 0.5, .5, i - one / 2 + 0.5);
      cube.applyMatrix4(matrix);
      current.scene.add(cube);

      const line = new THREE.LineSegments(edges, lineMaterial);
      line.position.set(cube.position.x, cube.position.y, cube.position.z);
      current.scene.add(line);


    }
  }

// 循环遍历二维数组，创建 Three.js 立方体表示地图
//   for (let i = 0; i < two; i++) {
//     for (let j = 0; j < one; j++) {
//       const box = new THREE.BoxGeometry(1, 1, 1);
//       const material = new THREE.MeshBasicMaterial({color: 0xff0000});
//       const cube = new THREE.Mesh(box, material);
//       console.log('i:' + i, 'j:' + j)
//
//       // 将矩阵应用到立方体的位置
//       matrix.makeTranslation(i - two / 2 + 0.5, 0, j - one / 2 + 0.5);
//       cube.applyMatrix4(matrix);
//
//       current.scene.add(cube);
//
//       const edges = new THREE.EdgesGeometry(box);
//       const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: 0xffffff}));
//       line.position.set(cube.position.x, cube.position.y, cube.position.z);
//
//       current.scene.add(line);
//     }
//   }
}

function generateRandomGrid(row,col) {
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

function generateBox(grid) {
  const m = grid.length;
  const n = grid[0].length;

  let box = new THREE.BoxGeometry(1, 1, 1);
  let blackMaterial = new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: .8});
  let grayMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: .1});
  let group = new THREE.Group();

  //总长度 x轴, 10个格子,二维数组的里层数组
  const length = n;
  //总宽度 z轴 8个格子,二维数组的外层数组
  const width = m;

  // 每隔几个格子生成一个方块
  const number = 1;

  for (let i = 0; i < width / number; i++) {
    for (let j = 0; j < length / number; j++) {
      let cube = new THREE.Mesh(box, grid[i][j] === 0 ? blackMaterial : grayMaterial);
      //这里number * j 是随着j的增大,不断往X正轴前移
      // - length/2 是为了让所有正方体正好落在x,y 轴的中心, 而不是右上角(因为x,y都是正的)
      /**
       * 这里number * j 是随着j的增大,不断往X正轴前移
       * - length/2 是为了让所有正方体正好落在x,y 轴的中心, 而不是右上角(因为x,y都是正的)
       * 这里x和y 都要加上0.5 也就是box大小的一半, 防止box放在4个格子中间
       */
      let x = number * j - length / 2 + .5;
      let z = number * i - width / 2 + .5;
      cube.position.set(x, 0.5, z);
      group.add(cube);

      const edges = new THREE.EdgesGeometry(box);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: 0xffffff}));
      line.position.set(x, 0.5, z);
      group.add(line);
    }
  }

  current.scene.add(group)
}

function initGrid() {
  // 创建一个图,二维数组
  const graph = new AStar.Graph([
    [1, 1, 1, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 1, 1, 1, 0],
    [0, 0, 0, 1, 1]
  ], {diagonal: false});

  // 使用 A* 算法寻找路径
  const startNode = graph.grid[0][0];
  const endNode = graph.grid[3][4];

  // 执行A*搜索
  const result = AStar.astar.search(graph, startNode, endNode);
  console.log(result, '我醉了')

}

function initBox() {
  let box = new THREE.BoxGeometry(1, 1, 1);
  let grayMaterial = new THREE.MeshBasicMaterial({color: 0xC0C0C0});
  let redMaterial = new THREE.MeshBasicMaterial({color: 0xC00000});
  let group = new THREE.Group();

  //总长度 x轴, 10个格子
  const length = 10;
  //总宽度 z轴 8个格子
  const width = 8;

  // 每隔几个格子生成一个方块
  const number = 1;

  for (let i = 0; i < width / number; i++) {
    for (let j = 0; j < length / number; j++) {
      let cube = null;
      if (j % 2 > 0) {
        cube = new THREE.Mesh(box, grayMaterial);
      } else {
        cube = new THREE.Mesh(box, redMaterial);
      }

      // if (salt <= randomNumber) {
      // let cube = new THREE.Mesh(box, material);
      //这里number * j 是随着j的增大,不断往X正轴前移
      // - length/2 是为了让所有正方体正好落在x,y 轴的中心, 而不是右上角(因为x,y都是正的)
      /**
       * 这里number * j 是随着j的增大,不断往X正轴前移
       * - length/2 是为了让所有正方体正好落在x,y 轴的中心, 而不是右上角(因为x,y都是正的)
       * 这里x和y 都要加上0.5 也就是box大小的一半, 防止box放在4个格子中间
       */
      let x = number * j - length / 2 + .5;
      let z = number * i - width / 2 + .5;
      cube.position.set(x, 0.5, z);
      group.add(cube);
      // }

    }
  }

  current.scene.add(group)
}
</script>

<template>
  <div class="test" id="test"></div>
</template>

<style lang="less">
.test {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #070a2b;
  background-size: 100%;
}
</style>
