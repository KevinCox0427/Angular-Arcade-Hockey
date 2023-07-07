import { Component, HostListener, Input, OnInit } from '@angular/core';
import Player from 'src/engine/Player';
import Puck from 'src/engine/Puck';

/**
 * A stateless component to render the rink and the timer.
 */
@Component({
  selector: 'app-rink',
  templateUrl: './rink.component.html',
  styleUrls: ['./rink.component.scss']
})
export class RinkComponent implements OnInit {
  // Moveable objects representing the players
  @Input() players: Player[];
  // The index of the player currently being controlled.
  @Input() selectedPlayer: number;
  // Moveable object representing the puck.
  @Input() puck: Puck;
  // The total game time.
  @Input() totalTime: number;
  // The current frame being rendered.
  @Input() frame: number
  // The coordinate plane for the rink.
  @Input() rinkDimensions: [number, number]
  scale: number

  // Resizing to fit screen
  ngOnInit(): void {
    const widthResize = ((window.innerWidth * 0.9) / this.rinkDimensions[0])*100;
    const heightResize = ((window.innerHeight * 0.9) / this.rinkDimensions[1])*100;
    this.scale = widthResize < heightResize ? widthResize : heightResize;
  }

  /**
   * Resize event to scale the game to the user's viewport.
   */
  @HostListener('window:resize', ['$event'])
  onResize(_: Event) {
    const widthResize = ((window.innerWidth * 0.9) / this.rinkDimensions[0])*100;
    const heightResize = ((window.innerHeight * 0.9) / this.rinkDimensions[1])*100;
    this.scale = widthResize < heightResize ? widthResize : heightResize;
  }
}
