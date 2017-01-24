/*
 * Shows main menu, can use location.hash shortcuts
 */

// Import browser-friendly axios
import axios from 'axios/dist/axios';
import map from 'lodash/map';

import {l} from './utils';
import {Game} from './game';
import {Menu} from './overlays/menu';

// List of configs
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
    return axios.all(promises).then((resps)=>{
        let terrainmodel = resps[0].data;
        // Extract data from axios response objects
        let pgmodels = map(resps.slice(1), 'data');
        let game = new Game(terrainmodel, pgmodels, config);
        // Return game object
        return game;
    });
}

if (document.body.id === "main") {

    l("Loading demo");

    // TODO: Check for url hash shortcuts

    console.log(configs);

    // Hide instruments
    let overlays = document.getElementById("overlays");
    overlays.style.visibility = "hidden";

    let menu = new Menu("menu");
    // Use callback
    menu.render_missions(configs, (mission)=>{
        console.info(`Mission "${mission.name}" clicked`);
        menu.render_loading_mission(mission);
        loadConfig(mission).then((game)=>{
            // Pause immediately
            game.setBlur(true);
            menu.render_playbtn(()=>{
                menu.visible(false);
                overlays.style.visibility = "visible";
                game.setBlur(false);
            });
        });
    });
}
