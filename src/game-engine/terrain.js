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

  groundlevel(vect) {
    // Return height at planar projection of vector
    // TODO: don't use nearest but linearly interpolate
    let i = Math.round(vect.x / this.hscale);
    let j = Math.round(vect.z / this.hscale);
    try {
      return this.heightmap[j][i] * this.heightmapvscale * this.vscale;
    } catch (e) {
      // Out of map area
      return NaN
    }
  }

  gradient(vect) {
    // Return gradient at planar projection of vector
  }
}
