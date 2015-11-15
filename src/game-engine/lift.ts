/*
 * All thermal and dynamic upwind logic
 */

import Terrain = require("./terrain");
import vect = require("../utils/vect");

class Thermal {
  pos: vect.vec3D;
}

class Lift {
  terrain: Terrain;
  terraingradient: Uint8Array;
  liftmap: Uint8Array;

  constructor (terrain: Terrain) {
    this.terrain = terrain;
  }

  getLift(x:number, y:number):number {
    return this.liftmap[y*this.terrain.width + x];
  }
}

export = Lift;
