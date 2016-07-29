/*
 * 3D view
 */

import * as THREE from "three";
import {l} from "../utils/logging";

export class ThreeDeeView {
  constructor(engine, sceneryjson, pgmodels, config) {
    window.THREE = THREE;
    window.tdv = this;

    this.engine = engine;

    this.scene = new THREE.Scene();

  	this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, config.clippingplane );
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

    // Add pg meshes to paraglider objects
    // Kind of dirty but avoids having to keep extra objects in sync
    for (var pg of this.engine.paragliders) {
      l("view3d: instantiating paraglider at position x="+
        pg.pos.x+", y="+pg.pos.y+", z="+pg.pos.z);
      //TODO: load different pgmeshes based on pg config, to have some variation
      let pggeom = loader.parse(pgmodels[0]).geometry;
      let pgmat  = new THREE.MeshBasicMaterial(
        {color: 0x888888, side: THREE.DoubleSide, shading: THREE.FlatShading});
      pg.mesh = new THREE.Mesh(pggeom, pgmat);
      pg.mesh.position.set(pg.pos.x, pg.pos.y, pg.pos.z);
      console.log(pg.mesh)
      this.scene.add(pg.mesh);
    }

    this.applyConfig(config);

  	document.body.appendChild( this.renderer.domElement );
  }

  // Read pg position from engine and update
  updatePg() {
    for (var pg of this.engine.paragliders) {
      pg.mesh.position.set(pg.pos.x, pg.pos.y, pg.pos.z);
      pg.mesh.rotation.set(0,0,0,'YZX');
      pg.mesh.rotation.y = pg.heading;
      pg.mesh.rotation.z = pg.bank;
    }
  }

  applyConfig(config) {
    if (config.fog)
      this.scene.fog = new THREE.Fog(
        config.fog.hex,
        config.fog.near,
        config.fog.far);
    if (config.axishelper)
      this.scene.add( new THREE.AxisHelper( config.axishelper ) );
    if (config.clearcolor)
      this.renderer.setClearColor(config.clearcolor);
    if (config.showheightmap)
      this.showHeightmap();
  }

  render() {
    this.renderer.render( this.scene, this.camera );
  }

  pgview(keymap, dt, pos) {
    // View that looks at pg while rotating and zooming
    // Instantiate cache vars
    if (this.flyaround.translatevect === undefined) {
      this.flyaround.translatevect = new THREE.Vector3();
      // Reorder once
      this.camera.rotation.reorder('YZX');
      console.info("Rotate with a,s,d,w and zoom with f,v");
    }
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

  // Makes boxes at all heightmap points
  showHeightmap() {
    // Makes
    let t = this.engine.terrain;

    let boxsize = t.hscale;
    let hscale = t.hscale;
    let vscale = t.vscale;

    for (var i=0; i<t.heightmap.length; i++) {
      for (var j=0; j<t.heightmap[0].length; j++) {
        // Only render some
        if (!(i%10)&&!(j%10)) {
          let box = new THREE.BoxGeometry(boxsize,boxsize,boxsize);
          let material = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
          let cube = new THREE.Mesh(box, material);
          let height = t.heightmap[j][i];
          height *= t.heightmapvscale * t.vscale
          cube.position.set(i*hscale, height, j*hscale);
          this.scene.add(cube);
        }
      }
    }
  }
}
