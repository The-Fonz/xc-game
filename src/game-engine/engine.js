/*
 * Takes care of updating entire environment model, includes AI
 */

import {Terrain} from "./terrain";
import {Lift} from "./lift";
import {Paraglider} from "./paraglider";
import {Input} from "../utils/input";

export class Engine {
  constructor(terrain, config) {
    this.terrain = terrain;
    this.lift = new Lift(this.terrain);
    this.input = new Input();
    // Init lift and paragliders based on config
    var pglist = config['paragliders'];
    this.paragliders = [];
    for (var i=0; i<pglist.length; i++) {
      var pg = pglist[i];
      this.paragliders.push(new Paraglider(pg.x, pg.y, pg.z));
    }
  }

  update(dt) {

    var player = this.paragliders[0];

    var k = this.input.pressedKeys;

    // Steer during coming frame
    if (k["Left"]) player.steer(-1);
    else if (k["Right"]) player.steer(1);
    else player.steer(0);

    // Delete keypress to avoid rapid speedups/downs
    if (k["Down"]) {
      delete k["Down"];
      player.changeSpeed(-1);
    } else if (k["Up"]) {
      delete k["Up"];
      player.changeSpeed(1);
    }

    this.lift.increment(dt);

    // Update paragliders
    for (var i=0; i<this.paragliders.length; i++) {
      var p = this.paragliders[i];

      this.lift.air(p.airmovement, p.pos);

      p.avoidTerrain(this.terrain);
      p.increment(dt);
    }
  }
}
