/*
 * Simple paraglider class
 */

import * as THREE from "three";

/**
 * Represents one paraglider, user or AI-controlled. Other classes can attach
 * and keep track of metadata in the `.meta` attribute. They must namespace
 * their variables by lowercase class name, e.g. `.meta.air.*`.
 */
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
    let s = this.config.speedMultiplier;
    this.performance = [
      // Glide ratio of 11, 9, 7 at trim, half, full speedbar
      {'vhor': 11*s, 'vvert': -11/11*s, 'steeringSensitivity': 6},
      {'vhor': 15*s, 'vvert': -15/9*s, 'steeringSensitivity': 2},
      {'vhor': 18*s, 'vvert': -18/7*s, 'steeringSensitivity': 1},
    ];
    this.landed = 0;
    // Place for external methods to attach and keep track of properties.
    this.meta = {};
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
   * Get step of bar pg is on for use in e.g. dashboard
   * @returns {number} -1,0,1,2 for walk, trim, first, second step
   */
  getSpeedbarStep() {
    if (this.landed) return -1;
    return this.speedstate;
  }
  /**
   * Set air vector
   */
  setAirVector(x,y,z) {
    if (this.airVector === undefined) {
      this.airVector = new THREE.Vector3();
    }
    this.airVector.set(x,y,z);
  }
  /**
   * Increment by timestep dt (seconds)
   */
  increment(dt: number, terrain) {
    if (this.increment.cacheVars === undefined) {
      this.increment.cacheVars = {newPos: new THREE.Vector3()};
    }
    let c = this.increment.cacheVars;
    // Always set rotation, regardless of if we've landed or not
    this.rotation.set(0,this.heading,0);
    if (this.landed !== 1) {
      // Construct speed vector
      let perf = this.performance[this.speedstate];
      this.speed.set(0,perf.vvert,perf.vhor);
      if (this.airVector) this.speed.add(this.airVector);
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
      let steer = Number(k.get('left') - k.get('right'));
      this.heading += steermultiplier * steer;
      // Bank in radians
      this.bank = -steer*.07 * steeringSensitivity;
      // Now change speedstate
      this.speedstate += Number(k.get('up') - k.get('down'));
      if (this.speedstate < 0) this.speedstate = 0;
      let l = this.performance.length;
      if (this.speedstate >= l) {
          // Cycle speedbar if using touch
          if (k.get('touch')) {
              this.speedstate = 0;
          // Otherwise, just keep it at max
          } else {
              this.speedstate = l-1;
          }
      }
      // Depress keys
      k.reset('up');
      k.reset('down');
    } else {
      // Walk
      this.walk = k.get('up') - k.get('down');
      this.heading += dt * 8 *
            Number(k.get('left') - k.get('right'));
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
    if (this.checkTakeoff.cacheVars === undefined) {
      this.checkTakeoff.cacheVars = {
        gradient: new THREE.Vector3(),
        zaxis: new THREE.Vector3(0,0,1),
      };
    }
    let c = this.checkTakeoff.cacheVars;

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
