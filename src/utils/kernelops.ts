/*
 * Kernel operations like Sobel
 */

// Kernel must be specified rows first
export function kernel3x3(kernel, imarr:Uint16Array,
	width:number, height:number):Uint16Array {

	var out = new Uint16Array(imarr.length);
	// Rows first
	for (var i=1; i<height-1; i++) {
		for (var j=1; j<width-1; j++) {
			out[width*i+j] = imarr[width*(i-1) + j-1] * kernel[0] +
			                 imarr[width*(i-1) + j]   * kernel[1] +
											 imarr[width*(i-1) + j+1] * kernel[2] +
											 imarr[width*(i)   + j-1] * kernel[3] +
											 imarr[width*(i)   + j]   * kernel[4] +
											 imarr[width*(i)   + j+1] * kernel[5] +
											 imarr[width*(i+1) + j-1] * kernel[6] +
											 imarr[width*(i+1) + j]   * kernel[7] +
											 imarr[width*(i+1) + j+1] * kernel[8];
		}
	}
	return out;
};
