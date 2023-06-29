import { Component, HostListener, OnInit } from '@angular/core';
import { timer } from 'rxjs';

type Player = {
  position: [number, number],
  velocity: [number, number],
  acceleration: [number, number],
  force: [number, number],
  mass: number
  width: number
}
type GameSettings = {
  frictionCoefficient: number,
  rinkDimensions: [number, number],
  movementCoefficient: number,
  maxMovement: number,
  bounceCoefficient: number
}
export type { Player, GameSettings }

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  frame: number;
  timestamp: number;
  gameTimer = timer(0, 1000/60);
  gameSettings:GameSettings = {
    frictionCoefficient: 0.003,
    rinkDimensions: [1800, 800],
    movementCoefficient: 0.01,
    maxMovement: 0.5,
    bounceCoefficient: 0.6
  };
  players: Player[];
  keymap = {
    w: false,
    a: false,
    s: false,
    d: false
  };

  constructor() {}

  ngOnInit() {
    this.frame = 0,
    this.timestamp = Date.now();
    this.players = [
      {
        position: [500, 200],
        velocity: [0, 0],
        acceleration: [0, 0],
        force: [0, 0],
        mass: 20,
        width: 70
      }
    ]
    this.gameTimer.subscribe(val => this.updateTick(val));
  }
  
  private updateTick(time:number) {
    this.frame = time;
    this.timestamp = Date.now();
    this.players = this.players.map(player => {
      if(this.keymap.w && player.force[1] > -this.gameSettings.maxMovement) player.force[1] -= this.gameSettings.movementCoefficient;
      if(this.keymap.a && player.force[0] > -this.gameSettings.maxMovement) player.force[0] -= this.gameSettings.movementCoefficient;
      if(this.keymap.s && player.force[1] < this.gameSettings.maxMovement) player.force[1] += this.gameSettings.movementCoefficient;
      if(this.keymap.d && player.force[0] < this.gameSettings.maxMovement) player.force[0] += this.gameSettings.movementCoefficient;

      const fricitonX = (this.gameSettings.frictionCoefficient * Math.sign(player.force[0]));
      const fricitonY = (this.gameSettings.frictionCoefficient * Math.sign(player.force[1]));

      if(
        player.position[0] + this.calcDistance(player.velocity[0]) < player.width/2 ||
        player.position[0] + this.calcDistance(player.velocity[0]) > this.gameSettings.rinkDimensions[0] - player.width/2
      ) {
        player.velocity[0] *= -this.gameSettings.bounceCoefficient;
        player.acceleration[0] *= -this.gameSettings.bounceCoefficient;
        player.force[0] *= -this.gameSettings.bounceCoefficient;
      }

      if(
        player.position[1] + this.calcDistance(player.velocity[1]) < 0 ||
        player.position[1] + this.calcDistance(player.velocity[1]) > this.gameSettings.rinkDimensions[1]
      ) {
        player.velocity[1] *= -this.gameSettings.bounceCoefficient;
        player.acceleration[1] *= -this.gameSettings.bounceCoefficient;
        player.force[1] *= -this.gameSettings.bounceCoefficient;
      }

      return {...player,
        position: [
          player.position[0] + this.calcDistance(player.velocity[0]),
          player.position[1] + this.calcDistance(player.velocity[1])
        ],
        velocity: [
          this.calcVelocity(player.acceleration[0]),
          this.calcVelocity(player.acceleration[1])
        ],
        acceleration: [
          this.calcAcceleration(player.force[0], player.mass),
          this.calcAcceleration(player.force[1], player.mass),
        ],
        force: [
          Math.abs(player.force[0]) - fricitonX < 0 ? 0 : player.force[0] - fricitonX,
          Math.abs(player.force[1]) - fricitonY < 0 ? 0 : player.force[1] - fricitonY
        ]
      }
    });
  }

  private calcDistance(velocity: number): number {
    return velocity * (1000/60);
  }
  private calcVelocity(acceleration: number): number {
    return acceleration * (1000/60);
  }
  private calcAcceleration(force:number, mass: number): number {
    return force / mass;
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(ev: KeyboardEvent) {
    if(ev.key === 'w') this.keymap.w = true;
    if(ev.key === 'a') this.keymap.a = true;
    if(ev.key === 's') this.keymap.s = true;
    if(ev.key === 'd') this.keymap.d = true;
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(ev: KeyboardEvent) {
    if(ev.key === 'w') this.keymap.w = false;
    if(ev.key === 'a') this.keymap.a = false;
    if(ev.key === 's') this.keymap.s = false;
    if(ev.key === 'd') this.keymap.d = false;
  }
}
