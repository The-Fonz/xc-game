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
}
