import CircularHitbox from "./CircularHitbox";
import MoveableObject from "./MoveableObject";
import Player from "./Player";
import Puck from "./Puck";
import RectangularHitbox from "./RectangularHitbox";

/**
 * A class representing the game's engine and state of players.
 */
class Engine {
    // Some values to adjust the game engine.
    private settings: {
        totalTime: number,
        frictionCoefficient: number;
        rinkDimensions: [number, number];
        movementCoefficient: number;
        maxVelocity: number;
        bounceCoefficient: number;
    }
    // An array of players.
    private players: Player[];
    // The puck on the rink.
    private puck: Puck;

    /**
     * A constructor to intiate the game's engine and state of players.
     * @param settings Some args to adjust the physics of the game.
     * @param players The array of players to keep track of during the game.
     */
    constructor(settings: {
        totalTime: number;
        frictionCoefficient: number;
        rinkDimensions: [number, number];
        movementCoefficient: number;
        maxVelocity: number;
        bounceCoefficient: number;
    }, players: Player[]) {
        this.settings = settings;
        this.players = players;
        // Creating the puck in the center of the rink on construction.
        this.puck = new Puck({
            position: [this.settings.rinkDimensions[0]/2 - 15, this.settings.rinkDimensions[1]/2 - 15],
            mass: 2,
            hitboxes: [new CircularHitbox(30, [0, 0])]
        });
    }

    /**
     * Getter for the game settings object.
     */
    public getSettings() {
        return this.settings
    }
    
    /**
     * Getter for the array of player classes.
     */
    public getPlayers() {
        return this.players
    }

    /**
     * Getter for the puck class.
     */
    public getPuck() {
        return this.puck
    }

    /**
     * A function to update the game state for one frame (1/60 of a second).
     * This is responsible for the game engine's physics calculations.
     * @param selectedPlayerIndex The index of the player currently being controlled.
     * @param keymap An object representing what keys are currently being pressed by the user.
     */
    public updateTick(selectedPlayerIndex: number, keymap: {[key: string]: boolean}) {
        // Getting an array of every moveable object to perform collisions.
        // Don't like the fact that I'm creating a new array every frame, rip memory. Gotta rethink this.
        const totalObjects:MoveableObject[] = [...this.players, this.puck];

        // Updating the object's velocities.
        totalObjects.forEach((object, i) => {
            // First we'll calculate what forces are being applied to the player
            if(object instanceof Player){
                if(i === selectedPlayerIndex) {
                    object.userInputForce(keymap, this.getSettings().movementCoefficient);
                }
                else {
                    object.removeUserInputForce();
                }
            }
            // Then set velocities of the object from the forces being applied to the object.
            object.updateVelocity(this.getSettings().maxVelocity, this.getSettings().frictionCoefficient);
        });
    
        // Then we'll check if the object is going to collide with anything based on their current movement.
        this.checkCollisions(totalObjects);
    
        // Updating the object's positions.
        totalObjects.forEach(object => object.updatePosition());
    }

    /**
     * A function that will check for collisions based on the current object's movement.
     * If a object does collide with an object or the wall, will perform an elastic collision.
     * @param totalObjects An array of every moveable object on the rink.
     */
    private checkCollisions(totalObjects:MoveableObject[]) {
        const collisionsPerformed:[number, number][] = [];

        for(let i = 0; i < totalObjects.length; i++) {
            // Calculating the potential position if no collision occured.
            const potentialPosition = [
                totalObjects[i].getPosition()[0] + (totalObjects[i].getVelocity()[0] * (1000/60)),
                totalObjects[i].getPosition()[1] + (totalObjects[i].getVelocity()[1] * (1000/60))
            ]

            // Checking for left and right wall collisions.
            if (totalObjects[i].getHitboxes().every(hitbox => 
                potentialPosition[0] < (hitbox.getWidth() / 2) ||
                potentialPosition[0] > this.settings.rinkDimensions[0] - (hitbox.getWidth() / 2)
            )) {
                totalObjects[i].setVelocity(
                    this.calcCollision(
                        {mass: totalObjects[i].getMass(), velocityInitial: totalObjects[i].getVelocity(), normalAngle: 0},
                        {mass:100, velocityInitial:[0,0], normalAngle: 0}
                    )[0]
                );
            }

            // Checking for top and bottom wall collisions.
            if(totalObjects[i].getHitboxes().every(hitbox => {
                // If it's a rectanglular hitbox, then it'll have a height
                if(hitbox instanceof RectangularHitbox) return (
                    potentialPosition[1] < (hitbox.getHeight() / 2) ||
                    potentialPosition[1] > this.settings.rinkDimensions[1] - (hitbox.getHeight() / 2)
                );
                // Otherwise it's a circle and we'll just use the diamter
                else return (
                    potentialPosition[1] < (hitbox.getWidth() / 2)
                    || potentialPosition[1] > this.settings.rinkDimensions[1] - (hitbox.getWidth() / 2)
                );
            })) {
                totalObjects[i].setVelocity(
                    this.calcCollision(
                        {mass: totalObjects[i].getMass(), velocityInitial: totalObjects[i].getVelocity(), normalAngle: (Math.PI/2)},
                        {mass:100, velocityInitial:[0,0], normalAngle: (Math.PI/2)}
                    )[0]
                );
            }

            // Looping through every other object to check for collisions.
            for(let j = 0; j < totalObjects.length; j++) {
                // If the it's the same object or the collision has already been performed, just ignore.
                if(i === j || collisionsPerformed.some(collision => {return collision.includes(i) || collision.includes(j)})) continue;

                // If the hitboxes overlap, perform the collision.
                const normalAngles = totalObjects[i].testHitboxes(totalObjects[j]);
                if (normalAngles) {
                    // Calling the calc collision function.
                    const collidedVelocities = this.calcCollision(
                        {mass: totalObjects[i].getMass(), velocityInitial: totalObjects[i].getVelocity(), normalAngle: normalAngles[0]},
                        {mass: totalObjects[j].getMass(), velocityInitial: totalObjects[j].getVelocity(), normalAngle: normalAngles[0]}
                    );
                    
                    // Overwriting each objects velocity.
                    totalObjects[i].setVelocity(collidedVelocities[0]);
                    totalObjects[j].setVelocity(collidedVelocities[1]);

                    // Adding it to the collisions performed so we don't do it twice.
                    collisionsPerformed.push([i, j]);
                }
            }
        }
    }

