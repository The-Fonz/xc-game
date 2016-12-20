/*
 * Takes care of updating entire environment model, includes AI
 */

import {Terrain} from "./terrain";
import {Paraglider} from "./paraglider";

export class Engine {
  constructor(terrain, config) {
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

  update(dt) {
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
