/*
 * Simple paraglider class
 */

import vec3 from "gl-matrix-vec3";
import mat3 from "gl-matrix-mat3";

export class Paraglider {

  constructor(x, y, z) {

    // Performance properties
    this.perf = {
      // Current speed state (trim, half bar, full bar)
      spdstate : 0,
      // Forward speeds in m/s
      fwdspds  : [10, 14, 18],
      // Sink rates in m/s
      sinkrates: [ 1, 14/8.5, 18/7],
      // Turn rate in rad/s
      turnrates: [ 4, 2, 1]
    }

    this.pos = vec3.fromValues(x,y,z);

    this.spd = vec3.fromValues(10,0,0);
    // Creates new identity matrix
    this.steerm = mat3.create();
  }

  increment(dt) {
    // Speed vector needs normalization at some point.
    // Can do that by normalizing, then multiplying by size of hor+vert velocity vect
    // Also take dt into account when steering!
    vec3.transformMat3(this.spd, this.spd, this.steerm);
    vec3.scaleAndAdd(this.pos, this.pos, this.spd, dt);
  }

  // Steer with radial speed
  steer(theta) {
    this.steerm[0] =   Math.cos(theta);
    this.steerm[3] = - Math.sin(theta);
    this.steerm[1] =   Math.sin(theta);
    this.steerm[4] =   Math.cos(theta);
  }

  // Function to check if landed

  // Terrain collision avoidance
  avoidTerrain(terrain) {
    // Use cache to avoid object creation
    this.th = vec3.create();
    this.g  = vec3.create();
    this.lr = vec3.create();

    terrain.getHeight(this.th, this.pos);

    // Steer away from terrain
    if (this.pos[2] < this.th[2]) {
      terrain.getGradient(this.g, this.pos);
      vec3.cross(this.lr, this.g, this.spd);
      this.lr = this.lr[2] < 0 ? this.steer(.08) : this.steer(-.08);
    }
  }

  avoidPilots(pglist) {}

}
