import { Component, OnInit } from '@angular/core';
import * as SunCalc from 'suncalc';
import { Position } from './position.interface'

@Component({
  selector: 'app-sun',
  templateUrl: './sun.component.html',
  styleUrls: ['./sun.component.css']
})
export class SunComponent implements OnInit {

  currentSunPosition: Position;

  constructor() { }

  ngOnInit() {
    this.currentSunPosition = SunCalc.getPosition(new Date(), 1.35254, 103.9588412);
    console.log(this.currentSunPosition);
  }

}
