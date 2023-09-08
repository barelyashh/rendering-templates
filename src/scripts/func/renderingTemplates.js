let RenderingTemplates = {
  globalTemplatesMetadata: {},
  modelSpecificTemplatesMetadata: {},
  templatesContainerId: "renderingTemplatesMenu",

  create: function (globalTemplatesMetadata, modelSpecificTemplatesMetadata) {
    this.globalTemplatesMetadata = globalTemplatesMetadata
      ? globalTemplatesMetadata
      : {};
    this.modelSpecificTemplatesMetadata = modelSpecificTemplatesMetadata
      ? modelSpecificTemplatesMetadata
      : {};

    var templateContainer = document.getElementById(this.templatesContainerId);
    for (var template in this.globalTemplatesMetadata) {
      var templateHtml =
        "  <li> <button title='" +
        template +
        "' class = ' btn btn-link ' type='button' onclick = \"RenderingTemplates.apply('" +
        template +
        "')\"> " +
        template +
        "";

      templateHtml += "</button></li>";
      templateContainer.innerHTML += templateHtml;
    }
  },

  apply: function (templateName) {
    var globalTemplatesMetadata = this.globalTemplatesMetadata[templateName];
    var modelSpecificTemplatesMetadata = this.modelSpecificTemplatesMetadata[
      templateName
    ];
    for (attribute in globalTemplatesMetadata) {
      switch (attribute.toLowerCase()) {
        case "lights":
          this.applyLights(globalTemplatesMetadata[attribute]);
          break;
        case "shadow":
          this.applyShadow(globalTemplatesMetadata[attribute]);
          break;
        case "environmenttexture":
          this.applyEnvironmentTexture(globalTemplatesMetadata[attribute]);
          break;
        case "reflection":
          this.applyReflection(globalTemplatesMetadata[attribute]);
          break;
        case "background":
          this.applyBackgroundColor(globalTemplatesMetadata[attribute]);
          break;
        case "bloom":
          this.applyBloom(globalTemplatesMetadata[attribute]);
          break;
        case "colorsandtextures":
          this.applyColorsAndTextures(
            modelSpecificTemplatesMetadata[attribute]
          );
          break;
      }
    }
    for (attribute in modelSpecificTemplatesMetadata) {
      switch (attribute.toLowerCase()) {
        case "colorsandtextures":
          this.applyColorsAndTextures(
            modelSpecificTemplatesMetadata[attribute]
          );
          break;
      }
    }
  },

  applyLights: function (lights) {
    if (!lights) {
      return;
    }

    WebViewer.clearLights();
    for (var i = 0; i < lights.length; i++) {
      WebViewer.addLight(lights[i]);
    }
  },

  applyShadow: function (shadow) {
    let enable = shadow.enable ? shadow.enable : false;
    WebViewer.applyShadow(enable, shadow.near, shadow.far);
  },

  clearTemplates: function () {
    var templateContainer = document.getElementById(this.templatesContainerId);
    templateContainer.innerHTML = "";
  },

  applyEnvironmentTexture: function (environmentTexture) {
    WebViewer.applyEnvMap(environmentTexture);
  },

  applyReflection: function (reflection) {
    let enable = reflection.enable ? reflection.enable : false;
    WebViewer.setSimpleReflectionEnabled(enable);
  },

  applyBackgroundColor: function (backgroundColor) {
    WebViewer.setBackgroundColor(backgroundColor.color);
  },
  applySilhouette: function (silhouette) {
    let enable = silhouette.enable ? silhouette.enable : false;
    WebViewer.setSilhouetteEnabled(enable);
  },

  applyBloom: function (bloom) {
    let enable = bloom.enable ? bloom.enable : false;
    WebViewer.setBloomEnabled(enable, bloom);
  },

  applyColorsAndTextures: function (colorsAndTextures) {
    for (var group in colorsAndTextures) {
      if (!colorsAndTextures[group].items) {
        continue;
      }
      let items,
        color,
        texture = undefined;
      items = colorsAndTextures[group].items;
      if (colorsAndTextures[group].color) {
        var hex = colorsAndTextures[group].color;
        var hexColor = hex.replace("#", "0x");
        color = parseInt(hexColor);
      }
      if (colorsAndTextures[group].texture) {
        texture = colorsAndTextures[group].texture;
        var loader = new THREE.TextureLoader();
        var loadedTexture = loader.load(texture);
      }

      for (var i = 0; i < items.length; i++) {
        let item = items[i];
        if (item && color) {
          WebViewer.setColorByName(item, color);
        }
        if (item && texture) {
          WebViewer.setTextureByName(item, loadedTexture);
        }
      }
    }
  },
};
