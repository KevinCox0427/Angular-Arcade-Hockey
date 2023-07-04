import Engine from "./Engine";

/**
 * A class representing a moveable object on the rink.
 * This responsible for storing the dimensions and movement vectors to calculate its position every frame.
 */
class MoveableObject {
    // A coordinate in pxs of where the object is on the rink.
    private position: [number, number];
    // The velocity vector of the object at the current frame.
    private velocity: [number, number] = [0,0];
    // The sum force vector of the object at the current frame.
    private force: [number, number] = [0,0];
    // The mass of the object in kgs.
    private mass: number;
    // The px width of the hitbox of the object.
    private width: number;

    /**
     * A constructor to create a moveable object on the rink.
     * @param args The dimensions of the object being added. Includes position: [number, number], mass: number, width: number.
     */
    constructor(args: {
        position: [number, number],
        mass: number,
        width: number
    }) {
        this.position = args.position;
        this.mass = args.mass;
        this.width = args.width;
    }

    /**
     * Getter for the object's position.
     * @returns A [X,Y] coordinate in pixels of the player's position.
     */
    public getPosition() {
        return this.position;
    }

    /**
     * A function representing the physics formula D = V * T. Adds distance based on current object's velocity.
     */
    public updatePosition() {
        this.position = [
            this.position[0] + (this.getVelocity()[0] * (1000/60)),
            this.position[1] + (this.getVelocity()[1] * (1000/60))
        ];
    }

    /**
    * A getter function for the object's velocity.
    * @returns A velocity vector.
    */
    public getVelocity() {
        return this.velocity
    }

    /**
     * A function representing the physics formula V = (F * t) / m. Calculates the new velocity vector based on the Force being applied.
     * @param maxVelocity A cap on the velocity of the object.
     * @param frictionCoefficient The coefficient of friction to apply on the object.
     */
    public updateVelocity(maxVelocity: number, frictionCoefficient: number) {
        // Guard clause to prevent going above max velocity
        if(Math.pow(Math.pow(this.getVelocity()[0], 2) + Math.pow(this.getVelocity()[1], 2), 0.5) > maxVelocity) return;

        // Adding velocity.
        this.velocity[0] += ((this.getForce()[0] * (1000/60))/this.getMass());
        this.velocity[1] += ((this.getForce()[1] * (1000/60))/this.getMass());

        // Applying friction based on the current velocity.
        this.velocity[0] -= (this.getVelocity()[0] * frictionCoefficient);
        this.velocity[1] -= (this.getVelocity()[1] * frictionCoefficient);
    }

    /**
     * A setter function for the velocity.
     * @param velocity A velocity vector to overwrite with.
     */
    public setVelocity(velocity: [number, number]) {
        this.velocity = velocity
    }

    /**
     * A getter function to get the applied forces on this object.
     * @returns A force vector.
     */
    public getForce() {
        return this.force;
    }

    /**
     * A setter function for this object's sum force being applied.
     * @param force A force vector.
     */
    public setForce(force: [number, number]) {
        this.force = force
    }

    /**
     * A getter function for this object's mass.
     * @returns The object's mass in Kgs.
     */
    public getMass() {
        return this.mass;
    }

    /**
     * A getter function for the width of this object's hitbox.
     * @returns The width of the hitbox in pxs.
     */
    public getWidth() {
        return this.width;
    }

    /**
     * A getter function to get the position of each edge of the hitbox.
     * @returns An object with the position of each edge.
     */
    public getHitbox() {
        return  {
            top: this.getPosition()[1] - (this.getWidth()/2),
            bottom: this.getPosition()[1] + (this.getWidth()/2),
            left: this.getPosition()[0] - (this.getWidth()/2),
            right: this.getPosition()[0] + (this.getWidth()/2)
        }
    }
}

export default MoveableObject;