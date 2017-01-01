/*
 * Air class
 */

import * as THREE from 'three';
import {Thermal} from "./thermal";
import {uniform} from "../utils/misc";

// TODO: move to utils

/**
 * Manages all air movements. Adds `.meta.air` to `Paraglider` object.
 */
export class Air {
  /**
   * Initialize class, needs to know about terrain
   */
  constructor(terrain: Terrain, config: Object) {
    this.cache = {};
    this.terrain = terrain;
    this.config = config;
    // Instantiate pool of thermals
    this.thermals = [];
    for (let i=0; i < config.nthermals; i++) {
      this.thermals.push(new Thermal());
    }
    // Initialize all thermals, make sure to provide dt
    this.incrementAir();
  }
  /**
   * Update all air movements by timestep dt.
   * @param dt timestep
   * @param m Fraction of thermals to increment. Should be no more than
   *          inverse of minimum expected framerate multiplied by
   *          times per second that you want to increment each thermal.
   */
  incrementAir(dt: number, m: number) {
    if (dt === undefined) dt = 0;
    if (m === undefined) m = 1;
    // TODO: Increment and initialize new thermals or refresh inactive ones.
    // Check (*m* * total number of thermals) every frame.
    // This lowers workload but still ensures
    // that every thermal is incremented within a short time.
    let l = this.thermals.length;
    for (let i=0; i < l; i++) {
      let t = this.thermals[i];
      // Let thermal update its position etc.
      // Refresh if thermal at end of lifecycle
      if (!t.active) {
        let pos = this._newThermalPosition(this.config.nthermalsamples);
        let g = this.terrain.getHeight(pos[0], pos[1]);
        // TODO: Move this into thermal itself
        let r = uniform(this.config.Thermal.radius);
        let b = uniform(this.config.Thermal.strength);
        let c = uniform(this.config.Thermal.cloudbase);
        this.thermals[i].init(this.config.Thermal,
          pos[0], pos[1], g,r,b,c);
      }
      // TODO: Add wind influence
      t.increment(dt);
    }
  }
  /**
   * Update pg intersections with new thermals
   * NOTE: Checks subset of all pg's on every iteration
   *       if this proves to be too much, the buffer used (a few times the
   *       max. speed should be enough) should make sure that no intersections
   *       are missed. Iterations also don't have to be done every frame.
   */
  incrementThermalIntersections(pgList, offsetMin, offsetMax) {
    if (offsetMin === undefined) offsetMin = 0;
    if (offsetMax === undefined) offsetMax = pgList.length;
    for (let i=offsetMin; i<offsetMax; i++) {
      let pg = pgList[i];
      // TODO: move this instantiation somewhere else
      if (pg.meta.air === undefined) {
        pg.meta.air = {};
      }
      // Instantiate list to keep track of intersecting thermals on pg object
      if (pg.meta.air.intersectingThermalList === undefined) {
        // NOTE: For testing we use whole list
        pg.meta.air.intersectingThermalList = [];
        pg.meta.air.intersectingThermalList = this.thermals;
      }
      // TODO: Check if current thermals still intersect
    }
    // TODO: Check if new thermals intersect
  }
  /**
   * Generates new thermal position, based on gradient.
   * Its runtime must be predictable (near constant) so what it does is select
   * *n* random positions and pick the best one, based on dot product of
   * surface normal and sun position.
   * @param n Number of random positions to sample
   * @returns {Array} [x,y] position
   */
  _newThermalPosition(n: number) {
    if (this.cache._newThermalPosition === undefined) {
      this.cache._newThermalPosition = {
        pos: new THREE.Vector3(),
        grad: new THREE.Vector3(),
      };
    }
    let c = this.cache._newThermalPosition;

    let position = [0,0];
    let maxPosition = [0,0];
    let sunstrength = 0;
    let maxSunstrength = 0;
    // Generate *n* candidate positions
    for (let i=0; i<n; i++) {
      // [minX, minZ, maxX, maxZ]
      position[0] = this.terrain.extent[0] +
        Math.random() * (this.terrain.extent[2] - this.terrain.extent[0]);
      position[1] = this.terrain.extent[1] +
        Math.random() * (this.terrain.extent[3] - this.terrain.extent[1]);

      // TODO: make dot product of terrain normal and sun normal
      c.pos.set(position[0], 0, position[1]);
      this.terrain.getGradient(c.grad, c.pos);
      let sunstrength = c.grad.z > 0 ? 1-Math.exp(-c.grad.z): 0;

      if (sunstrength > maxSunstrength) {
        maxSunstrength = sunstrength;
        // Set directly, we don't want maxPosition to reference position by
        // doing maxPosition = position
        maxPosition[0] = position[0];
        maxPosition[1] = position[1];
      }
    }
    return maxPosition;
  }
}
