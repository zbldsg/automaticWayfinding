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
  initLine();
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

  //随机数
  const randomNumber = 2;

  for (let i = 0; i < width / number; i++) {
    for (let j = 0; j < length / number; j++) {
      let cube = null;
      if (j % 2 > 0) {
        cube = new THREE.Mesh(box, grayMaterial);
      } else {
        cube = new THREE.Mesh(box, redMaterial);
      }
      // let salt = randomNum(1, 5);
      // console.log(salt, '我是')

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

function initLine() {
  const gridHelper = new THREE.GridHelper(200, 200);
  current.scene.add(gridHelper);
}

function randomNum(minNum, maxNum) {
  switch (arguments.length) {
    case 1:
      return parseInt(Math.random() * minNum + 1, 10);
      break;
    case 2:
      return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
      break;
    default:
      return 0;
      break;
  }
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

function initT() {
  //length必须是偶数
  let grid = [
    [1, 0, 1, 0, 1, 1],
    [1, 1, 1, 0, 0, 1],
    [0, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1]
  ];
  // 创建一个图,二维数组
  const graph = new AStar.Graph(grid, {diagonal: false});

  // 使用 A* 算法寻找路径
  const startNode = graph.grid[0][0];
  const endNode = graph.grid[3][5];

  // 执行A*搜索
  const result = AStar.astar.search(graph, startNode, endNode);
  console.log(result, '我醉了')
  console.log('[1,0]', '[1,1]', '[2,1]', '[3,1]', '[3,2]', '[3,3]', '[3,4]', '[3,5]')

  const m = grid.length;
  const n = grid[0].length;


  let box = new THREE.BoxGeometry(1, 1, 1);
  let blackMaterial = new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: .5});
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

  let num = .5
  let zNum = -1.5
  let arr = []
  for (let i = 0; i < result.length; i++) {
    arr.push(new THREE.Vector3(result[i].y - width / 2 - num, 1, result[i].x - length / 2 - zNum))
  }

  //加入起点
  arr.unshift(new THREE.Vector3(0 - width / 2 - num, 1, 0 - length / 2 - zNum))

  //加入终点
  // arr.push(new THREE.Vector3(4 - width / 2 - num, 1, 3 - length / 2 - zNum))

  console.log(arr,'c')

  const pathMaterial = new THREE.LineBasicMaterial({color: 0xff0000, linewidth: 4});
  const pathGeometry = new THREE.BufferGeometry().setFromPoints(arr.map(node => new THREE.Vector3(node.x, node.y, node.z)));
  const pathLine = new THREE.Line(pathGeometry, pathMaterial);
  current.scene.add(pathLine);


  // const curve = new THREE.CatmullRomCurve3(arr, false)
  // const geometry = new THREE.TubeGeometry( curve, 8, .2, 8, false );
  // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  // const mesh = new THREE.Mesh( geometry, material );
  // // mesh.position.set()
  // current.scene.add( mesh );

  // 定义格子的大小和间距
//   const gridSize = 1;
//   const gridSpacing = 1.1;
//
// // 循环遍历二维数组，创建 Three.js 网格表示地图
//   for (let i = 0; i < m; i++) {
//     for (let j = 0; j < n; j++) {
//       const cubeGeometry = new THREE.BoxGeometry(gridSize, gridSize, gridSize);
//       console.log(grid[i][j], '我是')
//       const cubeMaterial = new THREE.MeshBasicMaterial({color: grid[i][j] === 0 ? 0x000000 : 0xC0C0C0}); // 根据格子状态设置颜色
//       const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
//
//       // 将网格放置在三维空间中
//       cube.position.set(i * gridSpacing + .5, 0, j * gridSpacing + .5);
//       current.scene.add(cube);
//     }
//   }

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
