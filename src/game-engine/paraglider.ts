/*
 * Simple paraglider class
 */

/// <reference path="../utils/gl-matrix.d.ts" />
import glm = require("gl-matrix");

class Paraglider {
  pos: Float32Array;
  spd: Float32Array;

  constructor(x:number, y:number, z:number) {
    this.pos = vec3.fromValues(x,y,z);
    this.spd = vec3.fromValues(0,0,0);
  }
  increment(dt:number) {
    // Only changes position, not spd
    vec3.add(this.pos, this.pos, this.spd);
  }
}

export = Paraglider;
