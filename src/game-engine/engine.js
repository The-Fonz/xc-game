/*
 * Takes care of updating entire environment model, includes AI
 */

import {Terrain} from "./terrain";
import {Paraglider} from "./paraglider";

/**
  * Coordinates interactions between different game elements,
  * like Terrain and Paraglider objects
  */
export class Engine {
  /**
   * Needs to know about Terrain and config
   */
  constructor(terrain: Terrain, config: Object) {
    this.terrain = terrain;
    this.config = config;
    // Init lift and paragliders based on config
    var pglist = config['paragliders'];
    this.paragliders = [];
    for (var i=0; i<pglist.length; i++) {
      var pos = pglist[i].position;
      this.paragliders.push(new Paraglider(pos.x, pos.y, pos.z));
    }
  }
  /**
   * Process interactions between game elements with timestep dt
   */
  update(dt: number) {
    dt = dt * this.config.timeMultiplier || 1;
    // Update paragliders
    for (var i=0; i<this.paragliders.length; i++) {
      let pg = this.paragliders[i];
      // Check if landed
      pg.checkLanded(this.terrain, this.config.pgOffsetY);
      // Do terrain collision avoidance
      pg.avoidTerrain(this.terrain, this.config.pgOffsetY);
      // Increment position
      this.paragliders[i].increment(dt);
    }
  }
}
