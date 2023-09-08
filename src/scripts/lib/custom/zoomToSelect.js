
function zoom(event) {
    var intersects = raycasterIntersect(event);
    if (intersects.length > 0) {

        var offset = offset || 3;

        var boundingBox = new THREE.Box3();

        boundingBox.setFromObject(intersects[0].object);

        var center = boundingBox.getCenter(new THREE.Vector3());
        var size = boundingBox.getSize(new THREE.Vector3());

    

        var maxSize = Math.max(size.x, size.y, size.z);
        var fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * camera.fov / 360));
        var fitWidthDistance = fitHeightDistance / camera.aspect;
        var distance = offset * Math.max(fitHeightDistance, fitWidthDistance);

        var direction = controlsT.target.clone()
            .sub(camera.position)
            .normalize()
            .multiplyScalar(distance);

        controlsT.maxDistance = distance * 1000;
        controlsT.target.copy(center);

        camera.near = distance / 1000;
        camera.far = distance * 1000;
        camera.updateProjectionMatrix();

        camera.position.copy(controlsT.target).sub(direction);

        controlsT.update();

    }
    render()
}