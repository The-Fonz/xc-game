/*
 *
 */

import {Engine} from "../game-engine/engine";

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
    this.drawLift();
  }

  drawParagliders() {

    var l = this.engine.paragliders.length;

    for (var i = 0; i < l; i++) {

      var pg = this.engine.paragliders[i];

      // Draw circle where pg is
      this.ctx.beginPath();
      this.ctx.arc(pg.pos[0], pg.pos[1], 3, 0, 2 * Math.PI, false);
      this.ctx.fillStyle = 'red';
      this.ctx.fill();

      // Draw line with velocity
      this.ctx.beginPath();
      this.ctx.moveTo(pg.pos[0], pg.pos[1]);
      this.ctx.lineTo(pg.pos[0] + pg.spd[0], pg.pos[1] + pg.spd[1]);
      this.ctx.strokeStyle = 'red';
      this.ctx.stroke();

      // Draw gradient at probe location
      this.ctx.beginPath();
      this.ctx.moveTo(pg._probe[0], pg._probe[1]);
      this.ctx.lineTo(pg._probe[0] + pg._grad[0],
                      pg._probe[1] + pg._grad[1]);
      this.ctx.strokeStyle = 'blue';
      this.ctx.stroke();

      // By convention, first pg is player
      if (i === 0) this.stats.innerHTML = `xyz: ${Math.round(pg.pos[0])}
                                                ${Math.round(pg.pos[1])}
                                                ${Math.round(pg.pos[2])}
                                        height: ${pg._agl}
                                probe gradient: ${pg._grad[0]} ${pg._grad[1]}
         terrain c/a: ${pg._lr[2] < 0 ? "right" : "left"}`;
    }
  }

  drawHeightmap() {
    this.ctx.putImageData(this.imageData, 0, 0);
  }

  drawLift() {
    var ths = this.engine.lift.thermals;

    for (var i=0; i<ths.length; i++) {
      var th = ths[i];
      // Draw dashed circle where thermal is
      this.ctx.beginPath();
      this.ctx.setLineDash([5]);
      this.ctx.arc(th.pos[0], th.pos[1], th.radius, 0, 2 * Math.PI, false);
      this.ctx.strokeStyle = 'green';
      this.ctx.stroke();
      this.ctx.setLineDash([0]);
    }
  }
}
