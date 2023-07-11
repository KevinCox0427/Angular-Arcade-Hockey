import CircularHitbox from "./CircularHitbox";

class RectangularHitbox {
    private width: number;
    private height: number;
    private distanceFromCenter;
    private rotation: number;

    constructor(width: number, height: number, distanceFromCenter: [number, number], rotation: number) {
        this.width = width;
        this.height = height;
        this.distanceFromCenter = distanceFromCenter;
        this.rotation = rotation * (Math.PI / 180);
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
    
    public testCollision(hitboxB: CircularHitbox | RectangularHitbox, objectA: [number, number], objectB: [number, number]): [number, number] | false {
        return false;
    }
}

export default RectangularHitbox;