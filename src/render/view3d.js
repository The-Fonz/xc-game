/*
 * 3D view
 */

import * as THREE from "three";
import {l} from "../utils/logging";

/** WebGL view */
export class ThreeDeeView {
  /** Instantiate using engine, scenery, paraglider 3D models and config */
  constructor(engine, sceneryjson, pgmodels, config) {
    window.THREE = THREE;
    window.tdv = this;

    this.engine = engine;
    this.config = config;

    this.scene = new THREE.Scene();

  	this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, config.clippingplane );

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
      let pgmat  = new THREE.MeshStandardMaterial(
        {color: 0x888888, side: THREE.DoubleSide, shading: THREE.FlatShading, roughness: 0.55, metalness: 0.2});
      pg.mesh = new THREE.Mesh(pggeom, pgmat);
      pg.mesh.position.set(pg.pos.x, pg.pos.y, pg.pos.z);
      console.log(pg.mesh)
      this.scene.add(pg.mesh);
    }

    this.applyConfig(config);

  	document.body.appendChild( this.renderer.domElement );
  }

  /** Read pg position from engine and update their mesh positions */
  updatePg() {
    for (var pg of this.engine.paragliders) {
      pg.mesh.position.set(pg.pos.x, pg.pos.y, pg.pos.z);
      pg.mesh.rotation.set(0,0,0,'YZX');
      pg.mesh.rotation.y = pg.heading;
      pg.mesh.rotation.z = pg.bank;
    }
    if (this.updatePg.cacheVars === undefined) {
      this.updatePg.cacheVars = {
        'targetZoom': 1,
      };
    }
    let c = this.updatePg.cacheVars;
    // Zoom camera if going faster
    let oldzoom = this.camera.zoom;
    c.targetZoom = 1 + .3* this.engine.paragliders[0].speedstate;
    // Only update if necessary
    if (oldzoom !== c.targetZoom) {
      this.camera.zoom = .95*this.camera.zoom + .05*c.targetZoom;
      this.camera.updateProjectionMatrix();
    }
  }

  /** Apply configuration object */
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

    // Initialize first cam
    this.nextCam();
  }

  /** Call renderer */
  render() {
    this.renderer.render( this.scene, this.camera );
  }

  /** Switch to next cam in camera config list */
  nextCam() {
    if (this.camIndex === undefined ||
        // Sorry for this, I just love short code
        ++this.camIndex >= this.config.cameras.length) {
      this.camIndex = 0;
    }
    this.camType = this.config.cameras[this.camIndex]['type'];
    l('Switched to cam type ' + this.camType);
  }

  /** Use the currently set camera */
  cam(keymap: KeyMap, dt: number, pg: Paraglider) {
    switch (this.camType) {
      case 'fixed':
        this.camFixed(keymap, dt, pg.pos);
        break;
      case 'free':
        this.camFree(keymap, dt);
        break;
      case 'relative':
        this.camRelative(keymap, dt, pg.pos);
        break;
      case 'cloud':
        this.camCloud(keymap, dt, pg);
        break;
      default:
        throw Error("Camera " + this.camType + " not found");
    }
  }

  /** Camera that looks at `pos` from configured position */
  camFixed(keymap: KeyMap, dt: number, pos: THREE.Vector3) {
    this.camera.position.fromArray(
      this.config.cameras[this.camIndex]['position']);
    this.camera.lookAt(pos);
  }

  /**
   * TODO: explain
   */
  camCloud(keymap: KeyMap, dt: number, pg: Paraglider) {
    if (this.camCloud.cacheVars === undefined) {
      this.camCloud.cacheVars = {
        rotateEuler: new THREE.Euler(0,0,0,'YZX'),
        translateVect: new THREE.Vector3(0,0,0),
      };
    }
    let c = this.camCloud.cacheVars;
    let cloudbase = this.config.cameras[this.camIndex]['cloudbase'];
    let vlength = 1.1 * cloudbase;
    // Reset translateVect
    // Determine where on line camera sits
    c.translateVect.set(0, 0, -vlength *.5);
    // Calculate up/down camera rotation
    // Vector reaches from pg to cloudbase, has fixed length
    c.rotateEuler.x = Math.asin((cloudbase - pg.pos.y) / vlength);
    // Make error signal
    // We only want to use the positive modulus range
    let relativeRotation = (c.rotateEuler.y - pg.rotation.y);
    if (relativeRotation < 0) relativeRotation = 2*Math.PI - Math.abs(relativeRotation)%(2*Math.PI);
    relativeRotation = (relativeRotation + Math.PI)
            % (2*Math.PI) - Math.PI;
    // Smooth transition when cam looks pg in face by
    // linearly decreasing error signal towards 180deg
    relativeRotation = relativeRotation * (Math.PI-Math.abs(relativeRotation));
    // Apply error signal to camera rotation
    c.rotateEuler.y -= relativeRotation * .5*dt;
    // Rotate
    c.translateVect.applyEuler(c.rotateEuler);
    // Set camera position
    this.camera.position.addVectors(pg.pos, c.translateVect);
    this.camera.lookAt(pg.pos);
  }

  /**
   * Look at pos from fixed angle, rotate and zoom with wasdfv
   */
  camRelative(keymap: KeyMap, dt: number, pos: THREE.Vector3) {
    // View that looks at pg while rotating and zooming
    // Instantiate cache vars
    if (this.camRelative.cacheVars === undefined) {
      this.camRelative.cacheVars = {
        rotateEuler: new THREE.Euler(0,0,0,'YZX').fromArray(
          this.config.cameras[this.camIndex]['initialRotation']),
        // Must have nonzero initial length for clamp to work
        translateVect: new THREE.Vector3(0,0,200),
      };
      // We don't use Z rotation
      this.camRelative.cacheVars.rotateEuler.z = 0;
      console.info("Rotate with a,s,d,w and zoom with f,v");
    }
    let c = this.camRelative.cacheVars;
    // Reset to look into Z direction, keep length for zoom to work
    c.translateVect.set(0,0,
      c.translateVect.length());
    c.translateVect.clampLength(150,2000);
    // Set side axis rotation
    c.rotateEuler.x += dt * (keymap.get('s') - keymap.get('w'));
    // Set top axis rotation
    c.rotateEuler.y += dt*2 * (keymap.get('d') - keymap.get('a'));
    // Apply rotation to the reset translateVect
    c.translateVect.applyEuler(c.rotateEuler);
    // Zoom
    let zoom = keymap.get('f') - keymap.get('v');
    if (zoom) c.translateVect.multiplyScalar(1-zoom*dt*2);
    // Set to position of pg + offset position
    this.camera.position.addVectors(pos, c.translateVect);
    this.camera.lookAt(pos);
  }

  /**
   * Fly around with wasdfv and arrow keys
   */
  camFree(keymap: KeyMap, dt: numbers) {
    // Instantiate cache vars
    if (this.camFree.translatevect === undefined) {
      this.camFree.translatevect = new THREE.Vector3();
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

      this.camFree.translatevect.set(side,0,fwd);

      this.camFree.translatevect.applyEuler(this.camera.rotation);
      this.camFree.translatevect.setY(up);

      this.camera.position.add(this.camFree.translatevect);
    }
  }

  /** Put boxes at all heightmap points */
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
