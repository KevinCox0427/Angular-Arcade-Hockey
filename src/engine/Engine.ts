import Player from "./Player";

/**
 * A class representing the game's engine and state of players.
 */
class Engine {
    // Some values to adjust the game engine.
    private settings: {
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
        frictionCoefficient: number;
        rinkDimensions: [number, number];
        movementCoefficient: number;
        maxVelocity: number;
        bounceCoefficient: number;
    }, players: Player[]) {
        this.settings = settings;
        this.players = players;
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
            if(i === selectedPlayerIndex) player.userInputForce(keymap, this);
            // Then set velocities of the player from the forces being applied to the player.
            player.setVelocity(this);
        });
    
        // Then we'll check if the player is going to collide with anything based on their current movement.
        this.checkCollisions();
    
        // Updating the players' positions.
        this.players.forEach((player, i) => {
            player.setPosition();
        })
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
                potentialPosition[0] < this.players[i].getWidth()/2 ||
                potentialPosition[0] > this.settings.rinkDimensions[0] - this.players[i].getWidth()/2 ||
                potentialPosition[1] < 0 ||
                potentialPosition[1] > this.settings.rinkDimensions[1]
            ) {
                this.players[i].overwriteVelocity(
                    this.calcCollision(
                        {mass: this.players[i].getMass(), velocityInitial: this.players[i].getVelocity()},
                        {mass:100, velocityInitial:[0,0]}
                    )[0]
                );
            }

            // Looping through evrey other player to check for collisions.
            for(let j = 0; j < this.players.length; j++) {
                // If the it's the same player or the collision has already been performed, just ignore.
                if(i === j || collisionsPerformed.some(collision => {return collision.includes(i) || collision.includes(j)})) continue;

                // Getting the hitboxes.
                const playerEdges = {
                    top: this.players[i].getPosition()[1] - (this.players[i].getWidth()/2),
                    bottom: this.players[i].getPosition()[1] + (this.players[i].getWidth()/2),
                    left: this.players[i].getPosition()[0] - (this.players[i].getWidth()/2),
                    right: this.players[i].getPosition()[0] + (this.players[i].getWidth()/2)
                }
                const otherPlayerEdges = {
                    top: this.players[j].getPosition()[1] - (this.players[j].getWidth()/2),
                    bottom: this.players[j].getPosition()[1] + (this.players[j].getWidth()/2),
                    left: this.players[j].getPosition()[0] - (this.players[j].getWidth()/2),
                    right: this.players[j].getPosition()[0] + (this.players[j].getWidth()/2)
                }

                // If the hitboxes overlap, perform the collision.
                if (
                    playerEdges.left < otherPlayerEdges.right &&
                    playerEdges.right > otherPlayerEdges.left &&
                    playerEdges.top < otherPlayerEdges.bottom &&
                    playerEdges.bottom > otherPlayerEdges.top
                ) {
                    // Calling the calc collision function.
                    const collidedVelocities = this.calcCollision(
                        {mass: this.players[i].getMass(), velocityInitial: this.players[i].getVelocity()},
                        {mass: this.players[j].getMass(), velocityInitial: this.players[j].getVelocity()}
                    );
                    
                    // Overwriting each players velocity.
                    this.players[i].overwriteVelocity(collidedVelocities[0]);
                    this.players[j].overwriteVelocity(collidedVelocities[1]);

                    // Adding it to the collisions performed so we don't do it twice.
                    collisionsPerformed.push([i, j]);
                }
            }
        }
    }

    /**
     * Function representing an elastic collision. Formula is a simplified system of equations, with both formulas being u1 + v1 = v2 + u2 and m1u1 + m2u2 = m1v1 + m2v2.
     * @param object1 First object of the collision
     * @param object2 Second object of the collision.
     * @returns An array of velocity vectors. The first index is the first object's new velocity vector, and the second index is the second objects new velocity vector.
     */
    private calcCollision(object1: {
        mass: number,
        velocityInitial:[number, number]
    }, object2: {
        mass: number,
        velocityInitial: [number, number]
    }): [[number, number], [number, number]] {
        // Calculating formula for both X and Y on the first object.
        const finalVelocity1: [number, number] = [
            (((object1.mass - object2.mass) * object1.velocityInitial[0]) + (2 * object2.mass * object2.velocityInitial[0])) / (object1.mass + object2.mass),
            (((object1.mass - object2.mass) * object1.velocityInitial[1]) + (2 * object2.mass * object2.velocityInitial[1])) / (object1.mass + object2.mass)
        ];

        // Calculating formula for both X and Y on the second object.
        const finalVelocity2: [number, number] = [
            (((object2.mass - object1.mass) * object2.velocityInitial[0]) + (2 * object1.mass * object1.velocityInitial[0])) / (object1.mass + object2.mass),
            (((object2.mass - object1.mass) * object2.velocityInitial[1]) + (2 * object1.mass * object1.velocityInitial[1])) / (object1.mass + object2.mass)
        ];

        // Returns the two new velocity vectors.
        return [finalVelocity1, finalVelocity2];
    }
}

export default Engine