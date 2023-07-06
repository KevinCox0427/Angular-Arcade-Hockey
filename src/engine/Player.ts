import MoveableObject from "./MoveableObject";

/**
 * An extended Moveable Object class that can take user inputs and apply it as a force.
 */
class Player extends MoveableObject {
    /**
     * A function to look at what keys are being pressed and calculate the sum force vector applied.
     * @param keymap An object representing what keys are currently being pressed.
     * @param movementCoefficient A number representing the magnitude of the force being applied.
     * @returns A force vector that always equals the movementCoefficient.
     */
    public userInputForce(keymap: {[key: string]: boolean}, movementCoefficient: number) {
        // Calculating what force is being applied.
        let forceX = 0;
        let forceY = 0;

        if(keymap["w"] === true) forceY += movementCoefficient;
        if(keymap["a"] === true) forceX -= movementCoefficient;
        if(keymap["s"] === true) forceY -= movementCoefficient;
        if(keymap["d"] === true) forceX += movementCoefficient;

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