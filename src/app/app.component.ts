import { Component, HostListener, OnInit } from '@angular/core';
import { timer } from 'rxjs';

/**
 * Typings for the Player data.
 * Mostly has to do with vlaues to calculate their positioning
 * The position, velocity, acceleration, and force are all vector values. ([+-X, +-Y])
 */
type Player = {
  position: [number, number],
  velocity: [number, number],
  force: [number, number],
  mass: number
  width: number
}
/**
 * Typings for the game settings data.
 * Just some numeric values to adjust the game's physics engine.
 */
type GameSettings = {
  frictionCoefficient: number,
  rinkDimensions: [number, number],
  movementCoefficient: number,
  maxMovement: number,
  bounceCoefficient: number
}
export type { Player, GameSettings }

/**
 * A class representing the entire game's state.
 * This will be the stateful comopenent that controls how all the other stateless componenets render.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // The frame counter that the game is currently on. (60 / 1 second)
  frame: number;
  // The timestamp of the latest frame.
  timestamp: number;
  // The RXJS timer observable to keep in-game time.
  gameTimer = timer(0, 1000/60);
  // Some values to adjust the game engine.
  gameSettings:GameSettings = {
    frictionCoefficient: 0.003,
    rinkDimensions: [1800, 800],
    movementCoefficient: 0.02,
    maxMovement: 0.5,
    bounceCoefficient: 0.6
  };
  // An array of the players.
  // Just loading one for now to test with.
  players: Player[] = [
    {
      position: [500, 200],
      velocity: [0, 0],
      force: [0, 0],
      mass: 20,
      width: 70
    },
    {
      position: [500, 400],
      velocity: [0, 0],
      force: [0, 0],
      mass: 20,
      width: 70
    }
  ];
  // A mutible object to keep track of what keys are being pressed.
  keymap = {
    w: false,
    a: false,
    s: false,
    d: false
  };

  constructor() {}

  /**
   * Starting the game engine's timer.
   */
  ngOnInit() {
    this.frame = 0,
    this.timestamp = Date.now();
    this.gameTimer.subscribe(val => this.updateTick(val));
  }

  /**
   * Event listener on the body for when a key is pressed down.
   * Only updates the keymap.
   */
  @HostListener('document:keydown', ['$event'])
  onKeyDown(ev: KeyboardEvent) {
    if(ev.key === 'w') this.keymap.w = true;
    if(ev.key === 'a') this.keymap.a = true;
    if(ev.key === 's') this.keymap.s = true;
    if(ev.key === 'd') this.keymap.d = true;
  }
  /**
   * Event listener on the body for when a key has been released.
   * Only updates the keymap.
   */
  @HostListener('document:keyup', ['$event'])
  onKeyUp(ev: KeyboardEvent) {
    if(ev.key === 'w') this.keymap.w = false;
    if(ev.key === 'a') this.keymap.a = false;
    if(ev.key === 's') this.keymap.s = false;
    if(ev.key === 'd') this.keymap.d = false;
  }
  
  /**
   * A function to update the game state for one tick (1/60 of a second).
   * This is responsible for the game engine's physics calculations.
   * @param frame The frame that's being added. This is generated by RXJS's timer.
   */
  private updateTick(frame:number) {
    // Keeping track of the frames.
    this.frame = frame;
    this.timestamp = Date.now();
    
    // Looping through each player to calculate their new position.
    this.players = this.players.map((player, i) => {
      // First we'll calculate the forces being applied to the player, and the resulting acceleration and velocity from that.
      player.force = this.calcForce(player.force, i === 0);
      player.velocity = this.calcVelocity(player.force, player.mass);

      // Then we'll check if the player is going to collide with anything based on their current movement.
      // If so, then this will return a player object with an inelastic collision performed.
      player = this.checkCollisions(player);

      // Updating the player's position.
      player.position = this.calcPosition(player.position, player.velocity);

      // Done.
      return player;
    });
  }

  /**
   * A function representing the physics formula D = V * T. Adds distance based on current player's velocity.
   * @param velocity The player's current velocity vector.
   * @returns A distance vector based on a pixel coordinate plane.
   */
  private calcPosition(currentPosition:[number, number], velocity: [number, number]): [number, number] {
    return [
      currentPosition[0] + (velocity[0] * (1000/60)),
      currentPosition[1] + (velocity[1]* (1000/60))
    ];
  }

  /**
   * A function representing the physics formula V = A * T. Calculates the new velocity vector based on the acceleration.
   * @param acceleration The player's current acceleration vector.
   * @returns A velocity vector.
   */
  private calcVelocity(force: [number, number], mass:number): [number, number] {
    return [
      (force[0] / mass) * (1000/60),
      (force[1] / mass) * (1000/60),
    ];
  }

  /**
   * A function that updates the player's Force vector based on user input and friction.
   * @param currentForce The current force vector being applied to the player.
   * @param isControlling Whether the Force should include player inputs.
   * @returns The new Force vector.
   */
  private calcForce(currentForce:[number, number], isControlling: boolean): [number, number] {
    // Adding to the force vector based on user's input.
    if(isControlling) {
      if(this.keymap.w && currentForce[1] > -this.gameSettings.maxMovement) currentForce[1] -= this.gameSettings.movementCoefficient;
      if(this.keymap.a && currentForce[0] > -this.gameSettings.maxMovement) currentForce[0] -= this.gameSettings.movementCoefficient;
      if(this.keymap.s && currentForce[1] < this.gameSettings.maxMovement) currentForce[1] += this.gameSettings.movementCoefficient;
      if(this.keymap.d && currentForce[0] < this.gameSettings.maxMovement) currentForce[0] += this.gameSettings.movementCoefficient;
    }

    // Applying the frictional force to the player. This will be negated and multiplied based on their current Force.
    return [
      currentForce[0] - (this.gameSettings.frictionCoefficient * Math.sign(currentForce[0])),
      currentForce[1] - (this.gameSettings.frictionCoefficient * Math.sign(currentForce[1]))
    ]
  }

  /**
   * A function that will check for collisions based on the current player's movement.
   * If a player does collide with an object or the wall, will perform an inelastic collision calculation (right now it's just negating for testing).
   * @param currentPlayer The player that is being check for collisions.
   * @returns The update player values.
   */
  private checkCollisions(currentPlayer: Player): Player {
    // Calculating the potential position if no collision occured.
    const potentialPosition = this.calcPosition(currentPlayer.position, currentPlayer.velocity);

    // Checking for left and right wall collisions.
    if(
      potentialPosition[0] < currentPlayer.width/2 ||
      potentialPosition[0] > this.gameSettings.rinkDimensions[0] - currentPlayer.width/2
    ) {
      currentPlayer.force[0] *= -1;
    }

    // Checking for top and bottom wall collisions.
    if(
      potentialPosition[1] < 0 ||
      potentialPosition[1] > this.gameSettings.rinkDimensions[1]
    ) {
      currentPlayer.force[1] *= -1;
    }

    // Returning players values.
    return currentPlayer;
  }

  private calcCollision(object1: {}) {

  }
}
