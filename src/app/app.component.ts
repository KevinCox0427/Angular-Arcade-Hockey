import { Component, HostListener, OnInit } from '@angular/core';
import { timer } from 'rxjs';
import Engine from 'src/engine/Engine';
import Player from 'src/engine/Player';

/**
 * A stateful comopenent containing the game's engine, players, and timer.
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
  // Instantiating the game engine with some settings and two players for testing.
  engine = new Engine({
    totalTime: 3000,
    frictionCoefficient: 0.005,
    rinkDimensions: [2000, 1000],
    movementCoefficient: 0.009,
    maxVelocity: 2.5,
    bounceCoefficient: 1
  }, [
    new Player({
      position: [400, 250],
      mass: 20,
      width: 50
    }),
    new Player({
      position: [800, 500],
      mass: 25,
      width: 60
    })
  ]);
  // The index of the player that is currently being controlled.
  selectedPlayer = 0;
  // A keymap to keep track of what buttons the player has pressed
  keymap = {
    'w': false,
    'a': false,
    's': false,
    'd': false
  }

  /**
   * Starting the game engine's timer.
   */
  ngOnInit() {
    this.frame = 0,
    this.timestamp = Date.now();
    this.gameTimer.subscribe(val => {
      // Keeping track of the frames.
      this.frame = val;
      this.timestamp = Date.now();
      // Updating the engine for one frame.
      this.engine.updateTick(this.selectedPlayer, this.keymap);
    });
  }

  /**
   * Event listener on the body for when a key is pressed down.
   * Updates keymap and applies a force to the player
   */
  @HostListener('document:keydown', ['$event'])
  onKeyDown(ev: KeyboardEvent) {
    // Updating keymap.
    if(ev.key === 'w') this.keymap.w = true;
    if(ev.key === 'a') this.keymap.a = true;
    if(ev.key === 's') this.keymap.s = true;
    if(ev.key === 'd') this.keymap.d = true;
  }
  /**
   * Event listener on the body for when a key has been released.
   * Updates keymap and removes any forces being applied to the player
   */
  @HostListener('document:keyup', ['$event'])
  onKeyUp(ev: KeyboardEvent) {
    if(ev.key === 'w') this.keymap.w = false;
    if(ev.key === 'a') this.keymap.a = false;
    if(ev.key === 's') this.keymap.s = false;
    if(ev.key === 'd') this.keymap.d = false;
  }
}
