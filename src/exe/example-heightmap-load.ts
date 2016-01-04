// Entry point for heightmap load example

import Terrain = require("../game-engine/terrain");

if (document.body.id === "heightmap-load") {
  var img = new Image();
  img.style.display = "none";
  img.onload = function() {
    var t = new Terrain(img, true);
  }
  img.src = "../obj/sceneries/test1/test1.png";
}
