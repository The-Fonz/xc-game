/*
 * Contains help functions for keyboard/mouse input
 */

export class Input {
  constructor(elem = window) {
    this.pressedKeys = {};

    // Define callback methods in constructor with arrow to bind them.
    // This syntax might be usable in method definition with ES7
    this.onKeyDown = (event) => {
      event.preventDefault();
      this.pressedKeys[event.keyIdentifier] = true;
    }
    this.onKeyUp = (event) => {
      delete this.pressedKeys[event.keyIdentifier];
    }
    this.onBlur = (event) => {
      this.pressedKeys = {};
    }

    elem.addEventListener('keydown', this.onKeyDown);
    elem.addEventListener('keyup', this.onKeyUp);
    elem.addEventListener('blur', this.onBlur);
  }
}
