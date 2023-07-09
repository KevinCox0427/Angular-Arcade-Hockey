import CircularHitbox from "./CircularHitbox";
import MoveableObject from "./MoveableObject";

class RectangularHitbox {
    private width: number;
    private height: number;
    private distanceFromCenter;
    private rotation: number;

    constructor(width: number, height: number, distanceFromCenter: [number, number], rotation: number) {
        this.width = width;
        this.height = height;
        this.distanceFromCenter = distanceFromCenter;
        this.rotation = rotation;
    }

    /**
     * A getter function for the width of this hitbox.
     * @returns The width of this hitbox.
     */
    public getWidth(): number {
        return this.width;
    }

    /**
     * A getter function for the height of the hitbox.
     * @returns The height of the hitbox.
     */
    public getHeight(): number {
        return this.height;
    }

    /**
     * A getter function for the distance of the hitbox from the position of the object.
     * @returns A vector representing the distance from the position of the object.
     */
    public getDistanceFromCenter(): [number, number] {
        return this.distanceFromCenter;
    }

    /**
     * A getter function for the rotation of the hitbox.
     * @returns How much the hitbox has been rotated.
     */
    public getRotation(): number {
        return this.rotation;
    }
    
    public testCollision(objectA: MoveableObject, objectB: MoveableObject, hitboxB: CircularHitbox | RectangularHitbox) {
        return false;
    }
}

export default RectangularHitbox;