/*
 * Terrain class
 */

export class Terrain {
  // Loads heightmap from image. Needs DOM
  constructor(img, test = false) {
    // Make new canvas
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext('2d');
    canvas.width = img.width; canvas.height = img.height;
    // Store width and height for fast for-loop
    var canvasWidth = canvas.width; var canvasHeight = canvas.height;
    // Draw to canvas, get pixel array
    ctx.drawImage(img,0,0);
    var imageData = ctx.getImageData(0,0,canvasWidth,canvasHeight);
    var data = imageData.data;
    // Set heightmap size, we only use one channel from RGBA
    this.heightmap = new Uint8ClampedArray(data.length/4);
    // Extract pixels
    var indexhm = 0;
    var indexdt = 0;
    for (var y=0; y<canvasHeight; y++) {
      for (var x=0; x<canvasWidth; x++) {
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
}
