/*
 * Shows main menu, can use location.hash shortcuts
 */

// Import browser-friendly axios
import axios from 'axios/dist/axios';
import map from 'lodash/map';

import {l} from './utils';
import {Game} from './game';

import {configs} from '../config/config';

if (ENV === 'development') {
    l("Compiled in DEV mode");
}

function loadConfig(config) {
    // Load scenery
    let promises = [axios.get(config.scenery.url)];
    // Add all different paraglider meshes to be loaded
    let pgmlist = config.ThreeDeeView.pgmeshes;
    for (let k in pgmlist) {
        promises.push(axios.get(pgmlist[k]));
    }
    axios.all(promises).then((resps)=>{
        console.log(resps);
        let terrainmodel = resps[0].data;
        // Activate button
        let menu = document.getElementById("menu");
        let b = document.getElementById("menu-start-button");
        // Extract data from axios response objects
        let pgmodels = map(resps.slice(1), 'data');

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

// Task fly example
if (document.body.id === "main") {
    l("Loading demo");

    // TODO: Check for url hash shortcuts

    console.log(configs);

    // TODO: Render configs in menu

    loadConfig(configs[0]);
}
