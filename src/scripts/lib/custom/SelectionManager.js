class SelectItem {
  constructor(item, type, defaultColor, defaultTexture) {
    this.item = item;
    this.type = type;
    this.defaultColor = defaultColor;
    this.defaultTexture = defaultTexture;
  }
}

class SelectionManager {
  constructor(canvas, entities, camera, scene) {
    this.scene = scene;
    this.canvas = canvas;
    this.camera = camera;
    this.entities = entities;
    this.selectedEntities = [];
    this.level = "mesh";

    this.onClicked = function (event) {
      this.onCanvasClicked(event);
    };
    this.onClickHandler = this.onClicked.bind(this);

    this.onDocumentKeyDown = function (event) {
      this.ctrlKeyDown(event);
    };
    this.onDocumentKeyDownHandler = this.onDocumentKeyDown.bind(this);

    this.onDocumentKeyUp = function (event) {
      this.ctrlKeyUp(event);
    };
    this.onDocumentUpDownHandler = this.onDocumentKeyUp.bind(this);

    this.zoomToFit = function (event){
      this.onCanvasDblClicked(event);
    };
    
    this.zoomToFitHandler = this.zoomToFit.bind(this);
  }

  start() {
    this.canvas.addEventListener("click", this.onClickHandler, false);
    document.addEventListener("keydown", this.onDocumentKeyDownHandler, false);
    document.addEventListener("keyup", this.onDocumentUpDownHandler, false);
  }

  stop() {
    this.canvas.removeEventListener("click", this.onClickHandler, false);
    document.removeEventListener(
      "keydown",
      this.onDocumentKeyDownHandler,
      false
    );
    document.removeEventListener("keyup", this.onDocumentUpDownHandler, false);
  }

  startZoomToSelectListener(){
    document.addEventListener("dblclick", this.zoomToFit, false);
  }

  onCanvasDblClicked(event){
    //function to zoom to fit object at the center of the screen
    console.log('yash')
  }

  ctrlKeyDown(event) {
    switch (event.keyCode) {
      case 17:
        this.isCtrlDown = true;
        break;
    }
  }

  ctrlKeyUp(event) {
    switch (event.keyCode) {
      case 17:
        this.isCtrlDown = false;
        break;
    }
  }

  onCanvasClicked(event) {
    var mouse = new THREE.Vector3();
    var raycaster = new THREE.Raycaster();
    mouse.x =
      ((event.clientX - this.canvas.offsetLeft) / this.canvas.clientWidth) * 2 -
      1;
    mouse.y =
      -((event.clientY - this.canvas.offsetTop) / this.canvas.clientHeight) *
        2 +
      1;
    raycaster.setFromCamera(mouse, this.camera);
    var intersects = raycaster.intersectObjects(this.entities, true); // an array containing all entities in the scene with which the ray intersects
    if (intersects.length > 0) {
      if (this.isCtrlDown) {
        var inter =  this.returnIntersected(intersects);
        this.select(inter);
      } else {
        if (this.selectedEntities.length > 0) {
          this.deSelect();
        }
        this.clearSelectedEntities();
        var inter =  this.returnIntersected(intersects);
        this.select(inter);
      }
    } else {
      this.deSelect();
      this.clearSelectedEntities();
    }
  }

  returnIntersected(intersect) {
    var num = 0;
    intersect.forEach((element, i) => {
      if(!element.object.visible){
        num =  i+1;
      }
      return;
   });
   return intersect[num];
  }

  select(selected) {
    var level = this.getLevel();
    switch (level) {
      case "mesh":
        {
          this.highlightMesh(selected);
        }
        break;
      case "face":
        {
          this.highlightFace(selected);
        }
        break;
      case "group":
        {
          this.highlightGroup(selected);
        }
        break;
    }
  }

  highlightMesh(selected) {
    if (selected.object instanceof THREE.Mesh) {
      //Mesh
      this.setHighlightColorForMesh(selected);
    }
  }

  highlightFace(selected) {
    if (selected.face instanceof THREE.Face3) {
      //Face
      this.setHighlightColorForFace(selected);
    }
  }

  highlightGroup(selected) {
    if (selected.object.parent instanceof THREE.Group) {
      //Group
      this.setHighLightColorForGroup(selected);
    }
  }

  setHighlightColorForMesh(selected) {
    var highlightColor = 0xb4004b;
    var defaultColor = null;
    var defaultTexture = null;
    if (selected.object.material.isMaterial) {
      defaultColor = selected.object.material.color.getHex();
      selected.object.material.color.setHex(highlightColor);
      selected.object.material.colorsNeedUpdate = true;
    }
    if (selected.object.material.length > 0) {
      var materialIndex = selected.face.materialIndex;
      defaultColor = selected.object.material[materialIndex].color.getHex();
      selected.object.material[materialIndex].color.setHex(highlightColor);
      selected.object.material.colorsNeedUpdate = true;
    }
    this.selectedEntities.push(
      new SelectItem(selected, "mesh", defaultColor, defaultTexture)
    );
  }

