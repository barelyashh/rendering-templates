class IsolateManager {
    constructor(scene, model, camera, controls) {
        this.scene = scene;
        this.model = model;
        this.camera = camera;
        this.controls = controls;
    }
  
    isolateSelected(selected) {
        if ( selected != null) {
        for (var i = 0; i < selected.length; i++) {
            switch (selected[i].type) {
              case "mesh":
                {
                  this.isolateSelectedMesh(
                    selected[i].item,
                  );
                }
                break;
              case "face":
               
                break;
              case "group":
                {
                  this.isolateSelectedGroup(
                    selected[i].item,
                    cameraPosition,
                    targetPosition
                  );
                }
                break;
            }
          }
        }
    }
  
    isolateSelectedMesh(selected) {
        this.model[0].traverse(function (child) {
            if(!child.isGroup){
                if(child.uuid == selected.object.uuid){
                 child.visible = true  ;
                } else{
                    child.visible = false; 
                }
            }
          });
         this.getCameraCoordinates();
    }

    isolateSelectedFace(selected) {
        selected.object.visible = false;
    }

    isolateSelectedGroup(selected) {
        selected.visible = false;
    }

    isolateAll(selected){
        this.model[0].traverse(function (child) {
            if(!child.isGroup){
                if(child.uuid == selected.object.uuid){
                 child.visible = true  ;
                } else{
                    child.visible = false; 
                }
              
            }
          });
    }

    getCameraCoordinates(){
        var boundingBox = new THREE.Box3();
        boundingBox.expandByObject(this.scene);
        var center = boundingBox.getCenter(new THREE.Vector3());
        var targetPosition = null;
        var cameraPosition = null;
        cameraPosition = this.camera.position;
        var distance = this.getDistance(boundingBox);
        console.log(distance)
        targetPosition = new THREE.Vector3(
        center.x,
        center.y + distance ,
        center.z + distance 
      );
      this.moveCamera(targetPosition, cameraPosition, center);
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
    
    
      getDistance(boundingBox) {
        var distance = null;
        var offset = 4;
        var size = boundingBox.getSize(new THREE.Vector3());
        var maxSize = Math.max(size.x, size.y, size.z);
        var fitHeightDistance =
          maxSize / (2 * Math.atan((Math.PI * this.camera.fov) / 360));
        var fitWidthDistance = fitHeightDistance / this.camera.aspect;
        distance = offset * Math.max(fitHeightDistance, fitWidthDistance);
        return distance;
      }
    
  }
  