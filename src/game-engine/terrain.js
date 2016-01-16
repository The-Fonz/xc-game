/*
 * Terrain class
 */

import vec3 from "gl-matrix-vec3";

export class Terrain {

  // Loads heightmap from image. Needs DOM
  constructor(img, test = false) {

    // Make new canvas
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;

    // Store width and height
    this.width = canvas.width;
    this.height = canvas.height;

    // Draw to canvas, get pixel array
    ctx.drawImage(img,0,0);
    var imageData = ctx.getImageData(0,0,this.width,this.height);
    var data = imageData.data;

    // Set heightmap size, we only use one channel from RGBA
    this.heightmap = new Uint8ClampedArray(data.length/4);

    // Extract pixels
    var indexhm = 0;
    var indexdt = 0;

    for (var y=0; y<this.height; y++) {
      for (var x=0; x<this.width; x++) {
        this.heightmap[indexhm] = data[indexdt];
        indexhm += 1; indexdt += 4;
      }
    }

    // Show img and canvas if test mode
    if (test) {
      img.style.display = "block";
      document.body.appendChild(img);
      document.body.appendChild(canvas);
    }
  }

  // Get height at point on terrain, returns infinity if outside terrain
  getHeight(out, pos) {
    var x = Math.round(pos[0]);
    var y = Math.round(pos[1]);

    if (x<0 || y<0 || x>=this.width || y>=this.height) {
      out[2] = Number.POSITIVE_INFINITY;
    } else {
      out[2] = this.heightmap[y*this.width + x];
    }
  }

  /* Get gradient at some point. If outside edge, return inward-pointing vect */
  getGradient(out, pos) {
    var x = Math.round(pos[0]);
    var y = Math.round(pos[1]);

    if (x<=1 || x>=(this.width-2) || y<=1 || y>=(this.height-2)) {

      this._center = vec3.fromValues(this.width/2, this.height/2, 0);

      vec3.subtract(out, this._center, pos);

    } else {
      // Calculate horizontal sobel
      out[0] = this.heightmap[y*this.width + x-1] -
               this.heightmap[y*this.width + x+1];
      // Calculate vertical sobel
      out[1] = this.heightmap[(y-1)*this.width + x] -
               this.heightmap[(y+1)*this.width + x];
    }
  }
}
