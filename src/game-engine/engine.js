/*
 * Takes care of updating entire environment model, includes AI
 */

import {Terrain} from "./terrain";
import {Paraglider} from "./paraglider";
import {Input} from "../utils/input";

export class Engine {
  constructor(terrain, config) {
    this.terrain = terrain;
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
    // Update first paraglider's speed, which is player
    var k = this.input.pressedKeys;

    var p = this.paragliders[0];

    if (k["Left"]) p.steer(-.08);
    else if (k["Right"]) p.steer(.08);
    else p.steer(0);

    // Update paragliders
    for (var i=0; i<this.paragliders.length; i++) {
      var p = this.paragliders[i];
      p.avoidTerrain(this.terrain);
      p.increment(dt);
    }
  }
}
