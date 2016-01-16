/*
 * Simple paraglider class
 */

import vec3 from "gl-matrix-vec3";
import mat3 from "gl-matrix-mat3";

export class Paraglider {

  constructor(x, y, z) {

    // Position in (virtual) m
    this.pos = vec3.fromValues(x,y,z);
    // Initialize speed vector even though it is recreated each increment
    this.spd = vec3.create();
    // Direction in rad, 0 is east
    this.direction = 0;
    // Left with normal turnrate is -1, right 1, center 0
    this.turn  = 0;

    // Performance properties
    this.perf = {
      // Current speed state (trim, half bar, full bar)
      spdstate : 0,
      // Forward speeds in m/s
      fwdspds  : [10, 14, 18],
      // Sink rates in m/s
      sinkrates: [ -0, -14/8.5, -18/7],
      // Turn rate in rad/s
      turnrates: [ 5, 2, 1]
    }
  }


  increment(dt) {

    // Change direction if steering
    this.direction += dt * this.turn * this.perf.turnrates[this.perf.spdstate];

    var spd = this.perf.fwdspds[this.perf.spdstate];

    // Calculate speed vector anew each time. Bonus: avoids normalization
    this.spd = vec3.fromValues(
      Math.cos(this.direction) * spd,
      Math.sin(this.direction) * spd,
      this.perf.sinkrates[this.perf.spdstate]);

    vec3.scaleAndAdd(this.pos, this.pos, this.spd, dt);
  }


  // Left with normal turnrate is -1, right 1, center 0
  steer(theta) {
    this.turn = theta;
  }


  // Change speed state, positive is increase, anything else means decrease
  changeSpeed(posneg) {
    if (posneg > 0) {
      this.perf.spdstate = Math.min(this.perf.spdstate + 1,
                                    this.perf.fwdspds.length - 1);
    } else {
      this.perf.spdstate = Math.max(this.perf.spdstate - 1, 0);
    }
  }


  // Function to check if landed


  // Terrain collision avoidance
  avoidTerrain(terrain) {
    // Use cache to avoid object creation
    this._agl   = vec3.create();
    this._grad  = vec3.create();
    this._lr    = vec3.create();
    this._probe = vec3.create();

    // Extend collision probe in front of pilot
    this._probe = vec3.normalize(this._probe, this.spd);
    // Scale by turn radius, which is spd/turnrate, multiply by margin
    vec3.scale(this._probe, this._probe,
            this.perf.fwdspds[this.perf.spdstate] /
            this.perf.turnrates[this.perf.spdstate] *
            1.4);
    // Get probe absolute location
    this._probe = vec3.add(this._probe, this.pos, this._probe);

    terrain.getHeight(this._agl, this._probe);

    // Steer away from terrain
    if (this.pos[2] < this._agl[2]) {
      terrain.getGradient(this._grad, this.pos);
      vec3.cross(this._lr, this._grad, this.spd);

      this._lr[2] < 0 ? this.steer(1) : this.steer(-1);
    }
  }


  avoidPilots(pglist) {}

}
