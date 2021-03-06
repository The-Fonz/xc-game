/*
 * 3D view
 */

import * as THREE from "three";
import {l} from "../utils";

/** WebGL view */
export class ThreeDeeView {
    constructor() {}
    /** Instantiate using engine, scenery, paraglider 3D models and config */
    setConfig(engine, sceneryjson, assets, config) {
        window.THREE = THREE;
        window.tdv = this;

        this.engine = engine;
        this.config = config;
        this.assets = assets;

        this.state = {
            // Points to 0,0,0
            sunposition: new THREE.Vector3(100,150,0),
        };

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, config.clippingplane );

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        // SCATTERED LIGHT
        var light = new THREE.HemisphereLight( 0x67B5DD, 0xC7B071, 0.6 );
        this.scene.add( light );

        // SUN
        var directionalLight = new THREE.DirectionalLight( 0xFAFF95, 1.6 );
        directionalLight.position.copy(this.state.sunposition);
        this.scene.add( directionalLight );
        // Enable automatic updating of target's matrixWorld
        this.scene.add( directionalLight.target );

        this.sun = directionalLight;

        // instantiate a loader
        var loader = new THREE.JSONLoader();

        let loaded = loader.parse(sceneryjson);
        var mtl = new THREE.MeshLambertMaterial( { color: 0xFFFFFF, vertexColors: THREE.FaceColors } );

        var scenerymesh = new THREE.Mesh( loaded.geometry, mtl );

        let hscale = sceneryjson.xcgame.hscale;
        let vscale = sceneryjson.xcgame.vscale;
        scenerymesh.scale.set(hscale, vscale, hscale);
        this.scene.add( scenerymesh );
        this.scenerymesh = scenerymesh;

        // Add pg meshes to paraglider objects
        // Kind of dirty but avoids having to keep extra objects in sync
        for (var pg of this.engine.paragliders) {
            l("view3d: instantiating paraglider at position x="+
                pg.pos.x+", y="+pg.pos.y+", z="+pg.pos.z);
            // Namespace the data we attach to the pg model
            pg.meta.view3d = {};
            //TODO: load different pgmeshes based on pg config, to have some variation
            let pggeom = loader.parse(assets[0]).geometry;
            let pgmat  = new THREE.MeshStandardMaterial(
                {color: 0x888888, side: THREE.DoubleSide, shading: THREE.FlatShading, roughness: 0.55, metalness: 0.2});
            pg.meta.view3d.mesh = new THREE.Mesh(pggeom, pgmat);
            pg.meta.view3d.mesh.position.set(pg.pos.x, pg.pos.y, pg.pos.z);
            this.scene.add(pg.meta.view3d.mesh);
        }

        this.applyConfig(config);

