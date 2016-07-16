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
  var config = {"paragliders": [
    {position: {x:100, y:100, z:200}},
  ]};

  l("Loading resources...");

  let p = promiseGet("../terrainmaker/grandcanyon.ignore.json").then(JSON.parse);

  p.then((json)=>{
    // Load terrain, engine, view (in that order)
    var km = new KeyMap();
    l("Building mountains...");
    var t = new Terrain(json.xcgame.heightmap);
    l("Retrieving vectors...");
    var e = new Engine(t, config);
    l("Generating triangles...");
    var v = new ThreeDeeView(e, json);

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
      }

      requestAnimationFrame(renderloop);
      time = timestamp;
    }

    requestAnimationFrame(renderloop);
  });

}
