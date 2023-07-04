import { Component, HostListener, Input, OnInit } from '@angular/core';
import Player from 'src/engine/Player';

/**
 * A stateless component to render the rink and the timer.
 */
@Component({
  selector: 'app-rink',
  templateUrl: './rink.component.html',
  styleUrls: ['./rink.component.scss']
})
export class RinkComponent implements OnInit {
  @Input() players: Player[];
  @Input() totalTime: number;
  @Input() frame: number
  @Input() rinkDimensions: [number, number]
  scale: number

  // Resizing to fit screen
  ngOnInit(): void {
    const widthResize = ((window.innerWidth * 0.9) / this.rinkDimensions[0])*100;
    const heightResize = ((window.innerHeight * 0.9) / this.rinkDimensions[1])*100;
    this.scale = widthResize < heightResize ? widthResize : heightResize;
  }

  @HostListener('window:resize', ['$event'])
  onResize(ev: Event) {
    const widthResize = ((window.innerWidth * 0.9) / this.rinkDimensions[0])*100;
    const heightResize = ((window.innerHeight * 0.9) / this.rinkDimensions[1])*100;
    this.scale = widthResize < heightResize ? widthResize : heightResize;
  }
}
