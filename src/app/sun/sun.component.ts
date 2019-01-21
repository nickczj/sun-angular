import { Component, OnInit } from '@angular/core';
import * as SunCalc from 'suncalc';
import { Position } from './position.interface';
import * as THREE from 'three-full';

@Component({
  selector: 'app-sun',
  templateUrl: './sun.component.html',
  styleUrls: ['./sun.component.css']
})
export class SunComponent implements OnInit {

  public RADIUS: number = 3;

  currentSunPosition: {
    altitude: number, 
    azimuth: number
  };

  currentSunPositionXYZ: {
    x: number,
    y: number,
    z: number
  }

  currentObserverPosition: Position;

  deviceOrientiation: {
    alpha: number,
    beta: number,
    gamma: number
  };

  isSunInit: boolean = false;
  dot: THREE.BufferGeometry;
  position: any[];

  pi = Math.PI; pi05 = this.pi * 0.5; pi2 = this.pi * 2;
	d2r = this.pi / 180; r2d = 180 / this.pi;

  constructor() { }

  ngOnInit() {
    this.initData();
    this.subscribeDeviceOrientation();
    this.subscribeCurrentPosition();
    // this.createSphere(this.currentSunPositionXYZ);
    // setInterval(() => this.subscribeCurrentPosition(), 10000);    
  }

  initData() {
    this.currentObserverPosition = {
      latitude: 0,
      longitude: 0,
      accuracy: 0,
      altitude: 0,
      altitudeAccuracy: 0,
      heading: 0,
      speed: 0
    }

    this.deviceOrientiation = {
      alpha: 0,
      beta: 0,
      gamma: 0
    }
  }

  subscribeDeviceOrientation() {
    window.addEventListener("deviceorientation", (event) => {
      console.log("1");
      var compassdir;
      if ((<any>event).webkitCompassHeading) {
        compassdir = (<any>event).webkitCompassHeading;  
      } else {
        compassdir = event.alpha;
      }
      this.deviceOrientiation = {
        alpha: compassdir,
        beta: event.beta,
        gamma: event.gamma
      }
    }, true);
}

  setSunPosition() {
    var lat = this.currentObserverPosition.latitude;
    var long = this.currentObserverPosition.longitude;

    this.currentSunPosition = SunCalc.getPosition(new Date(), lat, long);
    console.log(new Date());
    console.log("CHANGE AGAIN");
    console.log(this.currentSunPosition);
  }

  setSunPositionXYZ(currentSunPosition){
    this.currentSunPositionXYZ = {
      x: this.RADIUS * Math.cos( currentSunPosition.altitude ) * Math.sin( currentSunPosition.azimuth + Math.PI ),
      y: this.RADIUS * Math.cos( currentSunPosition.altitude ) * Math.cos( currentSunPosition.azimuth + Math.PI ),
      z: this.RADIUS * Math.sin( currentSunPosition.altitude )
    }
  }

  subscribeCurrentPosition() {
    if (window.navigator.geolocation) {
      window.navigator.geolocation.watchPosition(
        (position) => {
          console.log("POSITION: ");
          console.log(position);
          this.currentObserverPosition = position.coords;
          this.setSunPosition();
          this.setSunPositionXYZ(this.currentSunPosition);
          if (!this.isSunInit) {
            this.createSphere(this.currentSunPositionXYZ);
            this.isSunInit = true;
          }
          else{
            this.updatePosition()
          }
          console.log(this.currentSunPositionXYZ);
        }, (error) => {
          console.log('Geolocation error: '+ error);
        },
        { enableHighAccuracy: true });
    } else {
        console.log('Geolocation not supported in this browser');
    }
  }

