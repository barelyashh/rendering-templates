var Reflector = null;

function showSubMenu(subMenuId) {
  var subMenuList = document.getElementsByClassName("SubMenuContainer");
  for (var i = 0; i < subMenuList.length; i++) {
    if (
      subMenuList[i].classList.contains("menuPopupOpen") &&
      subMenuList[i].id != subMenuId
    ) {
      subMenuList[i].classList.remove("menuPopupOpen");
    }
  }

  var subMenu = document.getElementById(subMenuId);
  if (subMenu) {
    if (subMenu.classList.contains("menuPopupOpen")) {
      subMenu.classList.remove("menuPopupOpen");
    } else {
      subMenu.classList.add("menuPopupOpen");
    }
  }
}

function displaySelected() {
  var lightsContainer = document.getElementById("lightsContainer");
  var light = document.getElementById("selectedLight").value;
  var color = document.getElementById("lightColor").value;
  var positionX = document.getElementById("positionX").value;
  var positionY = document.getElementById("positionY").value;
  var positionZ = document.getElementById("positionZ").value;
  var option = document.createElement("option");
  option.text = light;
  lightsContainer.add(option);
  WebViewer.lightManager.applySelectedLight(
    light,
    color,
    positionX,
    positionY,
    positionZ
  );
}

function removeSelected() {
  var lightsContainer = document.getElementById("lightsContainer");
  WebViewer.lightManager.removeSelectedLight(lightsContainer.selectedIndex);
  lightsContainer.remove(lightsContainer.selectedIndex);
}


function DownloadJPG() {
  
}

function setImportedModule(Reflector) {
  WebViewer.reflector = Reflector;
}
