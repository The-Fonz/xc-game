/*
 * Task class
 */

import * as THREE from 'three';
import {l} from '../utils/logging';

/** Handles task flying logic */
export class Task {
  /** Use `.init()` to initialize */
  constructor() {}
  /** Set up task */
  init(config) {
    this.cache = {};
    this.config = config;
    this.turnpoints = this.config.turnpoints;
    // TODO: only set when start gate time has passed
    this.taskActive = true;
    this.activeTurnpointIndex = 0;
    this.finished = false;
    this.startTime = Date.now();
  }
  /** Update task state */
  update(pos: THREE.Vector3) {
    if (this.cache.update === undefined) {
      this.cache.update = {
        tp_pos: new THREE.Vector3(),
      };
    }
    let c = this.cache.update;
    if (this.activeTurnpointIndex !== -1) {
      // Set to height of pg pos to compare only planar distance
      let activeTp = this.turnpoints[this.activeTurnpointIndex];
      c.tp_pos.set(activeTp.coordinates[0], pos.y, activeTp.coordinates[2]);
      // Check if in range of currently active turnpoint, if so, advance state
      if (c.tp_pos.distanceToSquared(pos) <= Math.pow(activeTp.radius,2)) {
        this.activeTurnpointIndex += 1;
      }
    }
    // If state beyond turnpoints, finish!
    if (this.activeTurnpointIndex >= this.turnpoints.length) {
      console.info("Finished task!");
      window.alert(`Congratulations, you finished the task in ${((Date.now() - this.startTime)/1000).toFixed(0)} seconds!`);
      this.activeTurnpointIndex = -1;
      this.taskActive = false;
    }
  }
  /** Get task's bounding box, for display purposes */
  getBbox() {
    let bbox = [];
    for (let tp of this.turnpoints) {
      let p = tp.coordinates;
      // min x
      if (bbox[0] === undefined || p[0] < bbox[0]) bbox[0] = p[0];
      // min z
      if (bbox[1] === undefined || p[2] < bbox[1]) bbox[1] = p[2];
      // max x
      if (bbox[2] === undefined || p[0] > bbox[2]) bbox[2] = p[0];
      // max z
      if (bbox[3] === undefined || p[2] > bbox[3]) bbox[3] = p[2];
      tp.coordinates[2];
    }
    if (this.config.bboxPadding) {
      bbox[0] -= this.config.bboxPadding;
      bbox[1] -= this.config.bboxPadding;
      bbox[2] += this.config.bboxPadding;
      bbox[3] += this.config.bboxPadding;
    }
    return bbox;
  }
}