  createSphere(currentSunPositionXYZ) {
    var scene = new THREE.Scene;
    var camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.rotation.order = 'ZXY'; // or whatever order is appropriate for your device
    var controls = new THREE.OrbitControls(camera);
    controls.enableZoom = false;
    controls.minPolarAngle = 0; // radians
    controls.maxPolarAngle = Math.PI; // radians
    controls.minAzimuthAngle = - Infinity; // radians
    controls.maxAzimuthAngle = Infinity; // radians

    var docSphere = document.getElementById('sphere');
    var renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    docSphere.appendChild(renderer.domElement);
    
    //Axes
    var axes = new THREE.AxesHelper(5);
    scene.add(axes);

    this.createDot(scene, currentSunPositionXYZ);
    this.createCrossHair(scene,camera);

    //Create Sphere
    var geometry = new THREE.SphereGeometry(this.RADIUS, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
    var material = new THREE.MeshNormalMaterial();
    material.colorWrite = false;
    var sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    //Grid line
    var geo = new THREE.EdgesGeometry( sphere.geometry ); // or WireframeGeometry
    var mat = new THREE.LineBasicMaterial( { color: 0x9400d3, linewidth: 2 } );
    var wireframe = new THREE.LineSegments( geo, mat );
    sphere.add(wireframe);

    console.log("now6");

    var waitDeviceOrientation = setInterval(() => {
      if (this.deviceOrientiation.beta !== 0) {
        // clearInterval(waitDeviceOrientation);
        //Camera position
        var x = Math.cos(this.deviceOrientiation.beta * this.d2r);
        var y = Math.sin(this.deviceOrientiation.beta * this.d2r);
        var z = Math.sin(this.deviceOrientiation.alpha * this.d2r);
        var m = 11/(x*x + y*y + z*z);
        x *= m; y *= m; z *= m;
        
        console.log("x " + x, "y " + y, "z " + z);
        camera.position.set(x, y, z);
        controls.update();

        var render = function () {
          requestAnimationFrame(render);
          renderer.render(scene, camera);
        };
        
        render();
      }
    }, 100);

    // window.removeEventListener("deviceorientation", (event) => {
    //   this.deviceOrientiation = {
    //     alpha: event.alpha,
    //     beta: event.beta,
    //     gamma: event.gamma
    //   }
    // }, true)
  }

  createCrossHair(scene,camera){
    var lineMat = new THREE.LineBasicMaterial({ color: 0xAAFFAA, linewidth:3 });

    // crosshair size
    var x = 0.01, y = 0.01;

    var geometry = new THREE.Geometry();

    // crosshair
    geometry.vertices.push(new THREE.Vector3(0, y, 0));
    geometry.vertices.push(new THREE.Vector3(0, -y, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(x, 0, 0));    
    geometry.vertices.push(new THREE.Vector3(-x, 0, 0));

    var crosshair = new THREE.Line( geometry, lineMat );

    // place it in the center
    var crosshairPercentX = 50;
    var crosshairPercentY = 50;
    var crosshairPositionX = (crosshairPercentX / 100) * 2 - 1;
    var crosshairPositionY = (crosshairPercentY / 100) * 2 - 1;

    crosshair.position.x = crosshairPositionX * camera.aspect;
    crosshair.position.y = crosshairPositionY;

    crosshair.position.z = -0.3;

    camera.add( crosshair );
    scene.add( camera );
  }

  createDot(scene, currentSunPositionXYZ) {
    this.dot = new THREE.BufferGeometry();
    var color = new THREE.Color();

    var x = 0.5;
		var y = 0.5;
		var z = 0.5;
		this.position = [ currentSunPositionXYZ.x, currentSunPositionXYZ.y, currentSunPositionXYZ.z ];
		// colors
		var vx = 0.5;
		var vy = 0.5;
    var vz = 0.5;
    color.setRGB( vx, vy, vz );
		var	colors = [ color.r, color.g, color.b ];

    this.dot.addAttribute( 'position', new THREE.Float32BufferAttribute( this.position, 3 ) );
    this.dot.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
    
    var mat = new THREE.PointsMaterial({size: 15, sizeAttenuation: false});
    var point = new THREE.Points( this.dot, mat );
    scene.add(point);
  }

  updatePosition(){
    this.dot.attributes.position.needsUpdate = true;
  }
}
