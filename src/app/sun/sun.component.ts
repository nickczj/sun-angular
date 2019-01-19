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

  currentObserverPosition: Position;

  deviceOrientiation: {
    alpha: number,
    beta: number,
    gamma: number,
    absolute: boolean
  };

  constructor() { }

  ngOnInit() {
    this.initData();
    this.createSphere();
    this.subscribeCurrentPosition();
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
  }

  setSunPosition() {
    var lat = this.currentObserverPosition.longitude;
    var long = this.currentObserverPosition.latitude;

    this.currentSunPosition = SunCalc.getPosition(new Date(), lat, long);
    console.log(this.currentSunPosition);
  }

  subscribeCurrentPosition() {
    if (window.navigator.geolocation) {
      window.navigator.geolocation.watchPosition(
        (position) => {
          console.log("POSITION: ");
          console.log(position);
          this.currentObserverPosition = position.coords;
          this.setSunPosition();
        }, (error) => {
          console.log('Geolocation error: '+ error);
        },
        { enableHighAccuracy: true });
    } else {
        console.log('Geolocation not supported in this browser');
    }

    var deviceOrientationEvent = new DeviceOrientationEvent("deviceorientation");
    if (deviceOrientationEvent) {
      console.log("DOE: " + deviceOrientationEvent.alpha);
      this.deviceOrientiation = { 
        alpha: deviceOrientationEvent.alpha, 
        beta: deviceOrientationEvent.beta, 
        gamma: deviceOrientationEvent.gamma,
        absolute: deviceOrientationEvent.absolute
      };
    }
  }

  createSphere() {
    console.log("1");
    var scene = new THREE.Scene;
    var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    var controls = new THREE.OrbitControls(camera);

    console.log("2");

    var docSphere = document.getElementById('sphere');
    var renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    docSphere.appendChild(renderer.domElement);
    
    console.log("3");

    var geometry = new THREE.SphereGeometry(4, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
    var material = new THREE.MeshNormalMaterial();
    var cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    //Camera position
    camera.position.set(0,0,10);
    controls.update();
    //camera.position.z = 10;


    var render = function () {
      requestAnimationFrame(render);

      //cube.rotation.y += 0.00;
      
      controls.update();

      renderer.render(scene, camera);
    };
    
  render();
 }
}
