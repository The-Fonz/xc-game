/*
 * TaskView class
 */

import {l} from '../utils/logging';

const TASK_MAP_TEMPLATE = `
<style type="text/css">
.task-map {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  padding: 20px;
}
#task-map-svg {
  width: 300px;
  height: 200px;
  opacity: .7;
  background: rgba(255,255,255,.5);
}
</style>

<div class="task-map">
  <svg id="task-map-svg"></svg>
</div>
`;

import Snap from 'snapsvg';

/** Handles task flying logic */
export class TaskMap {
  /** Initializes widget. Use `.init()` to initialize task state */
  constructor() {
    this.target = document.createElement("div");
    this.target.innerHTML = TASK_MAP_TEMPLATE;
    document.body.appendChild(this.target);
    this.svg = Snap('#task-map-svg');
  }
  init(task) {
    this.cache = {};
    this.task = task;
    let bbox = this.task.getBbox();
    //Figure out how to scale turnpoint display from 0 to 100
    this.scale = 100 /
                 (Math.max(...bbox.slice(2,4)) -
                  Math.min(...bbox.slice(0,2)));
    this.offset = bbox.slice(0,2);
    this.offset[0] *= this.scale;
    this.offset[1] *= this.scale;
    this.svg.attr({
      viewBox: "-10 -10 120 120",
      width: 300,
      height: 300,
    });
    this._draw();
  }
  _draw() {
    // Turnpoints and route between them
    this.svg_tps = [];
    // Turnpoint circle
    for (let tp of this.task.turnpoints) {
      let x = 100 - (tp.coordinates[0] - this.offset[0])*this.scale;
      let y = 100 - (tp.coordinates[2] - this.offset[1])*this.scale;
      let tpcircle = this.svg.circle(x, y, tp.radius*this.scale).attr({
                        fill: "#fff",
                        stroke: "#000",
                      });
      this.svg_tps.push(tpcircle);
    }
    // Active tp indicator, keep track of shapes in this object to avoid dom
    this.svg_activeTpIndicator = {
      // Inverse mask
      'innerCircle': this.svg.circle(50,50,5).attr({fill: "black"}),
      'outerCircle': this.svg.circle(50,50,10).attr({fill: "white"}),
    }
    this.svg_activeTpIndicator.mainCircle = this.svg.rect(-10,-10,110,110).attr({
        visibility: "hidden",
        fill: "green",
        mask: this.svg.g(this.svg_activeTpIndicator.outerCircle,
                         this.svg_activeTpIndicator.innerCircle),
    });
    // Line between turnpoints
    let prevcoords = [];
    this.svg_route = [];
    for (let tp of this.task.turnpoints) {
      let x = 100 - (tp.coordinates[0] - this.offset[0])*this.scale;
      let y = 100 - (tp.coordinates[2] - this.offset[1])*this.scale;
      if (prevcoords[0]) {
        let routeline = this.svg.line(prevcoords[0], prevcoords[1],
                      x, y).attr({
                        "stroke": "blue",
                      });
        this.svg_route.push(routeline);
      }
      prevcoords = [x,y];
    }
    // Now mask lines with turnpoints
    // First add white square as background
    let svg_tps_g = this.svg.g(this.svg.rect(0,0,100,100).attr({fill: "white"}));
    // Now add a copy of all circles on top of it
    svg_tps_g.add(this.svg.g(...this.svg_tps).clone());
    // Set circles to black so they mask
    svg_tps_g.selectAll("circle").attr({fill: "black", stroke: "none"});
    // Make group of route lines and add mask
    let svg_route_g = this.svg.g(...this.svg_route);
    svg_route_g.attr({mask: svg_tps_g});

    // Init round robin-style trace line
    if (this.task.config.traceLength) {
      this.trace = [];
      // Round robin position
      this.traceIndex = 0;
      for (let i=0; i<this.task.config.traceLength; i++) {
        this.trace.push(
          this.svg.line(0,0,0,0).attr({
            "visibility": "hidden",
            "stroke": "#222",
          }));
      }
    }
    // Line from player to active turnpoint
    this.courseLine = this.svg.line(0,0,0,0).attr({stroke: "red"});
    // this.svg_tps[0];
    // Init player arrow
    this.arrow = this.svg.polygon(0,0, 5,-4, 0,8, -5,-4).attr({
      fill: "#fff",
      stroke: "#000",
      "fill-opacity": .7,
    });
  }
  update(pg) {
    if (this.cache.update === undefined) {
      this.cache.update = {};
    }
    let c = this.cache.update;
    let x = 100 - pg.pos.x*this.scale+this.offset[0];
    let y = 100 - pg.pos.z*this.scale+this.offset[1];
    this.arrow.attr({
      // Set rotation center to 0,0 as it doesn't use it by default (centroid?)
      transform: `t${x},${y} r${180+Snap.deg(-pg.heading)} 0 0`,
    });
    // Only draw trace if trace length and last position known
    if (this.trace && c.lastpos) {
      this.trace[this.traceIndex].attr({
        "visibility": "visible",
        x1: c.lastpos[0],
        y1: c.lastpos[1],
        x2: x,
        y2: y,
      });
      this.traceIndex++;
      if (this.traceIndex >= this.trace.length) this.traceIndex = 0;
    }
    c.lastpos = [x,y];
    // Set active tp indication
    if (this.task.taskActive &&
        this.task.activeTurnpointIndex !== c.lastTpIndex) {
      let tp = this.task.turnpoints[this.task.activeTurnpointIndex];
      let x = 100 - (tp.coordinates[0] - this.offset[0])*this.scale;
      let y = 100 - (tp.coordinates[2] - this.offset[1])*this.scale;
      this.svg_activeTpIndicator.mainCircle.attr({visibility: "visible"});
      this.svg_activeTpIndicator.innerCircle.attr({cx: x, cy: y, r: tp.radius*this.scale});
      this.svg_activeTpIndicator.outerCircle.attr({cx: x, cy: y, r: tp.radius*this.scale+3});
    }
    c.lastTpIndex = this.task.activeTurnpointIndex;
  }
}
