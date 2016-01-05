/*
 * Simple paraglider class
 */

import vec3 from "gl-matrix-vec3";

export class Paraglider {
  constructor(x, y, z) {
    this.pos = vec3.fromValues(x,y,z);
    this.spd = vec3.fromValues(0,0,0);
  }
  increment(dt) {
    // Only changes position, not spd
    vec3.add(this.pos, this.pos, this.spd);
  }
}
