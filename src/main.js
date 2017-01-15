/*
 * Collection of all entry points. They load by identifying the body's id tag
 */

import {Game} from './game';
import {promiseGet} from './utils/http';
import {l} from './utils/logging';
import {BASICCONFIG} from './config';
import axios from 'axios';

// Entry point for terrain load example
if (document.body.id === "terrain-load") {
  l("Loading terrain load example");

  let config = BASICCONFIG;
  config.ThreeDeeView.showheightmap = true;
  config.ThreeDeeView.axishelper = 3000;
  config.ThreeDeeView.flyaround = true;
  config.Dash = null;

  config.ThreeDeeView.cameras = [{'type': 'free'}];

  l("Loading resources...");

  axios.get("../terrainmaker/grandcanyon.ignore.json")
  .then((resp)=>{
    let g = new Game(resp.data, null, config);
  });
}

// Entry point for pg move example
if (document.body.id === "freefly-example") {
  l("Loading freefly example");

  let config = BASICCONFIG;

  config.Engine.paragliders = [
    {position: {x:0, y:800, z:0}},
  ];

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

// Task fly example
if (document.body.id === "task-example") {
  l("Loading task example");

  let config = BASICCONFIG;

  config.Engine.paragliders = [
    {position: {x:200, y:800, z:200}},
  ];

  config.Task = {
    "traceLength": 600,
    // Padding around task view in world units
    "bboxPadding": 600,
    "turnpoints": [
      // xyz coords
      {"name": "Mountain1", "type": "start", "coordinates": [1000,0,500], "radius": 200},
      {"name": "Village2", "type": "turnpoint", "coordinates": [2000,0,1000], "radius": 300},
      {"name": "Pond3", "type": "finish", "coordinates": [2000,0,2000], "radius": 100},
    ],
  };

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
