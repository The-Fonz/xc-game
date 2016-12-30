/*
 * Dashboard/cockpit for info during flight
 */

/**
 * Template is only used to render the widget once, updates are done by
 * selecting the element and updating its innerHTML. This is fast and avoids
 * using a vdom or templating language.
 */
const DASH_TEMPLATE = `
<style type="text/css">
.dash-speedbar {
  position: fixed;
  bottom: 0;
  left: 0;
  padding: 20px;
}
#dash-speedbar-svg {
  width: 150px;
  height: 100px;
}
#dash-speedbar-svg {
  opacity: .5;
  transition: opacity .2s;
}
#dash-speedbar-svg:hover {
  opacity: .8;
}
</style>

<div class="dash-speedbar">
  <svg id="dash-speedbar-svg"></svg>
</div>
<div class="dash-groundspeed"></div>
<div class="dash-vario"></div>
`;

import Snap from 'snapsvg';

/** Dashboard with basic info */
export class Dash {
  /** Target is HTMLElement */
  constructor(config) {
    this.config = config;
    this.target = document.getElementById(this.config.targetid);
    this.target.innerHTML = DASH_TEMPLATE;
    this.svg = Snap('#dash-speedbar-svg');
    this._draw();
    // Keep state to avoid updating DOM if not necessary
    this.state = {step: null};
    // Allow increasing speedbar step by clicking widget
    this.target.querySelector('.dash-speedbar').addEventListener('mousedown',
      (ev)=>{
        // TODO: Set forward arrow in keymap, or find some cleaner way
        // to be able to click icon and increase speedbar setting
      });
  }
  _draw() {
    this.arrow1 = this.svg.polygon(0,100,75,40,150,100).attr({
      "stroke-width": 3,
    });
    this.arrow2 = this.svg.polygon(0,60,75,0,150,60).attr({});
  }
  /** Update dash elements with pg state */
  _update(pg) {
    let step = pg.getSpeedbarStep();
    // Only touch DOM if we need to!
    if (step !== this.state.step) {
      // Hide all
      this.arrow1.attr({fill: "none", stroke: "none"});
      this.arrow2.attr({fill: "none"});
      if (step === 0) {
        this.arrow1.attr({stroke: "#fff"});
      } else if (step === 1) {
        this.arrow1.attr({fill: "#fff"});
      } else if (step === 2) {
        this.arrow1.attr({fill: "#fff"});
        this.arrow2.attr({fill: "#fff"});
      }
    }
    this.state.step = step;
  }
}
