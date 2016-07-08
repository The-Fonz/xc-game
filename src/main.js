/*
 * Collection of all entry points. They load by identifying the body's id tag
 */

import {Terrain} from './game-engine/terrain';
import {Engine} from './game-engine/engine';
import {HeightmapView} from './render/view2d';
import {ThreeDeeView} from './render/view3d';
import {promiseGet} from './utils/http'

// Logging utility func
function l(msg) {
  console.info(msg);
}

// Entry point for terrain load example
if (document.body.id === "terrain-load") {
  // Task config
  var config = {"paragliders": [
    {position: {x:100, y:100, z:200}},
  ]};

  l("Loading resources...");

  let p1 = promiseGet("../obj/sceneries/test1/test1.png").then((imblob)=>{
    let img = new Image();
    img.style.display = "none";
    img.src = window.URL.createObjectURL(imblob);
    return img;
  });
  let p2 = promiseGet("../terrainmaker/grandcanyon.ignore.json").then(JSON.parse);

  Promise.all(p1,p2).then((results)=>{
    l("Resources loaded");
    // Load terrain, engine, view (in that order)
  //   var t = new Terrain(img);
  //   var e = new Engine(t, config);
  //   var hmcanv = document.getElementById("heightmap");
  //   hmcanv.width = img.width;
  //   hmcanv.height = img.height;
  //   var hmv = new HeightmapView(e, hmcanv);
  //   var time = 0;
  //   var f = function(timestamp) {
  //     if (time===0) time = timestamp;
  //     e.update((timestamp-time)/1000);
  //     hmv.update();
  //     requestAnimationFrame(f);
  //     time = timestamp;
  //   };
  //   requestAnimationFrame(f);
  });

  var tdv = new ThreeDeeView(null);
}

// Entry point for 2d example
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

// Entry point for heightmap load example
if (document.body.id === "heightmap-load") {
  var img = new Image();
  img.style.display = "none";
  img.onload = function() {
    var t = new Terrain(img, true);
  }
  img.src = "../obj/sceneries/test1/test1.png";
}
