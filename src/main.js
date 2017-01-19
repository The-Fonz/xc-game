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

  axios.get("../obj/sceneries/grandcanyon/grandcanyon.json")
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
    promiseGet("../obj/sceneries/grandcanyon/grandcanyon.json").then(JSON.parse),
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
    promiseGet("../obj/sceneries/grandcanyon/grandcanyon.json").then(JSON.parse),
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
if (document.body.id === "demo") {
  l("Loading demo");

  let config = BASICCONFIG;

  config.Engine.paragliders = [
    {position: {x:2500, y:800, z:500}},
  ];

  config.Task = {
    "traceLength": 600,
    // Padding around task view in world units
    "bboxPadding": 1000,
    "turnpoints": [
      // xyz coords
      {"name": "Mountain1", "type": "start", "coordinates": [2000,0,1500], "radius": 600},
      {"name": "Village2", "type": "turnpoint", "coordinates": [4000,0,3000], "radius": 500},
      {"name": "Pond3", "type": "finish", "coordinates": [2500,0,4500], "radius": 400},
    ],
  };

  let promises = [
    promiseGet("../obj/sceneries/grandcanyon/grandcanyon.json").then(JSON.parse),
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
    // Activate button
    let menu = document.getElementById("menu");
    let b = document.getElementById("menu-start-button");
    // Load game
    let g = new Game(terrainmodel, pgmodels, config);
    // Hide instruments
    let overlays = document.getElementById("overlays");
    overlays.style.visibility = "hidden";
    // Pause immediately
    g.setBlur(true);
    b.addEventListener("click", (ev) => {
      menu.style.visibility = "hidden";
      overlays.style.visibility = "visible";
      g.setBlur(false);
    });
  });
}
