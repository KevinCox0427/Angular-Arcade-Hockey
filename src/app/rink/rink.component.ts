import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { GameSettings, Player } from '../app.component';

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
