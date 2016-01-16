/*
 *
 */

import {Engine} from "../game-engine/engine";

// Remove later, only for testing
import vec3 from "gl-matrix-vec3";

// Base class for 2D canvas views
export class MapView {

  constructor(engine, canvas) {

    this.engine = engine;

    this.canvasHeight = canvas.height;
    this.canvasWidth = canvas.width;

    this.ctx = canvas.getContext('2d');
  }
}

export class HeightmapView extends MapView {

  constructor(e, c, stats = null) {

    super(e, c);

    this.stats = stats;

    this.imageData = this.ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);

    var i = 0;
    var j = 0;

    for (var y = 0; y < this.canvasHeight; y++) {
      for (var x = 0; x < this.canvasWidth; x++) {
        var height = this.engine.terrain.heightmap[i++];
        this.imageData.data[j++] = height; // R
        this.imageData.data[j++] = height; // G
        this.imageData.data[j++] = height; // B
        this.imageData.data[j++] = 255; // A
      }
    }
  }

  update() {
    this.drawHeightmap();
    this.drawParagliders();
  }

  drawParagliders() {

    var l = this.engine.paragliders.length;

    for (var i = 0; i < l; i++) {

      var pg = this.engine.paragliders[i];

      this.ctx.beginPath();

      // Draw circle where pg is
      this.ctx.arc(pg.pos[0], pg.pos[1], 3, 0, 2 * Math.PI, false);
      this.ctx.fillStyle = 'red';
      this.ctx.fill();

      // Draw line with velocity
      this.ctx.beginPath();
      this.ctx.moveTo(pg.pos[0], pg.pos[1]);
      this.ctx.lineTo(pg.pos[0] + pg.spd[0], pg.pos[1] + pg.spd[1]);
      this.ctx.strokeStyle = 'red';
      this.ctx.stroke();

      // Get gradient and draw it
      var g = vec3.create();
      var pos = this.engine.paragliders[i].pos;
      this.engine.terrain.getGradient(g, pos);

      this.ctx.beginPath();
      this.ctx.moveTo(pg.pos[0] + pg.spd[0], pg.pos[1] + pg.spd[1]);
      this.ctx.lineTo(pg.pos[0] + pg.spd[0] + g[0], pg.pos[1] + pg.spd[1] + g[1]);
      this.ctx.strokeStyle = 'blue';
      this.ctx.stroke();

      // Calculate left or right turn
      var lr = vec3.create();
      vec3.cross(lr, g, pg.spd);
      lr = lr[2] < 0 ? "right" : "left";

      // Get terrain height
      var h = vec3.create();
      this.engine.terrain.getHeight(h, pg.pos);

      // By convention, first pg is player
      if (i === 0) this.stats.innerHTML = `xyz: ${Math.round(pg.pos[0])}
                                                ${Math.round(pg.pos[1])}
                                                ${Math.round(pg.pos[2])}
                                        height: ${h[2]}
                                      gradient: ${g[0]} ${g[1]}
                                   terrain c/a: ${lr}`;
    }
  }

  drawHeightmap() {
    this.ctx.putImageData(this.imageData, 0, 0);
  }
}
