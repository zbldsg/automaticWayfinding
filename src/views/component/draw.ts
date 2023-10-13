import * as THREE from "three";

let isMouseDown = false; // 标志鼠标是否按下

let boxGroup;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(1, 1);

const black = new THREE.Color(0x0000ff);
const white = new THREE.Color(0xffffff);
const red = new THREE.Color(0xff0000);
const green = new THREE.Color(0x00ff00);

let startMesh = null;
let endMesh = null;

let drawColor = black;

let current;
let activeButtonRef;

const onMouseDown = () => {
  isMouseDown = true;
};

const onMouseUp = () => {
  isMouseDown = false;
};

function onMouseClick(event: MouseEvent): void {
  //点击事件, 显示标签信息
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  if (isMouseDown) {
    // 根据在屏幕的二维位置以及相机的矩阵更新射线的位置
    raycaster.setFromCamera(mouse, current.camera);
    // 获取射线直线和所有模型相交的数组集合
    const intersects: Array<THREE.Object3D> = raycaster.intersectObjects(
      boxGroup.children,
      true
    );
    if (intersects.length > 0 && intersects[0].object) {
      let mesh = intersects[0].object;

      if (drawColor.equals(white) || drawColor.equals(black)) {
        mesh.material.color = drawColor;
        if (mesh.material.color.equals(white)) {
          mesh.material.opacity = 0.1;
        } else {
          mesh.material.opacity = 0.8;
        }
      } else {
        if (drawColor.equals(red) && mesh.material.color.equals(white)) {
          if (startMesh !== null) {
            startMesh.material.color = white;
            startMesh.material.opacity = 0.1;
          }
          startMesh = mesh;
          startMesh.material.color = red;
          startMesh.material.opacity = 0.8;
        } else if (
          drawColor.equals(green) &&
          mesh.material.color.equals(white)
        ) {
          if (endMesh !== null) {
            endMesh.material.color = white;
            endMesh.material.opacity = 0.1;
          }
          endMesh = mesh;
          endMesh.material.color = green;
          endMesh.material.opacity = 0.8;
        }
      }
    }
  }
}

//判断有没有被摁下
let ctrlKeyPressed = false;

const onCtrlDown = function (event: KeyboardEvent) {
  if (event.keyCode === 17 || event.key === "Control" || event.ctrlKey) {
    if (!ctrlKeyPressed) {
      ctrlKeyPressed = true; // 设置标志变量为 true
      current.orbitControls.enabled = false;
      window.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("mousemove", onMouseClick, false);
    }
  }
};

const onCtrlUp = function (event: KeyboardEvent) {
  if (event.keyCode === 17 || event.key === "Control" || event.ctrlKey) {
    ctrlKeyPressed = false;
    current.orbitControls.enabled = true;

    window.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mouseup", onMouseUp);
    window.removeEventListener("mousemove", onMouseClick, false);
  }
};

const startDraw = (
  data: any,
  group: THREE.Group,
  activeButton: { value: number }
) => {
  current = data;
  boxGroup = group;
  activeButtonRef = activeButton;
  window.addEventListener("keydown", onCtrlDown);
  window.addEventListener("keyup", onCtrlUp);
};

const setBlack = () => {
  drawColor = black;
  activeButtonRef.value = 1;
};

const setWhite = () => {
  drawColor = white;
  activeButtonRef.value = 2;
};

const setStartingPoint = () => {
  drawColor = red;
  activeButtonRef.value = 3;
};
const setEndPoint = () => {
  drawColor = green;
  activeButtonRef.value = 4;
};

export { startDraw, setBlack, setWhite, setStartingPoint, setEndPoint };
