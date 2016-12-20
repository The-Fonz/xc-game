/*
 * Terrain class
 */

export class Terrain {
  constructor(heightmap, hscale, vscale, heightmapvscale) {
    // Load unencoded heightmap
    this.heightmap = heightmap;
    this.hscale = hscale;
    this.vscale = vscale;
    this.heightmapvscale = heightmapvscale;
  }

  /**
   * Get height at x,z coordinates of THREE.Vector3
   * (3D vector for easy interaction with other classes)
   * @param {THREE.Vector3} vect Some vector
   * @returns {number} Height of ground, or NaN if out of map area
   */
  getHeight(vect) {
    // TODO: don't use nearest but linearly interpolate
    let i = Math.round(vect.x / this.hscale);
    let j = Math.round(vect.z / this.hscale);
    try {
      return this.heightmap[j][i] * this.heightmapvscale * this.vscale;
    } catch (e) {
      // Out of map area
      return NaN;
    }
  }

  getGradient(vect) {
    // Return gradient at planar projection of vector
  }
}
