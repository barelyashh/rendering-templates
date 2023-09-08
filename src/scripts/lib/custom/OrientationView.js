class OrientationView {
  constructor(camera, scene, controls) {
    this.camera = camera;
    this.scene = scene;
    this.controls = controls;
  }

  change(orientation) {
    var boundingBox = new THREE.Box3();
    boundingBox.expandByObject(this.scene);
    var center = boundingBox.getCenter(new THREE.Vector3());
    var targetPosition = null;
    var cameraPosition = null;
    switch (orientation) {
      case "front":
        cameraPosition = this.camera.position;
        var distance = this.getDistance(boundingBox);
        targetPosition = new THREE.Vector3(
          center.x,
          center.y,
          center.z + distance
        );
        this.moveCamera(targetPosition, cameraPosition, center);
        break;
      case "back":
        cameraPosition = this.camera.position;
        var distance = this.getDistance(boundingBox);
        var targetPosition = new THREE.Vector3(
          center.x,
          center.y,
          center.z - distance
        );
        this.moveCamera(targetPosition, cameraPosition, center);
        break;
      case "left":
        cameraPosition = this.camera.position;
        var distance = this.getDistance(boundingBox);
        targetPosition = new THREE.Vector3(
          center.x + distance,
          center.y,
          center.z
        );
        this.moveCamera(targetPosition, cameraPosition, center);
        break;
      case "right":
        cameraPosition = this.camera.position;
        var distance = this.getDistance(boundingBox);
        targetPosition = new THREE.Vector3(
          center.x - distance,
          center.y,
          center.z
        );
        this.moveCamera(targetPosition, cameraPosition, center);
        break;
      case "top":
        cameraPosition = this.camera.position;
        var distance = this.getDistance(boundingBox);
        targetPosition = new THREE.Vector3(
          center.x,
          center.y + distance,
          center.z
        );
        this.moveCamera(targetPosition, cameraPosition, center);
        break;
      case "bottom":
        cameraPosition = this.camera.position;
        var distance = this.getDistance(boundingBox);
        targetPosition = new THREE.Vector3(
          center.x,
          center.y - distance,
          center.z
        );
        this.moveCamera(targetPosition, cameraPosition, center);
        break;
      case "isometric":
        cameraPosition = this.camera.position;
        var distance = this.getDistance(boundingBox);
        targetPosition = new THREE.Vector3(distance, distance, distance);
        this.moveCamera(targetPosition, cameraPosition, center);
        break;
    }
  }

  getDistance(boundingBox) {
    var distance = null;
    var offset = 3;
    var size = boundingBox.getSize(new THREE.Vector3());
    var maxSize = Math.max(size.x, size.y, size.z);
    var fitHeightDistance =
      maxSize / (2 * Math.atan((Math.PI * this.camera.fov) / 360));
    var fitWidthDistance = fitHeightDistance / this.camera.aspect;
    distance = offset * Math.max(fitHeightDistance, fitWidthDistance);
    return distance;
  }

  moveCamera(targetPosition, cameraPosition, center) {
    var _this = this;
    new TWEEN.Tween(cameraPosition)
      .to(targetPosition, 1000)
      .easing(TWEEN.Easing.Linear.None)
      .onStart(function () {
        new TWEEN.Tween(_this.controls.target)
          .to({ x: 0, y: 0, z: 0 }, 1000)
          .start();
      })
      .onUpdate(function () {
        _this.controls.update();
        _this.camera.lookAt(
          new THREE.Vector3(
            targetPosition.x,
            targetPosition.y,
            targetPosition.z
          )
        ); // center
      })
      .onComplete(function () {
        _this.controls.enabled = true;
        var lookDirection = new THREE.Vector3(center.x, center.y, center.z);
        _this.controls.target.copy(lookDirection);
      })
      .start();
  }
}
