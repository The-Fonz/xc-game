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
    this.offset = this.task.config.bbox.slice(0,2);
    //Figure out how to scale turnpoint display from 0 to 100
    this.scale = 100 /
                 (Math.max(...this.task.config.bbox.slice(2,4)) -
                  Math.min(...this.task.config.bbox.slice(0,2)));
    this.svg.attr({
      viewBox: "-10 -10 120 120",
      width: 300,
      height: 300,
    });
    this._draw();
  }
  _draw() {
    this.svg_tps = [];
    for (let tp of this.task.turnpoints) {
      let svg_tp =
      this.svg.circle(100 - (tp.coordinates[0] - this.offset[0])*this.scale,
                      100 - (tp.coordinates[2] - this.offset[1])*this.scale,
                      tp.radius*this.scale).attr({
                        fill: "#fff",
                        stroke: "#000",
                      });
      this.svg_tps.push(svg_tp);
    }
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
  }
}
