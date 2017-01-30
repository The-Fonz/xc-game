/*
 * Shows main menu, can use location.hash shortcuts
 */

// Import browser-friendly axios
import axios from 'axios/dist/axios';
import map from 'lodash/map';
import find from 'lodash/find';

import {l} from './utils';
import {Game} from './game';
import {Menu} from './overlays/menu';

// List of configs
import {configs} from '../config-game/config';
import {title, introtext} from '../config-game/text';

if (ENV === 'development') {
    l("Compiled in DEV mode");
}

function loadConfig(config) {
    // Load scenery
    let promises = [axios.get(config.scenery.url)];
    // Load pg meshes, trees etc.
    let assets = config.ThreeDeeView.assets;
    for (let k in assets) {
        promises.push(axios.get(assets[k]));
    }
    return axios.all(promises).then((resps)=>{
        let terrainmodel = resps[0].data;
        // Extract data from axios response objects
        let assets = map(resps.slice(1), 'data');
        let game = new Game(terrainmodel, assets, config);
        // Return game object
        return game;
    });
}

function showMenu() {
    // Hide instruments
    let overlays = document.getElementById("overlays");
    overlays.style.visibility = "hidden";

    let menu = new Menu("menu");
    menu.set_title(title);
    menu.set_intro(introtext);
    // Use callback
    menu.render_missions(configs, (mission)=>{
        l(`Mission "${mission.name}" clicked`);
        menu.render_loading_mission(mission);
        location.hash = mission.slug;
        loadConfig(mission).then((game)=>{
            // Pause immediately
            game.setBlur(true);
            // Pass callback that is called on play button press
            menu.render_playbtn(()=>{
                menu.visible(false);
                overlays.style.visibility = "visible";
                game.setBlur(false);
            });
        });
    });
}

if (document.body.id === "main") {

    l("Loading demo");

    // Check for url hash shortcuts
    let mission = null;
    if (location.hash) {
        mission = find(configs, (elem) => {
            return elem.slug === location.hash.replace("#", "");
        });
        if (!mission) {
            l(`Did not find a matching mission slug for hash ${location.hash}`);
        }
    }
    if (mission) {
        l(`Found matching mission from slug, loading...`);
        loadConfig(mission);
        document.getElementById("menu").style.visibility = "hidden";
    } else {
        showMenu();
    }
}
