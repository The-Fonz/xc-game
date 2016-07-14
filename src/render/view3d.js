/*
 *
 */

import {Engine} from "../game-engine/engine";
import * as THREE from "three";

export class ThreeDeeView {
  constructor(engine, sceneryjson) {
    window.THREE = THREE;
    window.tdv = this;

    this.engine = engine;

    this.scene = new THREE.Scene();

  	this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    this.camera.position.x = 2000;
    this.camera.position.y = 2000;
  	this.camera.position.z = 2E3;
    this.camera.lookAt(new THREE.Vector3(0,0,0));

  	this.renderer = new THREE.WebGLRenderer();
  	this.renderer.setSize( window.innerWidth, window.innerHeight );

    // SCATTERED LIGHT
    var light = new THREE.HemisphereLight( 0x67B5DD, 0xC7B071, 1 );
    this.scene.add( light );

    // SUN
    var directionalLight = new THREE.DirectionalLight( 0xFAFF95, 1 );
    directionalLight.position.set( 0, 1, 0 );
    this.scene.add( directionalLight );

    // instantiate a loader
    var loader = new THREE.JSONLoader();

    let loaded = loader.parse(sceneryjson);
    console.log(loaded);

    var mtl = new THREE.MeshStandardMaterial( { color: 0xFFFFFF, vertexColors: THREE.FaceColors, roughness: 0.55, metalness: 0.5 } )

    var scenerymesh = new THREE.Mesh( loaded.geometry, mtl );

    // TODO: Get config from geometry obj
    let hscale = sceneryjson.xcgame.hscale;
    let vscale = sceneryjson.xcgame.vscale;
    scenerymesh.scale.set(hscale, vscale, hscale);
    this.scene.add( scenerymesh );

  	document.body.appendChild( this.renderer.domElement );
  }

  render() {
    this.renderer.render( this.scene, this.camera );
  }

  processinput(keymap, dt) {
    let rotationspeed = dt;
    // Reuse vectors for speed (object creation is costly)
    // if (! this.pieul ) this.pieul = new THREE.Euler();
    let i = keymap.status;
    let l = i.a;
    let r = i.d;
    let u = i.w;
    let d = i.s;
    // undefined becomes 0
    // this.pieul.set(0, l || -r, 0, 'XYZ');
    if ( l || -r)
      this.camera.rotation.x += l || -r;
  }
}
