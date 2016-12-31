/*
 * Thermal class
 */

import * as THREE from 'three';

/** Represents one thermal */
export class Thermal {
  /** This class is meant for re-use in a pool of objects, use `init()` */
  constructor() {
    this.active = false;
    // Internal cache
    this.cacheVars = {};
    // External information
    this.meta = {};
  }
  /**
   * Sets position, radius and strength of thermal.
   * @param x World space x-axis coordinate
   * @param z World space z-axis coordinate
   * @param g World space y-axis coordinate of ground height
   *          at position of thermal (for use in AI)
   * @param r Radius of thermal
   * @param b Buttkick coefficient (strength)
   * @param c Local cloudbase (for this thermal)
   */
  init(config: Object, x: number, z: number, g: number,
              r: number, b: number, c: number) {
    this.config = config;
    this.pos = new THREE.Vector3(x, g, z);
    this.radius = r;
    this.strength = b;
    this.cloudbase = c;

    // Renderer must be able to track cloud size
    this.cloudWidth = 0;
    this.cloudHeight = 0;

    // Gets set to false when at end of lifecycle, so it can be re-used
    this.active = true;

    // Calculate total life cycle length based on config
    this.maxAliveTime = config.lifeCycle[0] +
          Math.random() * (config.lifeCycle[1] - config.lifeCycle[0]);

    this.timeAlive = 0;

    // Initialize this.boundingBox
    this.calcBoundingBox();
  }
  /**
   * Thermals are alive.
   * @param dt Timestep
   * @returns {Boolean} False if not active, true if still active
   */
  increment(dt: number) {
    this.timeAlive += dt;
    if (this.timeAlive > this.maxAliveTime) {
      this.active = false;
      this.cloudWidth = 0;
      this.cloudHeight = 0;
      return false;
    }
    // TODO: Move with wind etc.
    // TODO: Adjust cloud size based on lifecycle
    this.cloudWidth = this.config.maxCloudWidth;
    this.cloudHeight = this.config.maxCloudHeight;
    return true;
  }
  /**
   * Recalculates bounding box, for use in checking if a pg is in range.
   * this.boundingBox is compatible with `box-intersect`, maybe use that at
   * some point when it gets better than bruteforce (at about 500 according to
   * "The Great Javascript Box Intersection Benchmark").
   * Or when instantiating a few hundred AI pg's, then the batched box stabbing
   * queries will really help.
   * @returns `this.boundingBox` if changed, `false` if not changed
   */
  calcBoundingBox() {
    if (this.cacheVars.prevbbox === undefined) {
      this.cacheVars.prevbbox = [0,0,0,0];
      // [minX, minZ, maxX, maxZ]
      this.boundingBox = [0,0,0,0];
    }
    let c = this.cacheVars;
    // Remember current bbox to check if it changed later on
    for (let i=0; i<4; i++) {
      c.prevbbox[i] = this.boundingBox[i];
    }

    // minX
    this.boundingBox[0] = this.pos.x - this.radius;
    // minZ
    this.boundingBox[1] = this.pos.z - this.radius;
    // minX
    this.boundingBox[2] = this.pos.x + this.radius;
    // minZ
    this.boundingBox[3] = this.pos.z + this.radius;

    for (let i=0; i<4; i++) {
      if (c.prevbbox[i] !== this.boundingBox[i]) return this.boundingBox;
    }
    return false;
  }
  /**
   * Get upwards velocity contributed by this thermal
   * @param pos Position in world space
   * @returns {number} Upwards velocity, can be 0
   */
  getUpdraft(pos: THREE.Vector3) {
    if (! this.active) return 0;
    if (pos.y > (this.cloudbase - this.config.cloudbaseClimbOffset)) return 0;
    if (this.cacheVars.getVelocity === undefined) {
      this.cacheVars.getVelocity = {
        // Vectors used for distance comparison in ground plane
        thermalPos: new THREE.Vector3(),
        pgPos: new THREE.Vector3(),
      };
    }
    let c = this.cacheVars.getVelocity;
    c.thermalPos.copy(this.pos);
    c.pgPos.copy(pos);
    // Project to ground plane
    c.thermalPos.y = 0;
    c.pgPos.y = 0;
    // Check if within thermal radius and below cloudbase
    // Avoid calculating sqrt by using distance squared, slightly more efficient
    if (c.thermalPos.distanceToSquared(c.pgPos) <= Math.pow(this.radius, 2) &&
        pos.y <= this.cloudbase) {
      return this.strength;
    }
    return 0;
  }
}
