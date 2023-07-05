import Player from "./Player";

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

        console.log(JSON.stringify(this.calcCollision(
            {mass: 10000, velocityInitial: [0,0], surfaceAngle: 90},
            {mass: 10, velocityInitial: [1, 0], surfaceAngle: 0}
        )))
    }

    /**
     * Getter for the game settings object.
     */
    public getSettings() {
        return this.settings
    }
    
    /**
     * Getter for the array of players.
     */
    public getPlayers() {
        return this.players
    }

    /**
     * A function to update the game state for one frame (1/60 of a second).
     * This is responsible for the game engine's physics calculations.
     * @param selectedPlayerIndex The index of the player currently being controlled.
     * @param keymap An object representing what keys are currently being pressed by the user.
     */
    public updateTick(selectedPlayerIndex: number, keymap: {[key: string]: boolean}) {
        // Updating the players' velocities.
        this.players.forEach((player, i) => {
            // First we'll calculate what forces are being applied to the player
            if(i === selectedPlayerIndex) player.userInputForce(keymap, this.getSettings().movementCoefficient);
            // Then set velocities of the player from the forces being applied to the player.
            player.updateVelocity(this.getSettings().maxVelocity, this.getSettings().frictionCoefficient);
        });
    
        // Then we'll check if the player is going to collide with anything based on their current movement.
        this.checkCollisions();
    
        // Updating the players' positions.
        this.players.forEach(player => player.updatePosition());
    }

    /**
     * A function that will check for collisions based on the current player's movement.
     * If a player does collide with an object or the wall, will perform an elastic collision.
     */
    private checkCollisions() {
        const collisionsPerformed:[number, number][] = [];

        for(let i = 0; i < this.players.length; i++) {
            // Calculating the potential position if no collision occured.
            const potentialPosition = [
                this.players[i].getPosition()[0] + (this.players[i].getVelocity()[0] * (1000/60)),
                this.players[i].getPosition()[1] + (this.players[i].getVelocity()[1]* (1000/60))
            ]

            // Checking for left and right wall collisions.
            if (
                potentialPosition[0] < this.players[i].getWidth() / 2 ||
                potentialPosition[0] > this.settings.rinkDimensions[0] - this.players[i].getWidth() / 2
            ) {
                this.players[i].setVelocity(
                    this.calcCollision(
                        {mass: this.players[i].getMass(), velocityInitial: this.players[i].getVelocity(), surfaceAngle: 90},
                        {mass:100, velocityInitial:[0,0], surfaceAngle: 90}
                    )[0]
                );
            }

            // Checking for top and bottom wall collisions.
            if(
                potentialPosition[1] < 0 ||
                potentialPosition[1] > this.settings.rinkDimensions[1]
            ) {
                this.players[i].setVelocity(
                    this.calcCollision(
                        {mass: this.players[i].getMass(), velocityInitial: this.players[i].getVelocity(), surfaceAngle: 0},
                        {mass:100, velocityInitial:[0,0], surfaceAngle: 0}
                    )[0]
                );
            }

            // Looping through every other player to check for collisions.
            for(let j = 0; j < this.players.length; j++) {
                // If the it's the same player or the collision has already been performed, just ignore.
                if(i === j || collisionsPerformed.some(collision => {return collision.includes(i) || collision.includes(j)})) continue;

                // Getting the potentional position of the other player.
                const potentialPosition2 = [
                    this.players[j].getPosition()[0] + (this.players[j].getVelocity()[0] * (1000/60)),
                    this.players[j].getPosition()[1] + (this.players[j].getVelocity()[1] * (1000/60))
                ]

                // Triangulating the distance between the two players.
                const distance = Math.pow(Math.pow(Math.abs(potentialPosition[0] - potentialPosition2[0]), 2) + Math.pow(Math.abs(potentialPosition[1] - potentialPosition2[1]), 2), 0.5);

                // If the hitboxes overlap, perform the collision.
                if (distance < (this.players[i].getWidth() + this.players[j].getWidth()) / 2) {
                    // Getting angle of the tangent line for the point of contact.
                    const surfaceAngle = Math.atan2(this.players[i].getPosition()[1] - this.players[j].getPosition()[1], this.players[i].getPosition()[0] - this.players[j].getPosition()[0]) + (90 * (Math.PI/180));

                    // Calling the calc collision function.
                    const collidedVelocities = this.calcCollision(
                        {mass: this.players[i].getMass(), velocityInitial: this.players[i].getVelocity(), surfaceAngle:surfaceAngle},
                        {mass: this.players[j].getMass(), velocityInitial: this.players[j].getVelocity(), surfaceAngle:surfaceAngle}
                    );
                    
                    // Overwriting each players velocity.
                    this.players[i].setVelocity(collidedVelocities[0]);
                    this.players[j].setVelocity(collidedVelocities[1]);

                    // Adding it to the collisions performed so we don't do it twice.
                    collisionsPerformed.push([i, j]);
                }
            }
        }
    }

    /**
     * Function representing a 2-D elastic collision.
     * Formula can be found here: https://en.wikipedia.org/wiki/Elastic_collision#Two-dimensional_collision_with_two_moving_objects.
     * @param object1 First object of the collision
     * @param object2 Second object of the collision.
     * @returns An array of velocity vectors. The first index is the object1's new velocity vector, and the second index is the object2's new velocity vector.
     */
    public calcCollision(object1: {
        mass: number,
        velocityInitial:[number, number],
        surfaceAngle: number
    }, object2: {
        mass: number,
        velocityInitial: [number, number],
        surfaceAngle: number
    }): [[number, number], [number, number]] {
        // Calculating the angles of the velocities.
        const velocityAngle1 = Math.atan2(object1.velocityInitial[1], object1.velocityInitial[0]);
        const velocityAngle2 = Math.atan2(object1.velocityInitial[1], object1.velocityInitial[0]);

        const scalarVector1 = (object1.velocityInitial[0] / Math.cos(velocityAngle1));
        const scalarVector2 = (object2.velocityInitial[0] / Math.cos(velocityAngle2));

        // Converting degrees to radians.
        object1.surfaceAngle *= (Math.PI/180);
        object2.surfaceAngle *= (Math.PI/180);

        // Calculating formula for both X and Y on the first object.
        // Can be found here: https://en.wikipedia.org/wiki/Elastic_collision#Two-dimensional_collision_with_two_moving_objects
        // My god is it ugly and it only took me 3 days of completely failing vector rotations to just find the answer on the bottom of a Wikipedia article. 
        const finalVelocity1: [number, number] = [
            ((((scalarVector1 * Math.cos(velocityAngle1 - object2.surfaceAngle) * (object1.mass - object2.mass)) + (2 * object2.mass * scalarVector2 * Math.cos(velocityAngle2 - object2.surfaceAngle))) / (object1.mass + object2.mass)) * Math.cos(object2.surfaceAngle)) + (scalarVector1 * Math.sin(velocityAngle1 - object2.surfaceAngle) * Math.cos(object2.surfaceAngle + (Math.PI / 2))),

            ((((scalarVector1 * Math.cos(velocityAngle1 - object2.surfaceAngle) * (object1.mass - object2.mass)) + (2 * object2.mass * scalarVector2 * Math.cos(velocityAngle2 - object2.surfaceAngle))) / (object1.mass + object2.mass)) * Math.sin(object2.surfaceAngle)) + ((object1.velocityInitial[0]/Math.cos(velocityAngle1)) * Math.sin(velocityAngle1 - object2.surfaceAngle) * Math.sin(object2.surfaceAngle + (Math.PI / 2)))
        ];
        
        // Calculating formula for both X and Y on the second object. Same as above just swapping the velocities and masses.
        const finalVelocity2: [number, number] = [
            ((((scalarVector2 * Math.cos(velocityAngle2 - object1.surfaceAngle) * (object2.mass - object1.mass)) + (2 * object1.mass * scalarVector1 * Math.cos(velocityAngle1 - object1.surfaceAngle))) / (object2.mass + object1.mass)) * Math.cos(object1.surfaceAngle)) + (scalarVector2 * Math.sin(velocityAngle2 - object1.surfaceAngle) * Math.cos(object1.surfaceAngle + (Math.PI / 2))),

            ((((scalarVector2 * Math.cos(velocityAngle2 - object1.surfaceAngle) * (object2.mass - object1.mass)) + (2 * object1.mass * scalarVector1 * Math.cos(velocityAngle1 - object1.surfaceAngle))) / (object2.mass + object1.mass)) * Math.sin(object1.surfaceAngle)) + ((object2.velocityInitial[0]/Math.cos(velocityAngle2)) * Math.sin(velocityAngle2 - object1.surfaceAngle) * Math.sin(object1.surfaceAngle + (Math.PI / 2)))
        ];

        // Returns the two new velocity vectors.
        return [
            finalVelocity1,
            finalVelocity2
        ];
    }
}

export default Engine