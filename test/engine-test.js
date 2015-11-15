var assert = require('assert');

var kernelops = require('../built/utils/kernelops.js');
var vect = require('../built/utils/vect.js');

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

describe('Vect', function() {
  describe('vec3D class', function () {
    it('should add, len and dist properly', function () {
      var a = new vect.vec3D(-1,2,-3);
      var b = new vect.vec3D(1,-2,3);
      assert.equal(a.len(), 3.7416573867739413);
      assert.equal(a.dist(b), 7.483314773547883);
      a.add(b);
      assert.deepEqual(a, new vect.vec3D(0,0,0));
    });
    it('should have a separate scale method', function () {
      var a = new vect.vec3D(-1,2,-3);
      assert.deepEqual(vect.scale(a, 2), new vect.vec3D(-2,4,-6));
    });
  });
});
