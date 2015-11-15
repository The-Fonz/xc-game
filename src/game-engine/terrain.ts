/*
 * Terrain class
 */

export class Terrain {
  heightmap: Uint8ClampedArray;
  height: number;
  width: number;

  // Image url is optional
  constructor(url:string = "") {
    if (url) {
      this.loadHeightmapFromImage(url);
    }
  }

  // Image() needs (headless) browser
  loadHeightmapFromImage(url:string, test:boolean = false) {
    // The document is rendered as though the element does not exist
    var img = new Image(); img.src = url; img.style.display = "none";
    // Define loading code in callback
    img.onload = () => {
      // Make new canvas
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext('2d');
      canvas.width = img.width; canvas.height = img.height;
      // Store width and height for fast for-loop
      var canvasWidth = canvas.width; var canvasHeight = canvas.height;
      // Draw to canvas, get pixel array
      ctx.drawImage(img,0,0);
      var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
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
    };
  }
}
