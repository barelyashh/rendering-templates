let WebViewer = {
  camera: null,
  controls: null,
  scene: null,
  renderer: null,
  axesTriadRenderer: null,
  axesTriadScene: null,
  axesTriadCamera: null,
  container: null,
  orientationMode: null,
  globalTemplatesMetadata: null,
  modelSpecificTemplatesMetadata: null,
  colorsAndtextures: null,
  selectionManager: null,
  lightManager: null,
  reflectionManager: null,
  bloomManager: null,
  hideManager:null,
  isolateManager:null,
  reflector: null,
  composer: null,

  objects: [],

  loadModel: function () {
    var ImageId = document.getElementsByClassName("viewerImage");
    if (ImageId[0] != null) {
      ImageId[0].remove(ImageId);
    }
    if (this.scene == null) {
      this.startViewer();
    }
    this.loadOBJ();
  },

  startViewer: function () {
    //container
    WebViewer.container = document.getElementById("canvas"); // get a reference of your canvas container
    //renderer
    WebViewer.renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    });
    WebViewer.renderer.setPixelRatio(window.devicePixelRatio);
    WebViewer.renderer.setSize(
      WebViewer.container.offsetWidth,
      WebViewer.container.offsetHeight
    );
    WebViewer.renderer.shadowMap.enabled = true;
    WebViewer.renderer.shadowMapSoft = false;
    WebViewer.container.appendChild(WebViewer.renderer.domElement); // apply the internal canvas of the renderer to the document
    //camera
    WebViewer.scene = new THREE.Scene();
    WebViewer.scene.background = new THREE.Color(0x83b8f1);

    //camera
    WebViewer.camera = new THREE.PerspectiveCamera(
      45,
      WebViewer.container.offsetWidth / WebViewer.container.offsetHeight,
      1,
      100000
    );
    WebViewer.camera.position.set(0, 0, 10);
    WebViewer.scene.add(WebViewer.camera);
    var light = new THREE.AmbientLight();
    WebViewer.scene.add(light);

    //controls
    WebViewer.controls = new THREE.TrackballControls(
      WebViewer.camera,
      WebViewer.renderer.domElement
    );

    WebViewer.orientationMode = new OrientationView(
      WebViewer.camera,
      WebViewer.scene,
      WebViewer.controls
    );
    this.loadGlobalTemplatesMetadata(function (json) {
      WebViewer.globalTemplatesMetadata = json;
      
    });
    this.loadModelSpecificMetadataJSON(function (json) {
      WebViewer.modelSpecificTemplatesMetadata = json;
      RenderingTemplates.create(WebViewer.globalTemplatesMetadata,WebViewer.modelSpecificTemplatesMetadata );
     // RenderingTemplates.create(WebViewer.globaltemplatesMetadata);
    });

    var container2 = document.getElementById("axesTriadcanvas");

    //renderer2
    WebViewer.axesTriadRenderer = new THREE.WebGLRenderer({
      alpha: true,
    });
    WebViewer.axesTriadRenderer.setPixelRatio(window.devicePixelRatio);
    WebViewer.axesTriadRenderer.setSize(
      container2.offsetWidth,
      container2.offsetHeight
    );
    container2.appendChild(WebViewer.axesTriadRenderer.domElement);

    //scene2
    WebViewer.axesTriadScene = new THREE.Scene();
    //WebViewer.axesTriadScene.background = new THREE.Color(0xe5e5e5);

    //camera2
    WebViewer.axesTriadCamera = new THREE.PerspectiveCamera(
      45,
      container2.offsetWidth / container2.offsetHeight,
      1,
      1000
    );
    WebViewer.axesTriadCamera.up = WebViewer.axesTriadCamera.up;

    //axis trade
    var axes2 = new THREE.AxesHelper(100);
    WebViewer.axesTriadScene.add(axes2);

    WebViewer.colorsAndtextures = new ColorsAndTextures(WebViewer.scene);
    WebViewer.lightManager = new LightManager(WebViewer.scene, light);
    WebViewer.reflectionManager = new ReflectionManager(
      WebViewer.scene,
      WebViewer.reflector,
      WebViewer.container.offsetWidth,
      WebViewer.container.offsetHeight
    );
    WebViewer.bloomManager = new BloomManager(
      WebViewer.scene,
      WebViewer.camera,
      WebViewer.renderer,
      WebViewer.container.offsetWidth,
      WebViewer.container.offsetHeight
    );

    document
      .getElementById("saveLink")
      .addEventListener("click", WebViewer.saveAsImage);
           // Enables Menu.
           document.getElementById("Menu").style.display = "block";
    window.addEventListener("resize", this.onWindowResize, false);
    this.animate();
  },

  loadGlobalTemplatesMetadata: function (callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open("GET", "../../templates/renderingTemplatesMetadata.json", true);
    xobj.onreadystatechange = function () {
      if (xobj.readyState == 4 && xobj.status == "200") {
        callback(JSON.parse(xobj.responseText));
      }
    };
    xobj.send(null);
  },

  loadModelSpecificMetadataJSON: function (callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open("GET", "../../templates/modelSpecificMetadata.json", true);
    xobj.onreadystatechange = function () {
      if (xobj.readyState == 4 && xobj.status == "200") {
        callback(JSON.parse(xobj.responseText));
      }
    };
    xobj.send(null);
  },

  onWindowResize: function () {
    WebViewer.camera.aspect = window.innerWidth / window.innerHeight;
    WebViewer.camera.updateProjectionMatrix();
    WebViewer.renderer.setSize(window.innerWidth, window.innerHeight);
  },

  animate: function () {
    requestAnimationFrame(WebViewer.animate);
    TWEEN.update();
    if (WebViewer.composer != null) {
      WebViewer.composer.render();
    }
    WebViewer.axesTriadCamera.position.copy(WebViewer.camera.position);
    WebViewer.axesTriadCamera.position.sub(WebViewer.controls.target);
    WebViewer.axesTriadCamera.position.setLength(300);
    WebViewer.axesTriadCamera.lookAt(WebViewer.axesTriadScene.position);
    WebViewer.render();
  },

  render: function () {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.axesTriadRenderer.render(this.axesTriadScene, this.axesTriadCamera);
  },

  loadOBJ: function () {
    this.resetScene();
    var input = document.getElementById("filePath");
    var Objfile = input.files[0].name;
    var mtlFile = Objfile.replace("obj", "mtl");
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setResourcePath("../../src/models/3d-obj-loader/assets/");
    mtlLoader.setPath("../../src/models/3d-obj-loader/assets/");
    mtlLoader.setCrossOrigin(true);
    mtlLoader.load(
      mtlFile,
      function (materials) {
        materials.preload();
        WebViewer.loadWithMTL(materials, Objfile);
      },
      function (progress) {
        console.log((progress.loaded / progress.total) * 100 + "% loaded");
      },
      function (error) {
        console.log("An error happened while loading Mtl");
        WebViewer.loadWithoutMTL(Objfile);
      }
    );
  },

  loadWithMTL: function (materials, Objfile) {
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath("../../src/models/");
    objLoader.load(
      Objfile,
      function (obj) {
        obj.userData.isContainer = true;
        var boundingBox = new THREE.Box3();
        boundingBox.expandByObject(obj);
        var distance = WebViewer.orientationMode.getDistance(boundingBox);
        WebViewer.camera.position.set(distance, distance, distance);
        WebViewer.createGround();
        WebViewer.objects.push(obj);
        WebViewer.scene.add(obj);
        obj.traverse(function (child) {
          child.castShadow = true;
        });
        WebViewer.selectionManager = new SelectionManager(
          WebViewer.container,
          WebViewer.objects,
          WebViewer.camera,
          WebViewer.scene
        );
        WebViewer.selectionManager.start();
        WebViewer.selectionManager.startZoomToSelectListener();
        
    WebViewer.hideManager = new HideManager(
      WebViewer.scene,
      WebViewer.objects,
    );

    WebViewer.isolateManager = new IsolateManager(
      WebViewer.scene,
      WebViewer.objects,
      WebViewer.camera,
      WebViewer.controls
    );
      },
      function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      function (error) {
        console.log("An error happened while loading OBJ");
      }
    );
  },

  loadWithoutMTL: function (Objfile) {
    var objLoader = new THREE.OBJLoader();
    objLoader.setPath("../../src/models/");
    objLoader.load(
      Objfile,
      function (obj) {
        obj.userData.isContainer = true;
        var boundingBox = new THREE.Box3();
        boundingBox.expandByObject(obj);
        var distance = WebViewer.orientationMode.getDistance(boundingBox);
        WebViewer.camera.position.set(distance, distance, distance);
        WebViewer.createGround();
        obj.traverse(function (child) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.isMesh) {
            child.material = new THREE.MeshPhongMaterial({
              color: 0xd0cdce,
              shininess: 150,
              specular: 0x222222,
            });
          }
        });
        WebViewer.objects.push(obj);
        WebViewer.scene.add(obj);
        WebViewer.selectionManager = new SelectionManager(
          WebViewer.container,
          WebViewer.objects,
          WebViewer.camera,
          WebViewer.scene
        );
        WebViewer.selectionManager.start();
        WebViewer.selectionManager.startZoomToSelectListener();
        
    WebViewer.hideManager = new HideManager(
      WebViewer.scene,
      WebViewer.objects,
    );
    WebViewer.isolateManager = new IsolateManager(
      WebViewer.scene,
      WebViewer.objects,
      WebViewer.camera,
      WebViewer.controls
    );
      },
      function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      function (error) {
        console.log("An error happened while loading OBJ");
      }
    );
  },

  createGround: function () {
    var geometry = new THREE.PlaneBufferGeometry(1000, 1000);
    geometry.rotateX(-Math.PI / 2);
    var material = new THREE.ShadowMaterial();
    material.opacity = 0.8;

    var ground = new THREE.Mesh(geometry, material);
    ground.receiveShadow = true;
    ground.position.set(0, -100, 0);
    WebViewer.scene.add(ground);
  },

  toggleTextureContainer: function () {
    var textureContainer = document.getElementById("textureContainer");
    if (
      textureContainer.style.display == "" ||
      textureContainer.style.display == "none"
    ) {
      textureContainer.style.display = "block";
    } else {
      textureContainer.style.display = "none";
    }
  },

  switchOrientation: function (orientation) {
    WebViewer.orientationMode.change(orientation);
  },

  setColor: function () {
    var hexColor = document.getElementById("color").value;
    var selected = WebViewer.selectionManager.getSelection();
    WebViewer.colorsAndtextures.setNodeColor(hexColor, selected);
    WebViewer.selectionManager.clearSelectedEntities();
  },

  setTexture: function (image) {
    var loader = new THREE.TextureLoader();
    var imageSrc = "../../src/images/Textures/" + image + ".png";
    var texture = loader.load(imageSrc);
    var selected = WebViewer.selectionManager.getSelection();
    WebViewer.colorsAndtextures.setNodeTexture(texture, selected);
    WebViewer.selectionManager.clearSelectedEntities();
  },

  resetScene: function () {
    this.objects = [];
    for (var i = 0; i <= this.scene.children.length; i++) {
      while (
        this.scene.children[i] instanceof THREE.Group ||
        this.scene.children[i] instanceof THREE.Mesh
      ) {
        this.scene.remove(this.scene.children[i]);

      }
    }
    this.controls.reset();
    if (WebViewer.selectionManager != null) {
      WebViewer.selectionManager.stop();
      WebViewer.selectionManager.clearSelectionManagerStorage();
    }
  },

  changeSelectionLevelParameter: function (level) {
    this.selectionManager.setLevel(level);
  },

  addSelectedLight: function (type) {
    this.lightManager.setLightType(type);
  },

  addLight: function (light) {
    WebViewer.lightManager.applySelectedLight(
      light.type,
      light.color,
      light.position.x,
      light.position.y,
      light.position.z
    );
  },

  clearLights: function () {
    WebViewer.lightManager.clearLights();
  },

  applyShadow: function (enable, near, far) {
    WebViewer.lightManager.setShadow(enable, near, far);
  },

  applyEnvMap: function (textureData) {
    if (
      !textureData ||
      !textureData.images ||
      textureData.images.length !== 6
    ) {
      return;
    }
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      textureData.images[0],
      textureData.images[1],
      textureData.images[2],
      textureData.images[3],
      textureData.images[4],
      textureData.images[5],
    ]);
    WebViewer.scene.background = texture;
  },

  setSimpleReflectionEnabled: function (enable) {
    WebViewer.reflectionManager.disposeMirrorGeometry();
    if (enable == true) {
      var loader = new THREE.TextureLoader();
      var imageSrc = "../../src/images/Textures/brick_bump.jpg";
      var texture = loader.load(imageSrc);
      var geometry = new THREE.PlaneBufferGeometry(1000, 1000);
      geometry.rotateX(-Math.PI / 2);
      WebViewer.reflectionManager.createMirrorGeometry(geometry, texture);
    } else {
      WebViewer.reflectionManager.disposeMirrorGeometry();
    }
  },

  setBackgroundColor: function (backgroundColor) {
    WebViewer.scene.background = new THREE.Color(backgroundColor);
  },

  setBloomEnabled: function (enable, bloom) {
    WebViewer.bloomManager.disposebloom();
    if (enable == true) {
      WebViewer.bloomManager.setBloom(bloom);
    } else {
      WebViewer.bloomManager.disposebloom();
    }
  },

  setSilhouetteEnabled: function (enable) {},

  //function to get viewer dataURI
  saveAsImage: function () {
    var imgData;
    var strDownloadMime = "image/octet-stream";
    try {
      var strMime = "image/jpeg";
      imgData = WebViewer.renderer.domElement.toDataURL(strMime);
      WebViewer.saveFile(imgData.replace(strMime, strDownloadMime), "test.jpg");
    } catch (e) {
      console.log(e);
      return;
    }
  },

  //fuction to download viewer as a jpg image.
  saveFile: function (strData, filename) {
    console.log(strData);
    console.log(filename);
    var link = document.createElement("a");
    if (typeof link.download === "string") {
      document.body.appendChild(link);
      link.download = filename;
      link.href = strData;
      link.click();
      document.body.removeChild(link); //remove the link when done
    } else {
      location.replace(uri);
    }
  },

  hideSelectedPart: function () {
   var selectedEntities =  WebViewer.selectionManager.getSelection();
   WebViewer.hideManager.hideSelected(selectedEntities);
   
  },

  IsolateSelectedPart: function () {
   var selectedEntities =  WebViewer.selectionManager.getSelection();
   WebViewer.isolateManager.isolateSelected(selectedEntities);
  },

  unhideAllGeometry: function (){
    WebViewer.hideManager.unhideAll();
  },

  setColorByName: function (entity, color){
    this.objects[0].traverse(function (child) {
      if(child.isMesh){
         if(child.name == entity ){
           if(child.material.map != null){
             child.material.map = null;
             child.material.needsUpdate = true;
           }
           child.material.color.setHex(color)
           child.material.needsUpdate = true;
         }
      }
    });
  },

  setTextureByName: function (entity, texture){
    this.objects[0].traverse(function (child) {
      if(child.isMesh){
         if(child.name == entity){
          child.material.map = texture;
          child.material.color.setHex(0xffffff);
          child.material.needsUpdate = true;
         }
      }
    });
  },

  
};
