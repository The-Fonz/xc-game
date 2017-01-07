/*
 * Task class
 */

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
  }
  /** Update task state */
  update(pos: THREE.Vector3) {
    // TODO: Check if in range of next turnpoint, if so, advance state
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
