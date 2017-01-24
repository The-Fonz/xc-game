/*
 * Game class
 */

import {Terrain} from './game-engine/terrain';
import {Engine} from './game-engine/engine';
import {ThreeDeeView} from './render/view3d';
import {Controls} from './game-engine/input';
import {Task} from './game-engine/task';
import {TaskMap} from './overlays/taskmap';
import {l} from './utils';

/** Handles interaction between high-level game elements */
export class Game {
  constructor(terrainmodel, pgmodels, config){
    // Load terrain, engine, view (in that order)
    var km = new Controls();
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
    this.blur = false;
    // requestAnimationFrame only runs when tab is active
    // Handle blur/focus event to stop simulation
    // when window is hidden while tab is active
    window.addEventListener('blur', (ev) => {
      this.blur=true;
      l("window blurred, stopping simulation");
    });
    window.addEventListener('focus', (ev) => {
      this.blur=false;
      l("window focused, resuming simulation");
    });

    var time = 0;
    let firsttime = true;
    let renderloop = (timestamp) => {
      if (time===0) time = timestamp;

      let dt = (timestamp-time)/1000;

      // Run at least once, even when blurred from start
      if (this.blur === false || firsttime) {
        firsttime = false;
        if (pgmodels) {
          e.paragliders[0].input(dt, km);
          v.updatePg();
          v.updateShadow(e.paragliders[0]);
          v.updateClouds(e.air);
          if (task) {
            if (task.update(e.paragliders[0].pos)) {

            }
            ;
          }
          if (taskMap) taskMap.update(e.paragliders[0]);
        }
        // Switch camera
        if (config.ThreeDeeView.cameras.length > 1) {
          if (km.get("spacebar")) {
            km.reset("spacebar");
            v.nextCam();
          }
          v.cam(km, dt, e.paragliders[0]);
          e.update(dt);
        }
        // l("animating");
        v.render();
      }

      requestAnimationFrame(renderloop);
      time = timestamp;
    }

    requestAnimationFrame(renderloop);
  }
  /* Used to blur/pause simulation */
  setBlur(bool: Boolean) {
    // Replace null/NaN/0 etc. with false
    this.blur = bool || false;
  }
}
