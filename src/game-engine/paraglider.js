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
    // Vector to store absolute airmass movement
    this.airmovement = vec3.create();
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
      sinkrates: [ -10/10, -14/8.5, -18/7],
      // Turn rate in rad/s
      turnrates: [ 5, 2, 1]
    }
  }


  increment(dt) {

    // Change direction if steering
    this.direction += dt * this.turn * this.perf.turnrates[this.perf.spdstate];

    // Remember current speed for trapezoidal integration later on
    this._cachespd = vec3.clone(this.spd);

    // Calculate speed vector anew each time. Bonus: avoids normalization
    var spd = this.perf.fwdspds[this.perf.spdstate];
    this.spd = vec3.fromValues(
      Math.cos(this.direction) * spd,
      Math.sin(this.direction) * spd,
      this.perf.sinkrates[this.perf.spdstate]);

    // Calculate speed vector using trapezoidal rule
    vec3.lerp(this._cachespd, this._cachespd, this.spd, .5);

    // Add airspeed, then add absolute airmass movement
    vec3.scaleAndAdd(this.pos, this.pos, this._cachespd, dt);
    vec3.scaleAndAdd(this.pos, this.pos, this.airmovement, dt);
  }

  // Left with normal turnrate is -1, right 1, center 0
  steer(theta) {
    this.turn = theta;
  }


  // Speed up or down, 0 means go back to trimspeed
  changeSpeed(posneg) {
    if (posneg > 0) {
      this.perf.spdstate = Math.min(this.perf.spdstate + 1,
                                    this.perf.fwdspds.length - 1);
    } else if (posneg < 0) {
      this.perf.spdstate = Math.max(this.perf.spdstate - 1, 0);
    } else {
      this.perf.spdstate = 0;
    }
  }


  // Terrain collision avoidance
  avoidTerrain(terrain) {
    // Use cache to avoid object creation
    this._agl   = vec3.create();
    this._grad  = vec3.create();
    this._lr    = vec3.create();
    this._probe = vec3.create();

    // Point collision probe in direction of groundspeed
    vec3.add(this._probe, this.spd, this.airmovement);
    vec3.normalize(this._probe, this._probe);

    // Scale by turn radius, which is spd/turnrate, multiply by margin
    vec3.scale(this._probe, this._probe,
            this.perf.fwdspds[this.perf.spdstate] /
            this.perf.turnrates[this.perf.spdstate] *
            1.4);
    // Get probe absolute location
    this._probe = vec3.add(this._probe, this.pos, this._probe);

    terrain.getHeight(this._agl, this._probe);

    // Steer away from terrain
    if (this._probe[2] < this._agl[2]) {
      // Go back to trimspeed
      this.changeSpeed(0);
      terrain.getGradient(this._grad, this._probe);
      vec3.cross(this._lr, this._grad, this.spd);

      this._lr[2] < 0 ? this.steer(1) : this.steer(-1);
    }
  }


  avoidPilots(pglist) {}

}
