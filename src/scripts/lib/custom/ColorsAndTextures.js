class ColorsAndTextures {
  constructor(scene) {
    this.scene = scene;
  }

  setNodeColor(hexColor, selected) {
    if (selected != null) {
      for (var i = 0; i < selected.length; i++) {
        var color = hexColor.replace("#", "0x");
        switch (selected[i].type) {
          case "mesh":
            {
              this.setColorForMesh(selected[i].item, color);
            }
            break;
          case "face":
            {
              this.setColorForFace(selected[i].item, color);
            }
            break;
          case "group":
            {
              this.setColorForGroup(selected[i].item, color);
            }
            break;
        }
      }
    }
  }

  setColorForMesh(selected, color) {
    if (selected.object.material.isMaterial) {
      selected.object.material.color.setHex(color);
      selected.object.material.colorsNeedUpdate = true;
      if (selected.object.material.map) {
        selected.object.material.map = null;
        selected.object.material.color.setHex(color);
        selected.object.material.needsUpdate = true;
      }
    }
    if (selected.object.material.length > 0) {
      var materialIndex = selected.face.materialIndex;
      selected.object.material[materialIndex].color.setHex(color);
      selected.object.material.colorsNeedUpdate = true;
      if (selected.object.material[materialIndex].map) {
        selected.object.material[materialIndex].map = null;
        selected.object.material[materialIndex].color.setHex(color);
        selected.object.material.needsUpdate = true;
      }
    }
  }

  setColorForFace(selected, color) {
    if (selected.object.geometry instanceof THREE.BufferGeometry) {
      //Using intersection face a, b, c properties to get x, y, z from position bufferattribute.

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
      geom.faceVertexUvs[0].push([
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.5, 0),
        new THREE.Vector2(0.5, 0.5),
      ]);
      geom.uvsNeedUpdate = true;
      var material = new THREE.MeshLambertMaterial({});
      material.color.setHex(color);
      var mesh = new THREE.Mesh(geom, material);
      this.scene.add(mesh);
    } else {
      selected.face.color.setHex(color);
      selected.object.geometry.colorsNeedUpdate = true;
    }
  }

  setColorForGroup(selected, color) {
    selected.traverse((object) => {
      if (object.isMesh) {
        object.material = new THREE.MeshLambertMaterial({});
        object.material.color.setHex(color);
        object.material.colorsNeedUpdate = true;
      }
    });
  }

  setNodeTexture(texture, selected) {
    if (selected != null) {
      for (var i = 0; i < selected.length; i++) {
        switch (selected[i].type) {
          case "mesh":
            {
              this.setTextureForMesh(selected[i].item, texture);
            }
            break;
          case "face":
            {
              WebViewer.selectionManager.deSelect();
            }
            break;
          case "group":
            {
              this.setTextureForGroup(selected[i].item, texture);
            }
            break;
        }
      }
    }
  }

  setTextureForMesh(selected, texture) {
    if (selected.object.material.isMaterial) {
      selected.object.material.map = texture;
      selected.object.material.color.setHex(0xffffff);
      selected.object.material.needsUpdate = true;
    }
    if (selected.object.material.length > 0) {
      var materialIndex = selected.face.materialIndex;
      selected.object.material[materialIndex].map = texture;
      selected.object.material[materialIndex].color.setHex(0xffffff);
      selected.object.material[materialIndex].needsUpdate = true;
    }
  }

  setTextureForFace(selected, texture) {
    if (selected.object.geometry instanceof THREE.BufferGeometry) {
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

      var geom = new THREE.Geometry();
      geom.vertices.push(aVertex);
      geom.vertices.push(bVertex);
      geom.vertices.push(cVertex);
      geom.faces.push(new THREE.Face3(0, 1, 2));
      geom.faceVertexUvs[0].push([
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.5, 0),
        new THREE.Vector2(0.5, 0.5),
      ]);
      geom.uvsNeedUpdate = true;

      var material = new THREE.MeshBasicMaterial({
        map: texture,
      });
      var mesh = new THREE.Mesh(geom, material);
      this.scene.add(mesh);
    } else {
      selected.face.color.setHex(color);
      selected.object.geometry.colorsNeedUpdate = true;
    }
  }

  setTextureForGroup(selected, texture) {
    selected.traverse((object) => {
      if (object.isMesh) {
        object.material = new THREE.MeshLambertMaterial({});
        object.material.map = texture;
        object.material.needsUpdate = true;
      }
    });
  }
}
