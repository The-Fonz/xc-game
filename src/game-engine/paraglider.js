/*
 * Simple paraglider class
 */

import * as THREE from "three";

/** Represents one paraglider, user or AI-controlled */
export class Paraglider {
  /**
   * Initialize pg at position x,y,z
   * @param config Specific Paraglider config
   */
  constructor(x: number, y: number, z: number, config: Object) {
    this.config = config;
    this.pos = new THREE.Vector3(x,y,z);
    // For caching purposes, gets recalculated in this.increment()
    this.speed = new THREE.Vector3();
    this.rotation = new THREE.Euler(0,0,0, 'YZX');
    // Heading in radians
    this.heading = 0;
    // For rendering purposes
    this.bank = 0;
    // Performance state and data
    this.speedstate = 0;
    this.performance = [
      // Glide ratio of 11, 9, 7 at trim, half, full speedbar
      {'vhor': 11, 'vvert': -11/11, 'steeringSensitivity': 6},
      {'vhor': 15, 'vvert': -15/9, 'steeringSensitivity': 2},
      {'vhor': 18, 'vvert': -18/7, 'steeringSensitivity': 1},
    ];
    this.landed = 0;
  }
  /**
   * Get vertical speed for vario tone usage
   * @returns -1 if sinking or on ground, a number in [0,1,...] otherwise
   */
  getVarioToneValue() {
    if (this.landed || this.speed.y < 0) {
      return -1;
    } else {
      return Math.floor(this.speed.y);
    }
  }
  /**
   * Increment by timestep dt (seconds)
   */
  increment(dt: number, terrain) {
    let c = this.increment.cacheVars;
    if (c === undefined) {
      c = {newPos: new THREE.Vector3()};
    }
    // Always set rotation, regardless of if we've landed or not
    this.rotation.set(0,this.heading,0);
    if (this.landed !== 1) {
      // Construct speed vector
      let perf = this.performance[this.speedstate];
      this.speed.set(0,perf.vvert,perf.vhor);
      this.speed.applyEuler(this.rotation);
      // Only changes position, not spd
      this.pos.addScaledVector(this.speed, dt);
    } else {
      // Walk
      if (terrain && this.walk) {
        this.speed.set(0,0,this.walk);
        this.speed.applyEuler(this.rotation);
        // Check if not going up too fast
        // If so, iteratively find max. horizontal distance we can walk
        // Binary search might be more precise and efficient
        let hdist = dt * this.config.walkingHorizontalSpeed;
        let newHeight = 0;
        do {
          // Reset first
          c.newPos.copy(this.pos);
          c.newPos.addScaledVector(this.speed, hdist);
          newHeight = terrain.getHeight(c.newPos) + this.config.offsetY||0;
          c.newPos.y = newHeight;
          // console.log("hdist "+hdist+" newHeight "+newHeight+" old "+this.pos.y);
          hdist *= .7;
          if (hdist < .05) {
            console.error("No possible walking speed found");
            break;
          }
        } while (newHeight > this.pos.y + dt*this.config.walkingVerticalSpeed);
        // console.log("Walking speed limited to "+hdist);
        this.pos.copy(c.newPos);
      }
    }
  }
  /**
   * Process player inputs
   */
  input(dt: number, keymap: KeyMap) {
    let k = keymap;

    // If we just took off...
    if (this.landed === -1) {
      // Depress forward arrow to avoid accidental speedbar engaging
      keymap.reset('ArrowUp');
      this.landed = 0;
    }

    if (!this.landed) {
      // Steering speed in rad/s
      let steeringSensitivity =
      this.performance[this.speedstate]['steeringSensitivity'];
      let steermultiplier = dt * steeringSensitivity;
      let steer = Number(k.get('ArrowLeft')||0 - k.get('ArrowRight')||0);
      this.heading += steermultiplier * steer;
      // Bank in radians
      this.bank = -steer*.07 * steeringSensitivity;
      // Now change speedstate
      this.speedstate += Number(k.get('ArrowUp')||0 - k.get('ArrowDown')||0);
      if (this.speedstate < 0) this.speedstate = 0;
      let l = this.performance.length;
      if (this.speedstate >= l) this.speedstate = l-1;
      // Depress keys
      k.reset('ArrowUp');
      k.reset('ArrowDown');
    } else {
      // Walk
      this.walk = k.get('ArrowUp') - k.get('ArrowDown');
      this.heading += dt * 8 *
            Number(k.get('ArrowLeft')||0 - k.get('ArrowRight')||0);
    }
  }
  /**
   * Sets `this.landed` to `1` if below groundlevel
   * @returns {Boolean} true if landed
   */
  checkLanded(terrain: Terrain) {
    if (this.landed) return true;
    if (terrain.getHeight(this.pos) + (this.config.offsetY||0) > this.pos.y) {
      this.landed = 1;
      this.bank = 0;
      // Zoom out again
      this.speedstate = 0;
      return true;
    }
  }
  /**
   * Check if terrain steep enough to take off, and if so, do it
   */
  checkTakeoff(terrain: Terrain) {
    let c = this.checkTakeoff.cacheVars;
    if (c === undefined) {
      c = {
        gradient: new THREE.Vector3(),
        zaxis: new THREE.Vector3(0,0,1),
      };
    }
    terrain.getGradient(c.gradient, this.pos);
    let steepness = c.gradient.length();
    let gradientDirection = Math.atan(c.gradient.x / c.gradient.z);
    // Correct for south
    if (c.gradient.z > 0) gradientDirection += Math.PI;
    // If really walking down the slope
    let relDir = Math.abs(gradientDirection - this.heading) % (2*Math.PI);
    if (steepness > this.config.takeoffGradient &&
        relDir < this.config.takeoffDirection) {
      // Indicate that we just took off
      this.landed = -1;
      // Take off in direction of gradient
      this.heading = gradientDirection;
    }
  }
  /**
   * Avoid terrain by projecting vector
   * @param {Terrain} terrain Terrain object
   */
  avoidTerrain(terrain) {

  }
  autopilot(dt) {}
}
