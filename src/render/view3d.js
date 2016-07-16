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
    var mtl = new THREE.MeshStandardMaterial( { color: 0xFFFFFF, vertexColors: THREE.FaceColors, roughness: 0.55, metalness: 0.5 } )

    var scenerymesh = new THREE.Mesh( loaded.geometry, mtl );

    let hscale = sceneryjson.xcgame.hscale;
    let vscale = sceneryjson.xcgame.vscale;
    scenerymesh.scale.set(hscale, vscale, hscale);
    this.scene.add( scenerymesh );

  	document.body.appendChild( this.renderer.domElement );
  }

  render() {
    this.renderer.render( this.scene, this.camera );
  }

  flyaround(keymap, dt) {
    // Instantiate cache vars
    if (this.flyaround.translatevect === undefined) {
      this.flyaround.translatevect = new THREE.Vector3();
      // Reorder once
      this.camera.rotation.reorder('YZX');
      console.info("Fly around with w,s,a,d,f,v and arrow keys");
    }
    let rotationspeed = dt;
    let walkspeed = dt*1E3;

    let i = keymap.status;

    let l = Number(i.a||0 - i.d||0) * rotationspeed;
    let u = Number(i.w||0 - i.s||0) * rotationspeed;
    let fwd = Number(i.ArrowDown||0 - i.ArrowUp||0) * walkspeed;
    let side = Number(i.ArrowRight||0 - i.ArrowLeft||0) * walkspeed;
    let up = Number(i.f||0 - i.v||0) * walkspeed;

    if ( l || u || fwd || side || up ) {
      // Rotate around top axis (y) first and don't use roll (z)
      this.camera.rotation.x += u;
      this.camera.rotation.y += l;

      this.flyaround.translatevect.set(side,0,fwd);

      this.flyaround.translatevect.applyEuler(this.camera.rotation);
      this.flyaround.translatevect.setY(up);

      this.camera.position.add(this.flyaround.translatevect);
    }
  }
}
