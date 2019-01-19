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

  constructor() { }

  ngOnInit() {
    this.initData();
    this.subscribeDeviceOrientation();
    this.subscribeCurrentPosition();
    // this.createSphere(this.currentSunPositionXYZ);
    setInterval(() => this.subscribeCurrentPosition(), 10000);    
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
    window.addEventListener("deviceorientation", handleOrientation, true);
    function handleOrientation(event) {
      console.log("alpha: ");
      console.log(event.alpha);
      this.deviceOrientiation.alpha = event.alpha;
      this.deviceOrientiation.beta = event.beta;
      this.deviceOrientiation.gamma = event.gamma;
    }
  }

  setSunPosition() {
    var lat = this.currentObserverPosition.longitude;
    var long = this.currentObserverPosition.latitude;

    this.currentSunPosition = SunCalc.getPosition(new Date(), lat, long);
    console.log(this.currentSunPosition);
  }

  setSunPositionXYZ(currentSunPosition){
    this.currentSunPositionXYZ = {
      x: 3 * Math.cos( currentSunPosition.altitude ) * Math.sin( currentSunPosition.azimuth + Math.PI ),
      y: 3 * Math.cos( currentSunPosition.altitude ) * Math.cos( currentSunPosition.azimuth + Math.PI ),
      z: 3 * Math.sin( currentSunPosition.altitude )
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
    var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
    var controls = new THREE.OrbitControls(camera);
    controls.enableZoom = false;

    var docSphere = document.getElementById('sphere');
    var renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    docSphere.appendChild(renderer.domElement);
    
    //Axes
    var axes = new THREE.AxesHelper(5);
    scene.add(axes);

    this.createDot(scene, currentSunPositionXYZ);

    //Create Sphere
    var geometry = new THREE.SphereGeometry(3, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
    var material = new THREE.MeshNormalMaterial();
    material.colorWrite = false;
    var sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    //Grid line
    var geo = new THREE.EdgesGeometry( sphere.geometry ); // or WireframeGeometry
    var mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
    var wireframe = new THREE.LineSegments( geo, mat );
    sphere.add(wireframe);

    //Camera position
    // camera.position.set(
    //   this.deviceOrientiation.alpha,
    //   this.deviceOrientiation.beta,
    //   this.deviceOrientiation.gamma);
    camera.position.set(10,10,10);
    controls.update();

    var render = function () {
      requestAnimationFrame(render);

      controls.update();

      renderer.render(scene, camera);
    };
    
    render();
  }

  createDot(scene, currentSunPositionXYZ) {
    var dot = new THREE.BufferGeometry();
    var color = new THREE.Color();

    var x = 0.5;
		var y = 0.5;
		var z = 0.5;
		var positions = [ currentSunPositionXYZ.x, currentSunPositionXYZ.y, currentSunPositionXYZ.z ];
		// colors
		var vx = 0.5;
		var vy = 0.5;
    var vz = 0.5;
    color.setRGB( vx, vy, vz );
		var	colors = [ color.r, color.g, color.b ];

    dot.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
    dot.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
    
    var mat = new THREE.PointsMaterial();
    var point = new THREE.Points( dot, mat );
    scene.add(point);
  }
}
