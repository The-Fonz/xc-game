/*
 * Simple paraglider class
 */

import * as THREE from "three";

/** Represents one paraglider, user or AI-controlled */
export class Paraglider {
  /**
   * Initialize pg at position x,y,z
   * @param offsetY Height of centroid above ground, depends on 3D model
   */
  constructor(x: number, y: number, z: number, offsetY: number) {
    this.offsetY = offsetY;
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
    this.landed = false;
  }
  /**
   * Increment by timestep dt (seconds)
   */
  increment(dt: number, terrain) {
    // Always set rotation, regardless of if we've landed or not
    this.rotation.set(0,this.heading,0);
    if (!this.landed) {
      // Construct speed vector
      let perf = this.performance[this.speedstate];
      this.speed.set(0,perf.vvert,perf.vhor);
      this.speed.applyEuler(this.rotation);
      // Only changes position, not spd
      this.pos.addScaledVector(this.speed, dt);
    } else {
      // Walk
      if (terrain && this.walk) {
        this.speed.set(0,0,this.walk*3);
        this.speed.applyEuler(this.rotation);
        this.pos.addScaledVector(this.speed, dt);
        this.pos.y = terrain.getHeight(this.pos) + this.offsetY||0;
      }
    }
  }
  /**
   * Process player inputs
   */
  input(dt: number, keymap: KeyMap) {
    let k = keymap;

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
   * Sets `this.landed` to `true` if below groundlevel
   * @returns {Boolean} true if landed
   */
  checkLanded(terrain: Terrain) {
    if (this.landed) return true;
    if (terrain.getHeight(this.pos) + (this.offsetY||0) > this.pos.y) {
      this.landed = true;
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
    if (steepness > 200 && relDir<1) {
      this.landed = false;
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
