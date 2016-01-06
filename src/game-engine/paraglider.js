/*
 * Simple paraglider class
 */

import vec3 from "gl-matrix-vec3";
import mat3 from "gl-matrix-mat3";

export class Paraglider {
  constructor(x, y, z) {
    this.pos = vec3.fromValues(x,y,z);
    this.spd = vec3.fromValues(1,0,0);
    // Creates new identity matrix
    this.steerm = mat3.create();
  }
  increment(dt) {
    // Speed vector needs normalization at some point.
    // Can do that by keeping track of the hor and vert speeds, then
    // normalizing the xy first and then putting z equal to vert spd
    vec3.transformMat3(this.spd, this.spd, this.steerm);
    vec3.add(this.pos, this.pos, this.spd);
  }
  steer(theta) {
    this.steerm[0] =   Math.cos(theta);
    this.steerm[3] = - Math.sin(theta);
    this.steerm[1] =   Math.sin(theta);
    this.steerm[4] =   Math.cos(theta);
  }
}
