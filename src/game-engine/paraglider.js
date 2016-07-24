/*
 * Simple paraglider class
 */

import * as THREE from "three";

export class Paraglider {
  constructor(x, y, z) {
    this.pos = new THREE.Vector3(x,y,z);
    this.spd = new THREE.Vector3(0,0,0);
  }
  increment(dt) {
    // Only changes position, not spd
    this.pos.addScaledVector(this.spd, dt);
  }
}
