/*
 * TaskView class
 */

import {l} from '../utils';

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
    /**
     *  Initializes widget. Use `.init()` to initialize task state.
     *  Appends to #overlays if that id exists, otherwise appends to <body>
     */
    constructor() {
        let appendTo = document.getElementById("overlays") ||
            document.body;
        let elem = document.createElement("div");
        elem.innerHTML = TASK_MAP_TEMPLATE;
        appendTo.appendChild(elem);
        this.svg = Snap('#task-map-svg');
    }
    init(task) {
        this.cache = {};
        this.task = task;
        let bbox = this.task.getBbox();
//Figure out how to scale turnpoint display from 0 to 100
        let hscale = 167 / (bbox[2]-bbox[0]);
        let vscale = 100 / (bbox[3]-bbox[1]);
        this.scale = Math.min(hscale,vscale);
// Offset in world coordinates, middle of drawing area
        this.offset = [bbox[0] + (bbox[2]-bbox[0])/2,
            bbox[1] + (bbox[3]-bbox[1])/2];
        this.height = 100;
        this.width = 100*1.67;
        this.svg.attr({
            viewBox: "0 0 167 100",
            height: this.height*2,
            width: this.width*2,
        });
        this._draw();
    }
    /** Window resize */
    resize(w,h) {
        // TODO: recalculate size of map
    }
    /** Convert from world to svg coordinates */
    tox(x) {
        return this.width/2 - (x - this.offset[0])*this.scale;
    }
    toy(y) {
        return this.height/2 - (y - this.offset[1])*this.scale;
    }
    _draw() {
// Turnpoints and route between them
        this.svg_tps = [];
// Turnpoint circle
        for (let tp of this.task.turnpoints) {
            let x = this.tox(tp.coordinates[0]);
            let y = this.toy(tp.coordinates[2]);
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
        this.svg_activeTpIndicator.mainCircle = this.svg.rect(0,0,this.width,this.height).attr({
            visibility: "hidden",
            fill: "green",
            mask: this.svg.g(this.svg_activeTpIndicator.outerCircle,
                this.svg_activeTpIndicator.innerCircle),
        });
// Line between turnpoints
        let prevcoords = [];
        this.svg_route = [];
        for (let tp of this.task.turnpoints) {
            let x = this.tox(tp.coordinates[0]);
            let y = this.toy(tp.coordinates[2]);
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
        let svg_tps_g = this.svg.g(this.svg.rect(0,0,this.width,this.height).attr({fill: "white"}));
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
        this.courseLine = this.svg.line(0,0,0,0).attr({
            stroke: "red",
            visibility: "hidden",
        });
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
        let x = this.tox(pg.pos.x);
        let y = this.toy(pg.pos.z);
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
        if (this.task.taskActive) {
            let tp = this.task.turnpoints[this.task.activeTurnpointIndex];
            let tpx = this.tox(tp.coordinates[0]);
            let tpy = this.toy(tp.coordinates[2]);
// Adjust courseLine
            this.courseLine.attr({
                x1: this.tox(pg.pos.x), y1: this.toy(pg.pos.z),
                x2: tpx, y2: tpy,
                "visibility": "visible",
            });
// Set active tp indication
            if (this.task.activeTurnpointIndex !== c.lastTpIndex) {
                this.svg_activeTpIndicator.mainCircle.attr({visibility: "visible"});
                this.svg_activeTpIndicator.innerCircle.attr({cx: tpx, cy: tpy, r: tp.radius*this.scale});
                this.svg_activeTpIndicator.outerCircle.attr({cx: tpx, cy: tpy, r: tp.radius*this.scale+3});
// Show course line until next turnpoint cylinder
                this.courseLine.attr({
                    mask: this.svg.g(
                        this.svg.rect(0,0,this.width,this.height).attr({fill: "white"}),
                        this.svg_tps[this.task.activeTurnpointIndex].clone().attr({fill: "black"})),
                });
            }
        } else if (this.task.activeTurnpointIndex === -1 &&
            c.lastTpIndex !== this.task.activeTurnpointIndex) {
// If finished, reset active tp indication and courseLine
            this.svg_activeTpIndicator.mainCircle.attr({visibility: "hidden"});
            this.courseLine.attr({"visibility": "hidden"});
        }

        c.lastTpIndex = this.task.activeTurnpointIndex;
    }
}
