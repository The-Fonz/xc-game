/*
 * All thermal and dynamic upwind logic
 */

import vec3 from "gl-matrix-vec3";

class Thermal {

  constructor(pos, radius) {
    this.pos = pos;
    this.radius = radius;
  }

}

export class Lift {

  constructor(terrain) {
    this.terrain = terrain;
    this.thermals = [];
  }

  // Generate new thermals
  increment(dt) {
    var r = Math.random;
    // Probability of 1 new thermal forming per second per km^2
    var thermalprob = dt * 1;

    var x = r() * this.terrain.width;
    var y = r() * this.terrain.height;

    if (Math.random() < thermalprob) {
      this.thermals.unshift(new Thermal(
        vec3.fromValues(x, y, 0), 10));
      console.log(`New thermal created at ${this.thermals[0].pos}`);
    }
    if (this.thermals.length > 40) this.thermals.pop();
  }

  // Get air movement vector at some 3D position
  air(out, pos) {
    vec3.set(out,0,0,0);
    // Make 2D vector by setting height to 0
    var _2dpos = vec3.clone(pos);
    _2dpos[2] = 0;
    // Check if within radius of thermal
    for (var i=0; i<this.thermals.length; i++) {
      var thermal = this.thermals[i];
      if (vec3.distance(_2dpos, thermal.pos) < thermal.radius) {
        out[2] = 5;
      }
    }
  }

}