  setHighlightColorForFace(selected) {
    var highlightColor = 0x0080ff;
    var defaultColor = null;
    var defaultTexture = null;
    if (selected.object.geometry instanceof THREE.BufferGeometry) {
      //Using intersection face a, b, c properties to get x, y, z from position bufferattribute
      let positionAttribute = selected.object.geometry.attributes["position"];
      let aVertex = new THREE.Vector3(
        positionAttribute.getX(selected.face.a),
        positionAttribute.getY(selected.face.a),
        positionAttribute.getZ(selected.face.a)
      );
      let bVertex = new THREE.Vector3(
        positionAttribute.getX(selected.face.b),
        positionAttribute.getY(selected.face.b),
        positionAttribute.getZ(selected.face.b)
      );
      let cVertex = new THREE.Vector3(
        positionAttribute.getX(selected.face.c),
        positionAttribute.getY(selected.face.c),
        positionAttribute.getZ(selected.face.c)
      );

      var geom = new THREE.Geometry(); // constructing triangle using calculated vertices and render it.
      geom.vertices.push(aVertex);
      geom.vertices.push(bVertex);
      geom.vertices.push(cVertex);
      geom.faces.push(new THREE.Face3(0, 1, 2));
      geom.computeFaceNormals();
      var material = new THREE.MeshLambertMaterial({});
      material.color.setHex(highlightColor);
      var mesh = new THREE.Mesh(geom, material);
      mesh.name = "face";
      this.scene.add(mesh);
    } else {
      defaultColor = selected.face.color.getHex();
      selected.face.color.setHex(highlightColor);
      selected.object.geometry.colorsNeedUpdate = true;
    }
    this.selectedEntities.push(
      new SelectItem(selected, "face", defaultColor, defaultTexture)
    );
  }

  setHighLightColorForGroup(selected) {
    var highlightColor = 0x7b3bb3;
    var defaultColor = 0xffffff;
    var defaultTexture = null;
    var group = this.getContainerObjByChild(selected.object);
    group.traverse((object) => {
      if (object.isMesh) {
        if (!object.material.length > 0) {
          defaultColor = object.material.color.getHex();
        }
        if (object.material.map) {
          defaultTexture = object.material.map;
        }
        object.material = new THREE.MeshLambertMaterial({
          color: highlightColor,
        });
      }
    });
    this.selectedEntities.push(
      new SelectItem(group, "group", defaultColor, defaultTexture)
    );
  }

  getContainerObjByChild(child) {
    // Recursive function - this function calls itself again.
    if (child.userData.isContainer) return child;
    else if (child.parent != null)
      return this.getContainerObjByChild(child.parent);
    else return null;
  }

  deSelect() {
    if (this.selectedEntities != null) {
      for (var i = 0; i < this.selectedEntities.length; i++) {
        switch (this.selectedEntities[i].type) {
          case "mesh":
            {
              this.unSetHighlightColorForMesh(
                this.selectedEntities[i].item,
                this.selectedEntities[i].defaultColor
              );
            }
            break;
          case "face":
            {
              this.unSetHighlightColorForFace(
                this.selectedEntities[i].item,
                this.selectedEntities[i].defaultColor
              );
            }
            break;
          case "group":
            {
              this.unSetHighLightColorForGroup(
                this.selectedEntities[i].item,
                this.selectedEntities[i].defaultColor,
                this.selectedEntities[i].defaultTexture
              );
            }
            break;
        }
      }
    }
  }

  unSetHighlightColorForMesh(selected, defaultColor) {
    if (selected.object.material.isMaterial) {
      selected.object.material.color.setHex(defaultColor);
      selected.object.material.colorsNeedUpdate = true;
      if (selected.object.material.map) {
        selected.object.material.color.setHex(0xffffff);
      }
    }
    if (selected.object.material.length > 0) {
      var materialIndex = selected.face.materialIndex;
      selected.object.material[materialIndex].color.setHex(defaultColor);
      selected.object.material.colorsNeedUpdate = true;
      if (selected.object.material[materialIndex].map) {
        selected.object.material[materialIndex].color.setHex(0xffffff);
      }
    }
  }

  unSetHighlightColorForFace(selected, defaultColor) {
    if (selected.object.geometry instanceof THREE.BufferGeometry) {
      for (var i = 0; i < this.scene.children.length; i++) {
        if (this.scene.children[i].name == "face") {
          this.scene.remove(this.scene.children[i]);
        }
      }
    } else {
      selected.face.color.setHex(defaultColor);
      selected.object.geometry.colorsNeedUpdate = true;
    }
  }

  unSetHighLightColorForGroup(selected, defaultColor, defaultTexture) {
    selected.traverse((object) => {
      if (object.isMesh) {
        if (defaultTexture != null) {
          object.material.map = defaultTexture;
          object.material.color.setHex(0xffffff);
          object.material.needsUpdate = true;
        } else {
          object.material = new THREE.MeshLambertMaterial({});
          object.material.color.setHex(defaultColor);
        }
      }
    });
  }

  getSelection() {
    if (this.selectedEntities) {
      return this.selectedEntities;
    } else return null;
  }

  getLevel() {
    return this.level;
  }

  setLevel(level) {
    this.level = level;
  }

  clearSelectionManagerStorage() {
    this.deSelect();
    this.setLevel("mesh");
    this.clearSelectedEntities();
  }

  clearSelectedEntities() {
    this.selectedEntities = [];
  }

  
}
