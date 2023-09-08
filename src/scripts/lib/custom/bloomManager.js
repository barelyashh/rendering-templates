class BloomManager {
  constructor(scene, camera, renderer, canvasWidth, canvasHeight) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.createBloom;
  }

  setBloom(bloom) {
    const pointLight = new THREE.PointLight(0xffffff, 1);
    this.camera.add(pointLight);
    const renderScene = new THREE.RenderPass(this.scene, this.camera);

    const bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(this.canvasWidth, this.canvasHeight),
      bloom.strength,
      bloom.radius,
      bloom.threshold
    );

    var composer = new THREE.EffectComposer(WebViewer.renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
  }

  disposebloom() {
    if (this.camera != null) {
      for (var i = 0; i < this.camera.children.length; i++) {
        this.camera.remove(this.camera.children[i]);
      }
    }
  }
}
