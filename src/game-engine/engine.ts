/*
 * Takes care of updating entire environment model, including AI
 */

import Terrain = require("./terrain");
import Paraglider = require("./paraglider");
import Lift = require("./lift");

class Engine {
  terrain: Terrain;
  paragliders: Paraglider[];
  lift: Lift;

  constructor(terrain:Terrain, config:JSON) {
    this.terrain = terrain;
    // Init lift and paragliders based on config
    var pglist = config['paragliders'];
    this.paragliders = [];
    for (var i=0; i<pglist.length; i++) {
      var pg = pglist[i];
      this.paragliders.push(new Paraglider(pg.x, pg.y, pg.z));
    }
  }

  update(dt:number):void {
    // Update paragliders
    for (var i=0; i<this.paragliders.length; i++) {
      this.paragliders[i].increment(dt);
    }
  }

  updatePlayer() {}
}

export = Engine;
