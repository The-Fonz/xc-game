/*
 * Terrain class
 */

export class Terrain {
  constructor(arraybuffer) {
    this.heightmap = new Uint8ClampedArray(arraybuffer);
  }
}
