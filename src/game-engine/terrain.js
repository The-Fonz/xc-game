/*
 * Terrain class
 */

import * as THREE from "three";

/** Represents terrain grid, enables fast computation for use in game engine */
export class Terrain {
  /**
   * Instantiates Terrain
   * @param {Array} heightmap Unencoded heightmap, 2D array of numbers
   * @param {number} hscale Horizontal spacing between heightmap points
   * @param {number} vscale Vertical scale of terrain mesh
   * @param {number} heightmapvscale Heightmap multiplier, excludes vscale
   */
  constructor(heightmap, hscale, vscale, heightmapvscale) {
    // Load unencoded heightmap
    this.heightmap = heightmap;
    this.hscale = hscale;
    this.vscale = vscale;
    this.heightmapvscale = heightmapvscale;
  }

  /**
   * Get linearly interpolated height at x,z coordinates of THREE.Vector3
   * @param {THREE.Vector3} vect Some vector in 3D world coordinates, for easy
   *                             interaction with other classes
   * @returns {number} Height of ground, or NaN if out of map area
   */
  getHeight(vect) {
    let h = this.heightmap;
    let [i1, i2, j1, j2] = this._gridcoords(vect);
    // Relative coords within rectangle
    let x = (vect.x % this.hscale) / this.hscale;
    let z = (vect.z % this.hscale) / this.hscale;
    try {
      return this._interpolate4(
        [h[j1][i1], h[j1][i2], h[j2][i1], h[j2][i2]],
        x, z) * this.heightmapvscale * this.vscale;
    } catch (e) {
      // Out of map area
      console.error("getHeight: out of map area");
      return NaN;
    }
  }

  /**
   * Calculate surface gradient, point towards middle of map if outside of it
   * @param pos Position in 3D world coordinates
   * @param out 3D vector to store result in (y is 0)
   */
  getGradient(out: THREE.Vector3, pos: THREE.Vector3) {
    let [i1, i2, j1, j2] = this._gridcoords(pos);
    let x = (pos.x % this.hscale) / this.hscale;
    let z = (pos.z % this.hscale) / this.hscale;
    let l = {};
    try {
      [l.x1, l.z1] = this._gradient(i1,j1);
      [l.x2, l.z2] = this._gradient(i2,j1);
      [l.x3, l.z3] = this._gradient(i1,j2);
      [l.x4, l.z4] = this._gradient(i2,j2);
    } catch (e) {
      // Out of map area
      console.error("Out of map area I think");
      // TODO: Point `out` to middle of map
    }
    let ox = this._interpolate4([l.x1, l.x2, l.x3, l.x4], x, z);
    let oz = this._interpolate4([l.z1, l.z2, l.z3, l.z4], x, z);
    // Correct for kernel and scaling
    let correct = (val) => {
      return val * this.heightmapvscale * this.vscale / (32 * this.hscale);
    }
    out.set(correct(ox), 0, correct(oz));
  }
  /**
   * Internal method for calculating discrete gradient at i,j
   * using Scharr kernel
   */
  _gradient(i,j) {
    let h = this.heightmap;
    let z = (h[j+1][i-1] * 3 +
             h[j+1][i  ] * 10 +
             h[j+1][i+1] * 3 +
             h[j-1][i-1] * -3 +
             h[j-1][i  ] * -10 +
             h[j-1][i+1] * -3);
    let x = (h[j+1][i+1] * 3 +
             h[j  ][i+1] * 10 +
             h[j-1][i+1] * 3 +
             h[j+1][i-1] * -3 +
             h[j  ][i-1] * -10 +
             h[j-1][i-1] * -3);
    return [x,z];
  }

  /** Internal method for calculating surrounding grid coords
   * @returns {Array} [floor(i), ceil(i), floor(j), ceil(j)]
   */
  _gridcoords(vect: THREE.Vector3) {
    return [Math.floor(vect.x / this.hscale),
            Math.ceil (vect.x / this.hscale),
            Math.floor(vect.z / this.hscale),
            Math.ceil (vect.z / this.hscale)];
  }
  /** Internal method for linear interpolation between 4 grid points
   * @param a Ordered as such: [z1,x1] [z1,x2] [z2,x1] [z2,x2]
   * @param x X-coord within range 0,1
   * @param z Z-coord within range 0,1
   * @returns {number} Interpolant
   */
  _interpolate4(a: Array, x: number, z: number) {
    return a[0] * ((1-z) * (1-x)) +
           a[1] * ((1-z) *    x ) +
           a[2] * (   z  * (1-x)) +
           a[3] * (   z  *    x );
  }
}
