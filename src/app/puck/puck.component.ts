import { Component, Input } from '@angular/core';
import Puck from 'src/engine/Puck';

/**
 * A stateless component to render the puck and its position.
 */
@Component({
  selector: 'app-puck',
  templateUrl: './puck.component.html',
  styleUrls: ['./puck.component.scss']
})
export class PuckComponent {
  // The puck class
  @Input() puck: Puck;
  // The dimensions of the rink to render its position.
  @Input() rinkDimensions: [number, number]
}
