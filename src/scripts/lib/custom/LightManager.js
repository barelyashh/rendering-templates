class LightManager {
  constructor(scene, defaultlight) {
    this.scene = scene;
    this.light = null;
    this.defaultlight = defaultlight;
    this.addedLights = [];
  }

  applySelectedLight(type, colorStr, positionX, positionY, positionZ) {
    var hexColor = colorStr.replace("#", "0x");
    var color = parseInt(hexColor);
    this.removeDefaultLight();
    switch (type) {
      case "DirectionalLight":
        {
          this.applyDirectionalLight(color, positionX, positionY, positionZ);
        }
        break;
      case "HemisphereLight":
        {
          this.applyHemisphereLight(color, positionX, positionY, positionZ);
        }
        break;
      case "SpotLight":
        {
          this.applySpotLight(color, positionX, positionY, positionZ);
        }
        break;
      case "PointLight":
        {
          this.applyPointLight(color, positionX, positionY, positionZ);
        }
        break;
    }
  }

  applyDirectionalLight(color, positionX, positionY, positionZ) {
    this.light = new THREE.DirectionalLight(color);
    this.light.castShadow = true;
    this.light.shadow.camera.scale.set(100, 100, 100);
    this.light.position.set(positionX, positionY, positionZ);
    this.addedLights.push(this.light);
    this.scene.add(this.light);
  }

  applyHemisphereLight(color, positionX, positionY, positionZ) {
    const skyColor = color;
    const groundColor = 0x0000ff;
    this.light = new THREE.HemisphereLight(skyColor, groundColor);
    this.addedLights.push(this.light);
    this.scene.add(this.light);
  }

  applySpotLight(color, positionX, positionY, positionZ) {
    this.light = new THREE.SpotLight(color);
    this.light.position.set(positionX, positionY, positionZ);
    this.light.castShadow = true;
    this.addedLights.push(this.light);
    this.scene.add(this.light);
  }

  applyPointLight(color, positionX, positionY, positionZ) {
    this.light = new THREE.PointLight(color);
    this.light.castShadow = true;
    this.light.position.set(positionX, positionY, positionZ);
    this.addedLights.push(this.light);
    this.scene.add(this.light);
  }

  removeSelectedLight(index) {
    const removeSelectedLight = this.addedLights.splice(index, 1);
    if (removeSelectedLight[0] instanceof THREE.Light) {
      this.scene.remove(removeSelectedLight[0]);
    }
     if (index == 0 && this.addedLights.length == 0) {
      this.addDefaultLight();
    }
  }

  removeDefaultLight() {
    if (this.defaultlight instanceof THREE.Light) {
      this.scene.remove(this.defaultlight);
    }
  }

  addDefaultLight() {
    this.clearLights();
    if (this.defaultlight instanceof THREE.Light) {
      this.scene.add(this.defaultlight);
    }
  }

  clearLights() {
    for (var i = 0; i < this.scene.children.length; i++) {
      if (this.scene.children[i] instanceof THREE.Light) {
        this.scene.remove(this.scene.children[i]);
      }
    }
  }

  setShadow(enable, near, far) {
    if (this.light.castShadow) {
      this.light.castShadow = enable;
      this.light.shadow.camera.near = near;
      this.light.shadow.camera.far = far;
    }
  }
}
