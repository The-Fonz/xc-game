var assert = require('assert');

var kernelops = require('../built/utils/kernelops.js');

describe('Utils', function() {
  describe('kernelops', function () {
    it('should return correct value for 3x3 matrix', function () {
      var a = new Uint16Array(9);
      for (var i=0; i<a.length; i++) a[i] = i+1;
      var result = new Uint16Array(9);
      result[4] = 285;
      assert.deepEqual(kernelops.kernel3x3(a,a,3,3), result);
    });
  });
});
