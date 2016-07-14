/*
 * Contains help functions for keyboard/mouse input
 */

// Maps to keyCode
const KEYS = {
  38: 'ArrowUp',
  40: 'ArrowDown',
  39: 'ArrowRight',
  37: 'ArrowLeft',
  65: 'a',
  83: 's',
  68: 'd',
  87: 'w',
  // Spacebar
  " ": 32,
}

export class KeyMap {
  constructor() {
    this.status = {};

    let processkey = (keycode, setto) => {
      let keymapsto = KEYS[keycode];
      if (keymapsto) {
        this.status[keymapsto] = setto;
      }
    }
    
    window.addEventListener('keydown', (ev)=>{processkey(ev.keyCode, true)});
    window.addEventListener('keyup', (ev)=>{processkey(ev.keyCode, false)});
  }
}
