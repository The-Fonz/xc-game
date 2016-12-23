/*
 * Dashboard/cockpit for info during flight
 */

/**
 * List of classes of the different svg elements that have to be shown/hidden
 * when walking or on speedbar. These classes have been applied to the SVG by
 * hand.
 */
const SPEED_STEP_CLASSES = [
  'step-walk', 'step-0', 'step-1', 'step-2'
];

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
.dash-wrapper {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}
.xc-speedbar-chevron {
  padding: 20px;
  width: 150px;
  height: 100px;
  /* -webkit-filter: drop-shadow(5px 2px 2px black);
   filter: drop-shadow(5px 2px 2px black);*/
}
/* Style specific SVG elements by using class names defined in svg */
.xc-speedbar-chevron {
  opacity: .5;
  transition: opacity .2s;
}
.xc-speedbar-chevron:hover {
  opacity: .8;
}
.xc-speedbar-chevron .${SPEED_STEP_CLASSES[0]} {
  stroke: none;
  fill: #EEE;
}
.xc-speedbar-chevron .${SPEED_STEP_CLASSES[1]} {
  stroke: #EEE;
  fill: none;
}
.xc-speedbar-chevron .${SPEED_STEP_CLASSES[2]} {
  stroke: none;
  fill: #EEE;
}
.xc-speedbar-chevron .${SPEED_STEP_CLASSES[3]} {
  stroke: none;
  fill: #EEE;
}
/* I tried direct selection using the DOM but did not work, so interacting
   by adding/removing classes instead */
.xc-speedbar-chevron.hide-${SPEED_STEP_CLASSES[0]} .${SPEED_STEP_CLASSES[0]} {
  visibility: hidden;
}
.xc-speedbar-chevron.hide-${SPEED_STEP_CLASSES[1]} .${SPEED_STEP_CLASSES[1]} {
  visibility: hidden;
}
.xc-speedbar-chevron.hide-${SPEED_STEP_CLASSES[2]} .${SPEED_STEP_CLASSES[2]} {
  visibility: hidden;
}
.xc-speedbar-chevron.hide-${SPEED_STEP_CLASSES[3]} .${SPEED_STEP_CLASSES[3]} {
  visibility: hidden;
}
</style>

<div class="dash-speedbar">
  <svg role="img" class="xc-speedbar-chevron"><use xlink:href="/static/icons.svg#xc-speedbar-chevron"/></svg>
</div>
<div class="dash-groundspeed"></div>
<div class="dash-vario"></div>
`;

/** Dashboard with basic info */
export class Dash {
  /** Target is HTMLElement */
  constructor(config) {
    this.config = config;
    this.target = document.getElementById(this.config.targetid);
    this.target.innerHTML = DASH_TEMPLATE;
    this.svg = this.target.querySelector('.xc-speedbar-chevron');
    // Keep state to avoid updating DOM if not necessary
    this.state = {step: null};
    // Allow increasing speedbar step by clicking widget
    this.target.querySelector('.dash-speedbar').addEventListener('mousedown',
      (ev)=>{
        // TODO: Set forward arrow in keymap, or find some cleaner way
        // to be able to click icon and increase speedbar setting
      });
  }
  /** Update dash elements with pg state */
  _update(pg) {
    let step = pg.getSpeedbarStep();
    // Only touch DOM if we need to!
    if (step !== this.state.step) {
      for (let i=0; i < SPEED_STEP_CLASSES.length; i++) {
        let cl = `hide-${SPEED_STEP_CLASSES[i]}`;
        // Normalize, step returns -1 for walking
        if (i !== step+1) {
          this.svg.classList.add(cl);
        } else {
          this.svg.classList.remove(cl);
        }
      }
    }
    this.state.step = step;
  }
}
