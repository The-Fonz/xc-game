// Entry point for heightmap load example

import {Terrain} from '../game-engine/terrain';
import {Engine} from '../game-engine/engine';
import {HeightmapView} from '../render/view2d';

if (document.body.id === "game-draw2d") {
  var config = {"paragliders": [
    {x:100, y:100, z:200},
  ]};

  var img = new Image();
  img.style.display = "none";

  img.onload = function() {
    var t = new Terrain(img);
    var e = new Engine(t, config);
    var hmcanv = document.getElementById("heightmap");
    hmcanv.width = img.width;
    hmcanv.height = img.height;
    var hmv = new HeightmapView(e, hmcanv);
    var time = 0;
    var f = function(timestamp) {
      if (time===0) time = timestamp;
      e.update((timestamp-time)/1000);
      hmv.update();
      requestAnimationFrame(f);
      time = timestamp;
    };
    requestAnimationFrame(f);
  }
  img.src = "../obj/sceneries/test1/test1.png";
}
