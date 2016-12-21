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
.dash-wrapper {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  padding: 20px;
}
.dash-speed {
}
</style>

<div class="dash-speedbar">
  <svg role="img"><use xlink:href="/static/icons.svg#xc-speedbar-chevron"/></svg>
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
    // Replace entire target div so we have full control over class naming
    this.target.outerHTML = DASH_TEMPLATE;
    // Select and remember elements
  }
  _update() {
    // Update elements
  }
}
