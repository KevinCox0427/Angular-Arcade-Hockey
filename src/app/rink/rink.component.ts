import { Component, Input } from '@angular/core';
import { Player } from '../app.component';

/**
 * A stateless component to render the rink and the timer.
 */
@Component({
  selector: 'app-rink',
  templateUrl: './rink.component.html',
  styleUrls: ['./rink.component.scss']
})
export class RinkComponent {
  @Input() players: Player[];
  @Input() frame: number
  @Input() rinkDimensions: [number, number]
}
