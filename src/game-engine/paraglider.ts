/*
 * Paraglider logic, including collision avoidance and AI algorithms.
 * One class for both player and AI.
 */

import vect = require("../utils/vect");

class Paraglider {
  pos: vect.vec3D;
  spd: vect.vec3D;

  constructor(x:number, y:number, z:number) {
    this.pos = new vect.vec3D(x,y,z);
    this.spd = new vect.vec3D(.1,.1,0);
  }
  increment(dt:number) {
    // Only changes position, not spd
    this.pos.x += this.spd.x * dt;
    this.pos.y += this.spd.y * dt;
    this.pos.z += this.spd.z * dt;
  }
}

export = Paraglider;
