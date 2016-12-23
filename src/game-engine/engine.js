/*
 * Takes care of updating entire environment model, includes AI
 */

import {Air} from "./air";
import {Terrain} from "./terrain";
import {Paraglider} from "./paraglider";
import {VarioTone} from '../utils/sound';
import {Dash} from '../overlays/dash';

/**
  * Coordinates interactions between different game elements,
  * like Terrain and Paraglider objects
  */
export class Engine {
  /**
   * Needs to know about Terrain and config
   * @param config Contains config for Engine itself and children elements
   *               like VarioTone, Dash
   */
  constructor(terrain: Terrain, config: Object) {
    this.terrain = terrain;
    this.config = config;
    // Init lift and paragliders based on config
    var pglist = config['paragliders'];
    this.paragliders = [];
    for (var i=0; i<pglist.length; i++) {
      var pos = pglist[i].position;
      this.paragliders.push(new Paraglider(pos.x, pos.y, pos.z,
                                           this.config.Paraglider));
    }
    // Only use if configured
    if (config.VarioTone) {
      this.variotone = new VarioTone(config.VarioTone);
      this.variotone.set(-1);
    }
    if (config.Dash) {
      this.dash = new Dash(config.Dash);
    }
    if (config.Air) {
      this.air = new Air(this.terrain, this.config.Air);
    }
  }
  /**
   * Process interactions between game elements with timestep dt
   */
  update(dt: number) {
    dt = dt * this.config.timeMultiplier || 1;
    // Update air
    if (this.air) {
      this.air.incrementAir(dt);
      this.air.incrementThermalIntersections(this.paragliders);
    }
    // Update paragliders
    for (var i=0; i<this.paragliders.length; i++) {
      let pg = this.paragliders[i];
      // Check if landed
      let landed = pg.checkLanded(this.terrain);
      if (landed) {
        // Check if able to take off
        pg.checkTakeoff(this.terrain);
      }
      // Do terrain collision avoidance
      pg.avoidTerrain(this.terrain);
      // Increment position
      pg.increment(dt, this.terrain);
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
