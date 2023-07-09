import MoveableObject from "./MoveableObject";
import RectangularHitbox from './RectangularHitbox';

class CircularHitbox {
    private width: number;
    private distanceFromCenter: [number, number];

    constructor(width: number, distanceFromCenter: [number, number]) {
        this.width = width;
        this.distanceFromCenter = distanceFromCenter;
    }

    /**
     * A getter function for the width of this hitbox.
     * @returns The width of this hitbox.
     */
    public getWidth(): number {
        return this.width;
    }

    /**
     * A getter function for the distance of the hitbox from the position of the object.
     * @returns A vector representing the distance from the position of the object.
     */
    public getDistanceFromCenter(): [number, number] {
        return this.distanceFromCenter;
    }

    public testCollision(objectA: MoveableObject, objectB: MoveableObject, hitboxB: CircularHitbox | RectangularHitbox): [number, number] | false {
        // If we have two circular hitboxes, just find the distance between the two and compare it to their widths.
        if(!(hitboxB instanceof RectangularHitbox)) {
            // Getting the potentional position of the objects.
            const potentialPosition1 = [
                objectA.getPosition()[0] + (objectA.getVelocity()[0] * (1000/60)),
                objectA.getPosition()[1] + (objectA.getVelocity()[1] * (1000/60))
            ];
            const potentialPosition2 = [
                objectB.getPosition()[0] + (objectB.getVelocity()[0] * (1000/60)),
                objectB.getPosition()[1] + (objectB.getVelocity()[1] * (1000/60))
            ];

            // Triangulating the distance between the two objects.
            const distance = Math.pow(Math.pow(Math.abs(potentialPosition1[0] - potentialPosition2[0]), 2) + Math.pow(Math.abs(potentialPosition1[1] - potentialPosition2[1]), 2), 0.5);

            // If the distance is less than the widths, return the normalized surface angles of the collision.
            if(distance < (this.getWidth() - hitboxB.getWidth()) / 2) {
                // Getting perpendical angle of the tangent line for the point of contact on the opposing circle.
                const normalizedTangentAngle = Math.atan2(
                    (objectA.getPosition()[1] + this.distanceFromCenter[1]) - (objectB.getPosition()[1] + hitboxB.getDistanceFromCenter()[1]),
                    (objectA.getPosition()[0] + this.distanceFromCenter[0]) - (objectB.getPosition()[0] + hitboxB.getDistanceFromCenter()[0])
                );
                // The normalized surface angle with be the same since the tangents are the same for both circles.
                return [normalizedTangentAngle, normalizedTangentAngle];
            }
            // otherwise return false.
            else {
                return false;
            }
        } 

        // Otherwise we have to use the seperating axis theorem.
        else {
            // Projecting the center of the circle on the angle of the first edge
            const projectedCenter1A = (objectA.getPosition()[0] + this.distanceFromCenter[0]) * Math.cos(hitboxB.getRotation() * (Math.PI/180));

            // Projecting the center of the rectangle on the angle of the first edge
            const projectedCenter1B = (objectB.getPosition()[0] + hitboxB.getDistanceFromCenter()[0]) * Math.cos(hitboxB.getRotation() * (Math.PI/180));

            // We can just add / subtract the radius of the circle for the min and max since it's a circle.
            const min1A = projectedCenter1A - (this.getWidth()/2);
            const max1A = projectedCenter1A + (this.getWidth()/2);

            // We can just add / subtract the width for the first edge for the min and max since a rectangle's vertices are always 90 degrees and our rotation is in reference to the x axis.
            const min1B = projectedCenter1B - (hitboxB.getWidth()/2);
            const max1B = projectedCenter1B + (hitboxB.getWidth()/2);

            // Same as before but instead with the second edge.
            const projectedCenter2A = (objectA.getPosition()[0] + this.distanceFromCenter[0]) * Math.sin(Math.PI - (hitboxB.getRotation() * (Math.PI/180)));
            
            const projectedCenter2B = (objectB.getPosition()[0] + hitboxB.getDistanceFromCenter()[0]) * Math.sin(Math.PI - (hitboxB.getRotation() * (Math.PI/180)));
            
            const min2A = projectedCenter2A - (this.getWidth()/2);
            const max2A = projectedCenter2A + (this.getWidth()/2);
            
            const min2B = projectedCenter2B - (hitboxB.getHeight()/2);
            const max2B = projectedCenter2B + (hitboxB.getHeight()/2);
            
            if ((max1A > min1B && min1A < max1B) && (max2A > min2B && min2A < max2B)) {
                // Getting normalized angle of the tangent line for the point of contact on the circle.
                const normalizedTangentAngle = Math.atan2(
                    (objectA.getPosition()[1] + this.distanceFromCenter[1]) - (objectB.getPosition()[1] + hitboxB.getDistanceFromCenter()[1]),
                    (objectA.getPosition()[0] + this.distanceFromCenter[0]) - (objectB.getPosition()[0] + hitboxB.getDistanceFromCenter()[0])
                );

                // If either of the distances between projected overlapping mins and maxes are less than the first object's width, then the first object's point of contact is a vertex.
                if(max1A - min1B < this.width/2 || max2A - min2B < this.width/2) {
                    
                }

                console.log(max1A - min1B, max2A - min2B, this.width/2) 

                return [normalizedTangentAngle, 0];
            }
            else {
                return false;
            }
        }
    }
}

export default CircularHitbox;