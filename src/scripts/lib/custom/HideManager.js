class HideManager {
  constructor(scene, model) {
    this.scene = scene;
    this.model = model;
  }

  hideSelected(selected) {
    if (selected != null) {
      for (var i = 0; i < selected.length; i++) {
        switch (selected[i].type) {
          case "mesh":
            {
              this.hideSelectedMesh(selected[i].item);
            }
            break;
          case "face":
            {
              this.hideSelectedFace(selected[i].item);
            }
            break;
          case "group":
            {
              this.hideSelectedGroup(selected[i].item);
            }
            break;
        }
      }
    }
  }

  hideSelectedMesh(selected) {
    /*     this.scene.remove(selected.object);
selected.object.geometry.dispose();
selected.object.material.dispose();
       
       selected.object = undefined */
    selected.object.visible = false;
  }

  hideSelectedFace(selected) {
    return;
    // selected.object.visible = false;
  }

  hideSelectedGroup(selected) {
    selected.visible = false;
  }

  unhideAll() {
    this.model[0].traverse(function (child) {
      child.visible = true;
    });
  }
}
