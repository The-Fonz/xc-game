/*
 * Game class
 */

import axios from 'axios/dist/axios';

import {Air} from './game-engine/air';
import {Task} from './game-engine/task';
import {Engine} from './game-engine/engine';
import {Terrain} from './game-engine/terrain';
import {TaskMap} from './overlays/taskmap';
import {Controls} from './game-engine/input';
import {ThreeDeeView} from './render/view3d';
import {HeightmapLoader} from './loaders/heightmaploader';
import {l} from './utils';

/**
 * Handles interaction between high-level game elements
 */
export class Game {
    constructor() {}
    /**
     * Gets passed asset load promises so it can instantiate modules asynchronously.
     */
    init(asset_promises, config){
        this.config = config;
        let loadPromises = [];
        let p;

        // Instantiate all classes
        this.heightmaploader = new HeightmapLoader();
        this.controls = new Controls();
        this.engine = new Engine();
        this.air = new Air();
        this.threedeeview = new ThreeDeeView();
        this.terrain = new Terrain();

        // Set config where needed
        this.engine.setConfig(config.Engine);
        this.air.setConfig(config.Air);

        if (config.Task) {
            this.task = new Task();
            this.task.init(config.Task);
            this.taskMap = new TaskMap();
            this.taskMap.init(this.task);
        }

        if (config.VarioTone) this.engine.initVarioTone(config.VarioTone);
        if (config.Dash) this.engine.initDash(config.Dash);

        // Heightmap
        p = asset_promises[0].then((heightmapimg) => {
            let hm_1d_array = this.heightmaploader.loadImg(heightmapimg);
            let hm_2d_array = [];
            let i_1d = 0;
            for (let j=0; j<heightmapimg.height; j++) {
                let a = [];
                for (let i=0; i<heightmapimg.width; i++) {
                    a.push(hm_1d_array[i_1d]);
                    i_1d++;
                }
                hm_2d_array.push(a);
            }
            // TODO: Get proper metadata
            // TODO: load heightmaparray
            this.terrain.setHeightmap(hm_2d_array);
            return true;
        });
        loadPromises.push(p);


        // Terrainmodel, assets
        p = axios.all(asset_promises.slice(1))
            .then((assets) => {
            this.terrain.setScale(assets[0].xcgame.hscale, assets[0].xcgame.vscale, assets[0].xcgame.heightmapvscale);
            this.threedeeview.setConfig(this.engine, assets[0], assets.slice(1), config.ThreeDeeView);
            this.threedeeview.initTrees(this.terrain);
            return true;
        });
        loadPromises.push(p);

        // Start rendering when all game modules have loaded
        return axios.all(loadPromises).then(() => {
            // Instantiate thermals
            // TODO: do terrain extent calc in terrain metadata load, and increment thermals there
            this.air.incrementAir(this.terrain);
            this.startRenderloop();
            // Return game object to promise receiver
            return this;
        });
    }
    /* Used to blur/pause simulation */
    setBlur(bool: Boolean) {
        // Replace null/NaN/0 etc. with false
        this.blur = bool || false;
    }
    startRenderloop() {
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
                // TODO: Make better check for actual players
                if (this.engine.paragliders.length) {
                    this.engine.paragliders[0].input(dt, this.controls);
                    this.threedeeview.updatePg();
                    this.threedeeview.updateShadow(this.engine.paragliders[0]);
                    this.threedeeview.updateClouds(this.air);
                    if (this.task) {
                        if (this.task.update(this.engine.paragliders[0].pos)) {

                        }
                    }
                    if (this.taskMap) this.taskMap.update(this.engine.paragliders[0]);
                }
                // Switch camera
                if (this.config.ThreeDeeView.cameras.length > 1) {
                    if (this.controls.get("spacebar")) {
                        this.controls.reset("spacebar");
                        this.threedeeview.nextCam();
                    }
                    this.threedeeview.cam(this.controls,
                                          dt,
                                          this.engine.paragliders[0]);
                    this.engine.update(this.terrain, this.air, dt);
                }
                this.threedeeview.render();
            }

            requestAnimationFrame(renderloop);
            time = timestamp;
        }
        requestAnimationFrame(renderloop);
    }
}
