import { Component, Input } from '@angular/core';
import Player from 'src/engine/Player';

/**
 * A stateless component to render the player and their position.
 */
@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent {
  // The player class.
  @Input() player: Player;
  // The dimensions of the rink to render its position.
  @Input() rinkDimensions: [number, number];
  // The index of this player in the players array.
  @Input() index: number
  // The index of the player that's currently being controlled.
  @Input() selectedPlayer: number
}