        document.body.appendChild( this.renderer.domElement );
    }

    /** Put trees on terrain */
    initTrees(terrain) {
        // TODO: Load different tree meshes based on config
        let instance, x,y,z;
        let topaxis = new THREE.Vector3(0,1,0);
        let extentX = terrain.extent[2];
        let extentZ = terrain.extent[3];
        var loader = new THREE.JSONLoader();
        let group = new THREE.Object3D();
        let parsed = loader.parse(this.assets[1]);
        let material = new THREE.MultiMaterial( parsed.materials );
        let mesh = new THREE.Mesh( parsed.geometry, material );
        for (let i=0; i<this.config.ntrees; i++) {
            instance = mesh.clone();
            let scale = 69;
            instance.scale.set(scale,scale,scale);
            function r(s) {return Math.random()*s;}
            x = r(extentX);
            z = r(extentZ);
            y = terrain.getHeightNumber(x,z);
            instance.position.set(x,y,z);
            instance.rotation.set(0,r(6),0);
            // l(`Instantiate tree at ${x} ${y} ${z}`);
            group.add(instance);
        }
        this.scene.add(group);
    }

    /** Update cloud positions */
    updateClouds(air) {
        for (var t of air.thermals) {
            // Attach meta info to Thermal, add cloudmesh to
            if (!t.meta.view3d) {
                t.meta.view3d = {
                    // Instantiate with sane values, we'll update them anyway
                    cloudGeom: new THREE.CylinderGeometry(.8, 1, 1, 5),
                    cloudMat: new THREE.MeshStandardMaterial(
                        {color: this.config.cloudColor, side: THREE.DoubleSide,
                            shading: THREE.FlatShading, roughness: 0.55, metalness: 0.2}),
                };
                t.meta.view3d.cloudMesh = new THREE.Mesh(t.meta.view3d.cloudGeom, t.meta.view3d.cloudMat);
                this.scene.add(t.meta.view3d.cloudMesh);
            }
            // Hide cloudMesh if necessary
            t.meta.view3d.cloudMesh.visible = t.active;
            // Adjust cylinder shape on Object3D, not on CylinderGeometry
            t.meta.view3d.cloudMesh.scale.set(
                t.cloudWidth, t.cloudHeight, t.cloudWidth);
            // Set position based on thermal position
            t.meta.view3d.cloudMesh.position.set(t.pos.x, t.cloudbase, t.pos.z);
        }
    }

    /** Read pg position from engine and update their mesh positions */
    updatePg() {
        for (var pg of this.engine.paragliders) {
            pg.meta.view3d.mesh.position.copy(pg.pos);
            pg.meta.view3d.mesh.rotation.set(0,0,0,'YZX');
            pg.meta.view3d.mesh.rotation.y = pg.heading;
            pg.meta.view3d.mesh.rotation.z = pg.bank;
        }
        if (this.updatePg.cacheVars === undefined) {
            this.updatePg.cacheVars = {
                'targetZoom': 1,
            };
        }
        let c = this.updatePg.cacheVars;
        // Zoom camera if going faster
        let oldzoom = this.camera.zoom;
        c.targetZoom = 1 + .1* this.engine.paragliders[0].speedstate;
        // Only update if necessary
        if (oldzoom !== c.targetZoom) {
            this.camera.zoom = .95*this.camera.zoom + .05*c.targetZoom;
            this.camera.updateProjectionMatrix();
        }
    }

    /**
     * Set all necessary properties on renderer and light to allow
     * casting shadows.
     */
    _initShadow(pg) {
        l("Initializing shadows...");
        // Only let passed pg cast shadow
        pg.meta.view3d.mesh.castShadow = true;
        this.scenerymesh.receiveShadow = true;
        this.renderer.shadowMap.enabled = true;
        // Show wing shadow if no back faces are used
        this.renderer.shadowMap.renderReverseSided = THREE.CullFaceNone;
        this.renderer.shadowMapSoft = true;
        this.sun.castShadow = true;
        this.sun.shadow.camera.near    = 20;
        this.sun.shadow.camera.far     = 2000;
        // Set bigger than bounding box
        this.sun.shadow.camera.left    = -100;
        this.sun.shadow.camera.right   =  100;
        this.sun.shadow.camera.top     =  100;
        this.sun.shadow.camera.bottom  = -100;
        // Set to smaller size for less performance hit
        this.sun.shadow.mapSize.set(256,256);
    }

    /**
     * Update shadow camera position to cast shadow on one specific pg,
     * initialize if not yet initialized.
     */
    updateShadow(pg) {
        let c = this.updateShadow.state;
        if (c === undefined) {
            this.updateShadow.state = {};
            this._initShadow(pg);
        }
        this.sun.position.addVectors(pg.pos, this.state.sunposition);
        // Keep some distance from pg
        this.sun.target.position.lerpVectors(
            pg.pos, this.sun.position, .9);
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
        let vlength = 2 * cloudbase;
        // Reset translateVect
        // Determine where on line camera sits
        c.translateVect.set(0, 0, -vlength *.1);
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
            l("Rotate with a,s,d,w and zoom with f,v");
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
            this.camera.position.fromArray(
                this.config.cameras[this.camIndex]['position'] || [500,500,500]);
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
    showHeightmap(terrain) {
        // Makes
        let t = terrain;

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
