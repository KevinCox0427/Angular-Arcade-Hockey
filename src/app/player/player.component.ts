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
  @Input() player: Player;
  @Input() rinkDimensions: [number, number];
}
