/*
 * Contains help functions for keyboard/mouse input
 */

import {l} from '../utils';

// Map key codes to control commands
const KEYS = {
  38: 'up', // ArrowUp
  40: 'down', // ArrowDown
  39: 'right', // ArrowRight
  37: 'left', // ArrowLeft
  // The below are only used for dev
  65: 'a',
  83: 's',
  68: 'd',
  87: 'w',
  70: 'f',
  86: 'v',
  32: "spacebar",
}

/**
 * Convenience class to keep track of key presses by saving them in state
 */
export class Controls {
  /** Initialize and add event handlers */
  constructor() {
    this.status = {};

    window.addEventListener('keydown', this.processKey.bind(this));
    window.addEventListener('keyup', this.processKey.bind(this));

    // Add touch controls if supported
    if ('ontouchstart' in window || navigator.maxTouchPoints) {
      window.addEventListener('touchstart', this.processTouch.bind(this));
      window.addEventListener('touchend', this.processTouch.bind(this));
      window.addEventListener('touchcancel', this.processTouch.bind(this));
    }
  }
  set(command) {
    this.status[command] = 1;
  }
  /** Resets key state to 0 */
  reset(command) {
    if (this.status[command]) {
      this.status[command] = 0;
    }
  }
  /** Returns 0 or 1 depending on if key is pressed */
  get(key: String) : number {
    // Return 0 for easy calcs
    return this.status[key] || 0;
  }
  processKey(evt) {
    let keymapsto = KEYS[evt.keyCode];
    if (keymapsto) {
      if (evt.type === 'keydown') this.set(keymapsto);
      if (evt.type === 'keyup') this.reset(keymapsto);
    }
  }
  /* Processes touch event */
  processTouch(evt) {
    let type = evt.type;
    // Just handle the first touch event
    let touch = evt.changedTouches[0];
    if (type === "touchstart") {
      let w = window.innerWidth;
      let x = touch.pageX;
      // TODO: Might want to set the widths corresponding to left/up/right in config
      // Left third of screen
      if (x < w/3) this.set('left');
      // Middle third
      else if (x < 2*w/3) this.set('up');
      // Right third
      else this.set('right');
    } else if (type === "touchend" || type === "touchcancel") {
      // Reset all possible commands we could have given
      this.reset('up');
      this.reset('left');
      this.reset('right');
    }
  }
}
