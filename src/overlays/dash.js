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
  opacity: .5;
  transition: opacity .2s;
}
#dash-speedbar-svg:hover {
  opacity: .8;
}
.dash-vario {
  position: fixed;
  bottom: 0;
  right: 0;
  padding: 20px;
}
#dash-vario-svg {
  width: 100px;
  height: 300px;
  opacity: .8;
}
</style>

<div class="dash-speedbar">
  <svg id="dash-speedbar-svg"></svg>
</div>
<div class="dash-groundspeed"></div>
<div class="dash-vario">
  <svg id="dash-vario-svg"></svg>
</div>
`;

import Snap from 'snapsvg';

/** Dashboard with basic info */
export class Dash {
  /** Target is HTMLElement */
  constructor(config) {
    this.config = config;
    let appendTo = document.getElementById("overlays") ||
                   document.body;
    let elem = document.createElement("div");
    elem.innerHTML = DASH_TEMPLATE;
    appendTo.appendChild(elem);
    this.spd_svg = Snap('#dash-speedbar-svg');
    this.var_svg = Snap('#dash-vario-svg');
    this._draw();
    // Keep state to avoid updating DOM if not necessary
    this.state = {
      // Speedbar step
      step: null,
      // Vario level
      level: 0,
    };
  }
  /** Might split speedbar, vario up into separate classes at some point */
  _draw() {
    this._drawSpeedbar();
    this._drawVario();
  }
  _drawSpeedbar() {
    this.arrow1 = this.spd_svg.polygon(0,100,75,40,150,100).attr({
      "stroke-width": 3,
    });
    this.arrow2 = this.spd_svg.polygon(0,60,75,0,150,60).attr({});
  }
  _drawVario() {
    // Store levels indicators in this variable
    this.svg_levels = [];
    // Middle in pixels
    const middle = 150;
    const lineHeight = 30;
    // Zero line
    this.var_svg.line(60,10+middle, 100,10+middle).attr({
      "stroke": "#dedede",
      "stroke-width": 4,
    });
    let nLevels = this.config.varioLevels*2+1;
    let offset = middle - this.config.varioLevels * lineHeight;
    for (var i=0; i<nLevels; i++) {
      let p = this.var_svg.polygon(0,offset, 40,offset,
        50,10+offset, 40,20+offset, 0,20+offset).attr({
        "stroke": "#ccc",
        "fill": "#fff",
      });
      offset += lineHeight;
      this.svg_levels.push(p);
    }
  }
  /** Update dash elements with pg state */
  _update(pg) {
    this._updateSpeedbar(pg);
    this._updateVario(pg);
  }
  _updateSpeedbar(pg) {
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
  _updateVario(pg) {
    // Can be negative, positive or 0
    let level = Math.round(pg.speed.y);
    let offset = (this.svg_levels.length-1)/2;
    if (level !== this.state.level) {
      // Loop over all, hide or show
      for (let i=0; i<this.svg_levels.length; i++) {
        let vis = "hidden";
        // Classic vario indicator, always show zero level,
        // fill in positive or negative scale corresponding to climbrate
        if (i===offset ||
            level<0 && i>offset && (i-offset)<=-level ||
            level>0 && i<offset && (offset-i)<level) {
          vis = "visible";
        }
        this.svg_levels[i].attr({
          "visibility": vis,
        });
      }
      this.state.level = level;
    }
  }
}
