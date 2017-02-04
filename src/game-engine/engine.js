/*
 * Takes care of updating entire environment model, includes AI
 */

import {Air} from "./air";
import {Terrain} from "./terrain";
import {Paraglider} from "./paraglider";
import {VarioTone} from './sound';
import {Dash} from '../overlays/dash';

/**
 * Coordinates interactions between low-level game elements,
 * like Terrain and Paraglider objects
 */
export class Engine {
    constructor() {}
    /**
     * Needs to know about Terrain and config
     * @param config Contains config for Engine itself and children elements
     *               like VarioTone, Dash
     */
    setConfig(config: Object) {
        this.config = config;
        // Init lift and paragliders based on config
        var pglist = config['paragliders'];
        this.paragliders = [];
        for (var i=0; i<pglist.length; i++) {
            var pos = pglist[i].position;
            this.paragliders.push(new Paraglider(pos.x, pos.y, pos.z,
                this.config.Paraglider));
        }
    }
    initVarioTone(cfg) {
        this.variotone = new VarioTone(cfg);
        this.variotone.set(-1);
    }
    initDash(cfg) {
        this.dash = new Dash(cfg);
    }
    /**
     * Process interactions between game elements with timestep dt
     */
    update(terrain, air, dt: number) {
        dt = dt * this.config.timeMultiplier || 1;
        // Update air
        if (air) {
            air.incrementAir(terrain, dt);
            air.incrementThermalIntersections(this.paragliders);
        }
        // Update paragliders
        for (var i=0; i<this.paragliders.length; i++) {
            let pg = this.paragliders[i];
            // Check if landed
            let landed = pg.checkLanded(terrain);
            if (landed) {
                // Check if able to take off
                pg.checkTakeoff(terrain);
            }
            // Do terrain collision avoidance
            pg.avoidTerrain(terrain);
            // Increment position
            pg.increment(dt, terrain);
            // Set vario tone and dash for player
            if (i===0) {
                if (this.variotone) {
                    this.variotone.set(pg.getVarioToneValue());
                }
                if (this.dash) {
                    this.dash._update(pg);
                }
            }
            // Update climb rate because of thermals
            let maxClimb = 0;
            for (let thermal of pg.meta.air.intersectingThermalList) {
                let climb = thermal.getUpdraft(pg.pos);
                if (climb > maxClimb) maxClimb = climb;
            }
            pg.setAirVector(0,maxClimb,0);
        }
    }
}
