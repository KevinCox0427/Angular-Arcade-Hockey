import Engine from "./Engine";
import MoveableObject from "./MoveableObject";

/**
 * An extended Moveable Object that can take user inputs and apply it as a force.
 */
class Player extends MoveableObject {
    /**
     * A function to look at what keys are being pressed and calculate what force vector. should be applied.
     * @returns A force vector that always equals the movementCoefficient.
     */
    public userInputForce(keymap: {[key: string]: boolean}, engine:Engine) {
        // Calculating what force is being applied.
        let forceX = 0;
        let forceY = 0;

        if(keymap["w"] === true) forceY -= engine.getSettings().movementCoefficient;
        if(keymap["a"] === true) forceX -= engine.getSettings().movementCoefficient;
        if(keymap["s"] === true) forceY += engine.getSettings().movementCoefficient;
        if(keymap["d"] === true) forceX += engine.getSettings().movementCoefficient;

        // If the player is going in a diagonal direction, we'll have to triangulate the force. 
        if(forceX !== 0 && forceY !== 0) {
            forceX *= Math.cos(45);
            forceY *= Math.sin(45);
        }

        // Updating the controlled player
        this.setForce([forceX, forceY]);
    }
}

export default Player;