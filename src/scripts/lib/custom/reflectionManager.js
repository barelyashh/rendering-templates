class ReflectionManager {
  constructor(scene, reflector, canvasWidth, canvasHeight) {
    this.reflector = reflector;
    this.scene = scene;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.mirror = null;
  }

  createMirrorGeometry(geometry, texture) {
    var	materialCanvas = new THREE.MeshBasicMaterial( { map: texture } );
   this.mirror = new THREE.Mesh( geometry, materialCanvas)
    this.mirror.position.set(0, -10, 0);
    this.scene.add(this.mirror);
  }

  disposeMirrorGeometry() {
    if (this.mirror != null) {
      this.scene.remove(this.mirror);
    }
  }
}
