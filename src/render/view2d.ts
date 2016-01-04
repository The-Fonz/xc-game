/*
 *
 */

import Engine = require("../game-engine/engine");

// Base class for 2D canvas views
class MapView {
  engine: Engine;
  canvasWidth: number;
  canvasHeight: number;
  ctx: CanvasRenderingContext2D;

  constructor(engine: Engine, canvas:HTMLCanvasElement) {
    this.engine = engine;
    this.canvasHeight = canvas.height;
    this.canvasWidth = canvas.width;
    this.ctx = canvas.getContext('2d');
  }
}

export class HeightmapView extends MapView {
  imageData: ImageData;

  constructor(e,c) {
    super(e,c);
    this.imageData = this.ctx.getImageData(0,0,this.canvasWidth,this.canvasHeight);
    var i = 0; var j = 0;
    for (var y=0; y<this.canvasHeight; y++) {
      for (var x=0; x<this.canvasWidth; x++) {
        var height = this.engine.terrain.heightmap[i++];
        this.imageData.data[j++] = height; // R
        this.imageData.data[j++] = height; // G
        this.imageData.data[j++] = height; // B
        this.imageData.data[j++] = 255; // A
      }
    }
  }

  update():void {
    this.drawHeightmap();
    this.drawParagliders();
  }

  drawParagliders():void {
    var l = this.engine.paragliders.length;
    for (var i=0; i<l; i++) {
      var pg = this.engine.paragliders[i];
      this.ctx.beginPath();
      this.ctx.arc(pg.pos[0], pg.pos[1], 2+pg.pos[2]/20, 0, 2 * Math.PI, false);
      this.ctx.fillStyle = 'red';
      this.ctx.fill();
    }
  }

  drawHeightmap():void {
    this.ctx.putImageData(this.imageData,0,0);
  }
}

export class LiftView {}
export class VarioView {}
