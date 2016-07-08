/*
 *
 */

import {Engine} from "../game-engine/engine";
import * as THREE from "three";

export class ThreeDeeView {
  constructor(engine, sceneryjson) {
    this.engine = engine;

    var scene, camera, renderer;
    var geometry, material, mesh;

    init(sceneryjson);
    animate();

    function init(sceneryjson) {

    	scene = new THREE.Scene();

    	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
      camera.position.x = 2000;
      camera.position.y = 2000;
    	camera.position.z = 2000;

      camera.lookAt(new THREE.Vector3(0,0,0));

    	geometry = new THREE.BoxGeometry( 200, 200, 200 );
    	material = new THREE.MeshLambertMaterial( { color: 0xff0000 } );

    	mesh = new THREE.Mesh( geometry, material );
    	scene.add( mesh );

    	renderer = new THREE.WebGLRenderer();
    	renderer.setSize( window.innerWidth, window.innerHeight );

      // SCATTERED LIGHT
      var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
      scene.add( light );

      // SUN
      // var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
      // directionalLight.position.set( 0, 1, 0 );
      // scene.add( directionalLight );

      // instantiate a loader
      var loader = new THREE.JSONLoader();

      // TODO: Use loader.parse to load the json

      // load a resource
      loader.load(
      	// resource URL
      	'../terrainmaker/grandcanyon.ignore.json',
      	// Function when resource is loaded
      	function ( geometry ) {
          var mtl = new THREE.MeshStandardMaterial( { color: 0x000000, vertexColors: THREE.FaceColors, roughness: 0.55, metalness: 0.5 } )
      		var object = new THREE.Mesh( geometry, mtl );
          object.scale.set(1,3,1);
      		scene.add( object );
          document.o = object;
      	}
      );

    	document.body.appendChild( renderer.domElement );

    }

    function animate() {

    	requestAnimationFrame( animate );

    	mesh.rotation.x += 0.01;
    	mesh.rotation.y += 0.02;

    	renderer.render( scene, camera );

    }
  }

  update() {
    this.drawHeightmap();
    this.drawParagliders();
  }

  drawParagliders() {
    var l = this.engine.paragliders.length;
    for (var i=0; i<l; i++) {
      var pg = this.engine.paragliders[i];
      this.ctx.beginPath();
      this.ctx.arc(pg.pos[0], pg.pos[1], 2+pg.pos[2]/20, 0, 2 * Math.PI, false);
      this.ctx.fillStyle = 'red';
      this.ctx.fill();
    }
  }

  drawHeightmap() {
    this.ctx.putImageData(this.imageData,0,0);
  }
}
