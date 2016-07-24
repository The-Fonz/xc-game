/*
 * Collection of all entry points. They load by identifying the body's id tag
 */

import {Terrain} from './game-engine/terrain';
import {Engine} from './game-engine/engine';
import {HeightmapView} from './render/view2d';
import {ThreeDeeView} from './render/view3d';
import {promiseGet} from './utils/http';
import {l} from './utils/logging';
import {KeyMap} from './utils/input';

// Entry point for terrain load example
if (document.body.id === "terrain-load") {
  // Task config
  var config = {
    "paragliders": [
      {position: {x:100, y:200, z:100}},
    ],
    "weather": {},
    "task": {},
    // "fog": {"hex": 0xFFFFFF, "near": 10, "far": 100},
    "ThreeDeeView": {
      "clippingplane": 3000,
      "fog": {"hex": 0xFFFFFF, "near": 400, "far": 3000},
      "showheightmap": true,
      "axishelper": 3000,
      "clearcolor": "white",
    },
  };

  l("Loading resources...");

  promiseGet("../terrainmaker/grandcanyon.ignore.json")
  .then(JSON.parse)
  .then((json)=>{
    let g = new Game(json, config);
  });
}

class Game {
  constructor(json, config){
    // Load terrain, engine, view (in that order)
    var km = new KeyMap();
    l("Building mountains...");
    var t = new Terrain(json.xcgame.heightmap,
      json.xcgame.hscale,
      // Vertical scale of terrain mesh
      json.xcgame.vscale,
      // Heightmap multiplier, excludes vscale
      json.xcgame.heightmapvscale);
    l("Retrieving vectors...");
    var e = new Engine(t, config);
    l("Generating triangles...");
    var v = new ThreeDeeView(e, json, config.ThreeDeeView);

    l("Setting time interval...");
    var blur = false;
    // requestAnimationFrame only runs when tab is active
    // Handle blur/focus event to stop simulation
    // when window is hidden while tab is active
    window.addEventListener('blur', (ev) => {
      blur=true;
      l("window blurred, stopping simulation");
    });
    window.addEventListener('focus', (ev) => {
      blur=false;
      l("window focused, resuming simulation");
    });

    var time = 0;
    function renderloop(timestamp) {
      if (time===0) time = timestamp;

      let dt = (timestamp-time)/1000;

      if (blur === false) {
        // e.processinput(km, dt);
        e.update(dt);
        // l("animating");
        v.flyaround(km, dt);
        v.render();
        console.info("GL: " + t.groundlevel(v.camera.position));
      }

      requestAnimationFrame(renderloop);
      time = timestamp;
    }

    requestAnimationFrame(renderloop);
  }
}
