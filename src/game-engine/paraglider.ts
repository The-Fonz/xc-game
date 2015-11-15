/*
 * Paraglider logic, including collision avoidance and AI algorithms.
 * One class for both player and AI.
 */

import vect = require("../utils/vect");

export class Paraglider {
  pos: vect.vec3D;
  spd: vect.vec3D;

  constructor(x:number, y:number, z:number) {
    this.pos = new vect.vec3D(x,y,z);
    this.spd = new vect.vec3D(0,0,0);
  }
  increment(dt:number) {
    // Only changes position, not spd
    this.pos.add(vect.scale(this.spd, dt));
  }
}
