/*
 * Takes care of updating entire environment model, includes AI
 */

import {Terrain} from "./terrain";
import {Paraglider} from "./paraglider";

export class Engine {
  constructor(terrain, config) {
    this.terrain = terrain;
    // Init lift and paragliders based on config
    var pglist = config['paragliders'];
    this.paragliders = [];
    for (var i=0; i<pglist.length; i++) {
      var pg = pglist[i];
      this.paragliders.push(new Paraglider(pg.x, pg.y, pg.z));
    }
  }

  update(dt) {
    // Update paragliders
    for (var i=0; i<this.paragliders.length; i++) {
      this.paragliders[i].increment(dt);
    }
  }
}
