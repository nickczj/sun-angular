import { Component, OnInit } from '@angular/core';
import * as SunCalc from 'suncalc';
import { Position } from './position.interface';

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
    gamma: number
  };

  constructor() { }

  ngOnInit() {
    this.subscribeCurrentPosition();
    setInterval(() => this.subscribeCurrentPosition(), 3000);

    var lat = this.currentObserverPosition.longitude;
    var long = this.currentObserverPosition.latitude;
    
    this.currentSunPosition = SunCalc.getPosition(new Date(), lat, long);
    console.log(this.currentSunPosition);

  }

  subscribeCurrentPosition() {
    if (window.navigator.geolocation) {
      window.navigator.geolocation.watchPosition(
        (position) => {
          console.log(position);
          this.currentObserverPosition = position.coords;
        }, (error) => {
          console.log('Geolocation error: '+ error);
        },
        { enableHighAccuracy: true });
    } else {
        console.log('Geolocation not supported in this browser');
    }

    var deviceOrientationEvent = new DeviceOrientationEvent("deviceorientation");
    if (deviceOrientationEvent) {
      this.deviceOrientiation = deviceOrientationEvent;
    }
  }

}
