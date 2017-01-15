/*
 * Game class
 */

import {Terrain} from './game-engine/terrain';
import {Engine} from './game-engine/engine';
import {ThreeDeeView} from './render/view3d';
import {KeyMap} from './utils/input';
import {Task} from './game-engine/task';
import {TaskMap} from './overlays/taskmap';
import {l} from './utils/logging';

/** Handles interaction between high-level game elements */
export class Game {
  constructor(terrainmodel, pgmodels, config){
    // Load terrain, engine, view (in that order)
    var km = new KeyMap();
    l("Building mountains...");
    var t = new Terrain(terrainmodel.xcgame.heightmap,
      terrainmodel.xcgame.hscale,
      // Vertical scale of terrain mesh
      terrainmodel.xcgame.vscale,
      // Heightmap multiplier, excludes vscale
      terrainmodel.xcgame.heightmapvscale);
    l("Retrieving vectors...");
    var e = new Engine(t, config.Engine);
    e.initAir(config.Air);
    if (config.VarioTone) e.initVarioTone(config.VarioTone);
    if (config.Dash) e.initDash(config.Dash);
    l("Generating triangles...");
    var v = new ThreeDeeView(e, terrainmodel, pgmodels, config.ThreeDeeView);

    l("Picking turnpoints...");
    let task = null;
    let taskMap = null;
    if (config.Task) {
      task = new Task();
      task.init(config.Task);
      taskMap = new TaskMap();
      taskMap.init(task);
    }

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
        if (pgmodels) {
          e.paragliders[0].input(dt, km);
          v.updatePg();
          v.updateShadow(e.paragliders[0]);
          v.updateClouds(e.air);
          if (task) task.update(e.paragliders[0].pos);
          if (taskMap) taskMap.update(e.paragliders[0]);
        }
        // Switch camera
        if (km.get(" ")) {
          km.reset(" ");
          v.nextCam();
        }
        v.cam(km, dt, e.paragliders[0]);
        e.update(dt);
        // l("animating");
        v.render();
      }

      requestAnimationFrame(renderloop);
      time = timestamp;
    }

    requestAnimationFrame(renderloop);
  }
}