    /**
     * Function representing a 2-D elastic collision.
     * Formula can be found here: https://en.wikipedia.org/wiki/Elastic_collision#Two-dimensional_collision_with_two_moving_objects.
     * @param object1 First object of the collision. Includes it's velocity, mass, and the perpendicular angle of the opposing surface.
     * @param object2 Second object of the collision. Includes it's velocity, mass, and the perpendicular angle of the opposing surface.
     * @returns An array of velocity vectors. The first index is the object1's new velocity vector, and the second index is the object2's new velocity vector.
     */
    public calcCollision(object1: {
        mass: number,
        velocityInitial:[number, number],
        normalAngle: number
    }, object2: {
        mass: number,
        velocityInitial: [number, number],
        normalAngle: number
    }): [[number, number], [number, number]] {
        // Calculating the angles of the velocities.
        const velocityAngle1 = Math.atan2(object1.velocityInitial[1], object1.velocityInitial[0]);
        const velocityAngle2 = Math.atan2(object2.velocityInitial[1], object2.velocityInitial[0]);

        // Getting the scalar quantities of each velocity vector.
        const scalarVector1 = (object1.velocityInitial[0] / Math.cos(velocityAngle1));
        const scalarVector2 = (object2.velocityInitial[0] / Math.cos(velocityAngle2));

        // Calculating formula for both X and Y on the first object.
        // Can be found here: https://en.wikipedia.org/wiki/Elastic_collision#Two-dimensional_collision_with_two_moving_objects
        // My god is it ugly and it only took me 3 days of vector rotations and reflections to just find the answer on the bottom of a Wikipedia article.
        const finalVelocity1: [number, number] = [
            ((((scalarVector1 * Math.cos(velocityAngle1 - object2.normalAngle) * (object1.mass - object2.mass)) + (2 * object2.mass * scalarVector2 * Math.cos(velocityAngle2 - object2.normalAngle))) / (object1.mass + object2.mass)) * Math.cos(object2.normalAngle)) + (scalarVector1 * Math.sin(velocityAngle1 - object2.normalAngle) * Math.cos(object2.normalAngle + (Math.PI / 2))),

            ((((scalarVector1 * Math.cos(velocityAngle1 - object2.normalAngle) * (object1.mass - object2.mass)) + (2 * object2.mass * scalarVector2 * Math.cos(velocityAngle2 - object2.normalAngle))) / (object1.mass + object2.mass)) * Math.sin(object2.normalAngle)) + ((object1.velocityInitial[0]/Math.cos(velocityAngle1)) * Math.sin(velocityAngle1 - object2.normalAngle) * Math.sin(object2.normalAngle + (Math.PI / 2)))
        ];
        
        // Calculating formula for both X and Y on the second object. Same as above just swapping the velocities masses, and normal surface angles.
        const finalVelocity2: [number, number] = [
            ((((scalarVector2 * Math.cos(velocityAngle2 - object1.normalAngle) * (object2.mass - object1.mass)) + (2 * object1.mass * scalarVector1 * Math.cos(velocityAngle1 - object1.normalAngle))) / (object2.mass + object1.mass)) * Math.cos(object1.normalAngle)) + (scalarVector2 * Math.sin(velocityAngle2 - object1.normalAngle) * Math.cos(object1.normalAngle + (Math.PI / 2))),

            ((((scalarVector2 * Math.cos(velocityAngle2 - object1.normalAngle) * (object2.mass - object1.mass)) + (2 * object1.mass * scalarVector1 * Math.cos(velocityAngle1 - object1.normalAngle))) / (object2.mass + object1.mass)) * Math.sin(object1.normalAngle)) + ((object2.velocityInitial[0]/Math.cos(velocityAngle2)) * Math.sin(velocityAngle2 - object1.normalAngle) * Math.sin(object1.normalAngle + (Math.PI / 2)))
        ];

        // Returns the two new velocity vectors.
        return [
            finalVelocity1,
            finalVelocity2
        ];
    }
}

export default Engine