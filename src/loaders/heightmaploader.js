import {l} from '../utils';

/**
 * Converts a jpg heightmap to plain array in an offscreen canvas.
 */
export class HeightmapLoader {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }
    _setCanvasSize(w, h) {
        this.canvas.width = w;
        this.canvas.height = h;
    }
    loadImg(img) {
        let w = img.width;
        let h = img.height;
        let w_h = w*h;
        l(`Loading heightmap image with size w=${w} h=${h}`);
        this._setCanvasSize(w,h);
        this.ctx.drawImage(img, 0, 0);
        let out = new Uint8Array(w_h);
        // imageData is a Uint8ClampedArray containing pixels in RGBA order
        let imageData = this.ctx.getImageData(0,0,w,h);
        let i = 0;
        for (let j=0; j<w_h; j++) {
            out[j] = imageData.data[i];
            // It's greyscale so we just use the R pixel and skip GBA
            i += 4;
        }
        return out;
    }
}
