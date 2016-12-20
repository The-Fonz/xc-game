/*
 * Simple paraglider class
 */

import * as THREE from "three";

/** Represents one paraglider, user or AI-controlled */
export class Paraglider {
  /**
   * Initialize pg at position x,y,z
   */
  constructor(x: number, y: number, z: number) {
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
  increment(dt: number) {
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
      this.speed.set(0,0,0);
      // Walk if doing vol-biv sim
    }
  }
  /**
   * Process player inputs
   */
  input(dt: number, keymap: KeyMap) {
    let k = keymap.status;
    // Steering speed in rad/s
    let steeringSensitivity =
      this.performance[this.speedstate]['steeringSensitivity'];
    let steermultiplier = dt * steeringSensitivity;
    let steer = Number(k.ArrowLeft||0 - k.ArrowRight||0);
    this.heading += steermultiplier * steer;
    // Bank in radians
    this.bank = -steer*.07 * steeringSensitivity;
    // Now change speedstate
    this.speedstate += Number(k.ArrowUp||0 - k.ArrowDown||0);
    if (this.speedstate < 0) this.speedstate = 0;
    let l = this.performance.length;
    if (this.speedstate >= l) this.speedstate = l-1;
    // Depress keys
    k.ArrowUp = false;
    k.ArrowDown = false;
  }
  /**
   * Sets `this.landed` to `true` if below groundlevel
   * @param offset Height from pg centroid to its lowest point
   */
  checkLanded(terrain: Terrain, offset: number) {
    if (terrain.getHeight(this.pos) + offset > this.pos.y) {
      this.landed = true;
      // TODO: Notify other components that we've landed!
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
