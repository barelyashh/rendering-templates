/* class ColorsAndTextures {
  constructor(scene, entity) {
    this.scene = scene;
    this.entity = entity;
    this.planes = undefined;
    this.planeObjects = [];
    this.planeHelpers = undefined;
  }

  createPlaneStencilGroup(plane, renderOrder) {
    const group = new THREE.Group();
    const baseMat = new THREE.MeshBasicMaterial();
    baseMat.depthWrite = false;
    baseMat.depthTest = false;
    baseMat.colorWrite = false;
    baseMat.stencilWrite = true;
    baseMat.stencilFunc = THREE.AlwaysStencilFunc;

    // back faces
    const mat0 = baseMat.clone();
    mat0.side = THREE.BackSide;
    mat0.clippingPlanes = [plane];
    mat0.stencilFail = THREE.IncrementWrapStencilOp;
    mat0.stencilZFail = THREE.IncrementWrapStencilOp;
    mat0.stencilZPass = THREE.IncrementWrapStencilOp;

    const mesh0 = new THREE.Mesh(this.entities.geometry, mat0);
    mesh0.renderOrder = renderOrder;
    group.add(mesh0);

    // front faces
    const mat1 = baseMat.clone();
    mat1.side = THREE.FrontSide;
    mat1.clippingPlanes = [plane];
    mat1.stencilFail = THREE.DecrementWrapStencilOp;
    mat1.stencilZFail = THREE.DecrementWrapStencilOp;
    mat1.stencilZPass = THREE.DecrementWrapStencilOp;

    const mesh1 = new THREE.Mesh(this.entities.geometry, mat1);
    mesh1.renderOrder = renderOrder;

    group.add(mesh1);

    return group;
  }

  setPlaneForXAxis() {}
  setPlaneForYAxis() {}
  setPlaneForZAxis() {}

  getPlane() {
    var boundingBox = new THREE.Box3();
    boundingBox.expandByObject(this.entity);
    var distance = WebViewer.orientationMode.getDistance(boundingBox);
  }
}

let camera, scene, renderer, object, stats;
let planes, planeObjects, planeHelpers;
let clock;

const params = {
  animate: true,
  planeX: {
    constant: 0,
    negated: false,
    displayHelper: false,
  },
  planeY: {
    constant: 0,
    negated: false,
    displayHelper: false,
  },
  planeZ: {
    constant: 0,
    negated: false,
    displayHelper: false,
  },
};

init();
animate();

function createPlaneStencilGroup(geometry, plane, renderOrder) {
  const group = new THREE.Group();
  const baseMat = new THREE.MeshBasicMaterial();
  baseMat.depthWrite = false;
  baseMat.depthTest = false;
  baseMat.colorWrite = false;
  baseMat.stencilWrite = true;
  baseMat.stencilFunc = THREE.AlwaysStencilFunc;

  // back faces
  const mat0 = baseMat.clone();
  mat0.side = THREE.BackSide;
  mat0.clippingPlanes = [plane];
  mat0.stencilFail = THREE.IncrementWrapStencilOp;
  mat0.stencilZFail = THREE.IncrementWrapStencilOp;
  mat0.stencilZPass = THREE.IncrementWrapStencilOp;

  const mesh0 = new THREE.Mesh(geometry, mat0);
  mesh0.renderOrder = renderOrder;
  group.add(mesh0);

  // front faces
  const mat1 = baseMat.clone();
  mat1.side = THREE.FrontSide;
  mat1.clippingPlanes = [plane];
  mat1.stencilFail = THREE.DecrementWrapStencilOp;
  mat1.stencilZFail = THREE.DecrementWrapStencilOp;
  mat1.stencilZPass = THREE.DecrementWrapStencilOp;

  const mesh1 = new THREE.Mesh(geometry, mat1);
  mesh1.renderOrder = renderOrder;

  group.add(mesh1);

  return group;
}

function init() {
  planes = [
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0),
    new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
    new THREE.Plane(new THREE.Vector3(0, 0, -1), 0),
  ];

  planeHelpers = planes.map((p) => new THREE.PlaneHelper(p, 2, 0xffffff));
  planeHelpers.forEach((ph) => {
    ph.visible = false;
    scene.add(ph);
  });

  const geometry = new THREE.TorusKnotBufferGeometry(0.4, 0.15, 220, 60);
  object = new THREE.Group();
  scene.add(object);

  // Set up clip plane rendering
  planeObjects = [];
  const planeGeom = new THREE.PlaneBufferGeometry(4, 4);

  for (let i = 0; i < 3; i++) {
    const poGroup = new THREE.Group();
    const plane = planes[i];
    const stencilGroup = createPlaneStencilGroup(geometry, plane, i + 1);

    // plane is clipped by the other clipping planes
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0xe91e63,
      metalness: 0.1,
      roughness: 0.75,
      clippingPlanes: planes.filter((p) => p !== plane),

      stencilWrite: true,
      stencilRef: 0,
      stencilFunc: THREE.NotEqualStencilFunc,
      stencilFail: THREE.ReplaceStencilOp,
      stencilZFail: THREE.ReplaceStencilOp,
      stencilZPass: THREE.ReplaceStencilOp,
    });
    const po = new THREE.Mesh(planeGeom, planeMat);
    po.onAfterRender = function (renderer) {
      renderer.clearStencil();
    };

    po.renderOrder = i + 1.1;

    object.add(stencilGroup);
    poGroup.add(po);
    planeObjects.push(po);
    scene.add(poGroup);
  }

  const material = new THREE.MeshStandardMaterial({
    color: 0xffc107,
    metalness: 0.1,
    roughness: 0.75,
    clippingPlanes: planes,
    clipShadows: true,
    shadowSide: THREE.DoubleSide,
  });

  // add the color
  const clippedColorFront = new THREE.Mesh(geometry, material);
  clippedColorFront.castShadow = true;
  clippedColorFront.renderOrder = 6;
  object.add(clippedColorFront);

  planeX
    .add(params.planeX, "constant")
    .min(-1)
    .max(1)
    .onChange((d) => (planes[0].constant = d));

  planeX.open();

  planeY
    .add(params.planeY, "constant")
    .min(-1)
    .max(1)
    .onChange((d) => (planes[1].constant = d));

  planeY.open();

  planeZ
    .add(params.planeZ, "constant")
    .min(-1)
    .max(1)
    .onChange((d) => (planes[2].constant = d));

  planeZ.open();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  const delta = clock.getDelta();

  requestAnimationFrame(animate);

  if (params.animate) {
    object.rotation.x += delta * 0.5;
    object.rotation.y += delta * 0.2;
  }

  for (let i = 0; i < planeObjects.length; i++) {
    const plane = planes[i];
    const po = planeObjects[i];
    plane.coplanarPoint(po.position);
    po.lookAt(
      po.position.x - plane.normal.x,
      po.position.y - plane.normal.y,
      po.position.z - plane.normal.z
    );
  }

  stats.begin();
  renderer.render(scene, camera);
  stats.end();
}
 */
