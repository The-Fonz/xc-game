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

// Basic config to avoid repetition. Override to customize
// Namespaced to clearly indicate to which module config applies
var BASICCONFIG = {
  "Engine": {
    "paragliders": [],
    // Speed up simulation by this multiplication factor
    // Does NOT influence steering or camera movements,
    // just the pg speed
    "timeMultiplier": 30,
    // Nested config because Engine instantiates Paraglider objects
    "Paraglider": {
      // Land when pg's centroid is this close to ground. Depends on 3D model
      "offsetY": 15,
      // Dimensionless
      "takeoffGradient": .5,
      // Take off if gradient enough and direction within this much rad
      "takeoffDirection": 1,
      // Horizontal and vertical bounds for walking speed
      "walkingHorizontalSpeed": 3,
      "walkingVerticalSpeed": 2,
      // Possibly limit the gradient that can be handled, but that would
      // require designing the map to contain paths that are not too steep
    },
  },
  "Air": {
  },
  "Task": {
  },
  "ThreeDeeView": {
    "clippingplane": 3000,
    "fog": {"hex": 0xFFFFFF, "near": 400, "far": 3000},
    "clearcolor": "white",
    // Different meshes to be used in this.Engine.paragliders
    "pgmeshes": {
      "simplepg": "../obj/pgmodels/simplepg.json",
    },
    // Order of cameras determines the cycle order and first one instantiated
    "cameras": [
      {'type': 'cloud', 'cloudbase': 1500},
      {'type': 'fixed', 'position': [2E3, 2E3, 2E3]},
      {'type': 'relative', 'initialRotation': [-1,-2,0]},
      {'type': 'free'},
    ],
  },
};

// Entry point for terrain load example
if (document.body.id === "terrain-load") {
  l("Loading terrain load example");

  let config = BASICCONFIG;
  config.ThreeDeeView.showheightmap = true;
  config.ThreeDeeView.axishelper = 3000;
  config.ThreeDeeView.flyaround = true;

  config.ThreeDeeView.cameras = [{'type': 'free'}];

  l("Loading resources...");

  promiseGet("../terrainmaker/grandcanyon.ignore.json")
  .then(JSON.parse)
  .then((json)=>{
    let g = new Game(json, null, config);
  });
}

// Entry point for pg move example
if (document.body.id === "freefly-example") {
  l("Loading freefly example");

  let config = BASICCONFIG;

  config.Engine.paragliders = [
    {position: {x:0, y:500, z:0}},
  ]

  l("Loading resources...");

  let promises = [
    promiseGet("../terrainmaker/grandcanyon.ignore.json").then(JSON.parse),
  ];
  // Add all different paraglider meshes to be loaded
  let pgmlist = config.ThreeDeeView.pgmeshes;
  for (var k of Object.keys(pgmlist)) {
    promises.push(promiseGet(pgmlist[k]).then(JSON.parse));
  }
  Promise.all(promises).then((values)=>{
    let terrainmodel = values[0];
    // Get all values returned by promises but the first
    let pgmodels = values.slice(1);
    let g = new Game(terrainmodel, pgmodels, config);
  });
}



class Game {
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
    l("Generating triangles...");
    var v = new ThreeDeeView(e, terrainmodel, pgmodels, config.ThreeDeeView);

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
