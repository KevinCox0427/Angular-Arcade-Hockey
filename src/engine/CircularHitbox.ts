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

    public testCollision(hitbox2: CircularHitbox | RectangularHitbox, potentialPosition1: [number, number], potentialPosition2: [number, number]): [number, number] | false {
        // Getting the potentional position of the objects.
        potentialPosition1 = [
            potentialPosition1[0] + this.getDistanceFromCenter()[0],
            potentialPosition1[1] + this.getDistanceFromCenter()[1]
        ];
        potentialPosition2 = [
            potentialPosition2[0] + hitbox2.getDistanceFromCenter()[0],
            potentialPosition2[1] + hitbox2.getDistanceFromCenter()[1]
        ];

        // If we have two circular hitboxes, just find the distance between the two and compare it to their widths.
        if(!(hitbox2 instanceof RectangularHitbox)) {
            // Triangulating the distance between the two objects.
            const distance = Math.pow(Math.pow(Math.abs(potentialPosition1[0] - potentialPosition2[0]), 2) + Math.pow(Math.abs(potentialPosition1[1] - potentialPosition2[1]), 2), 0.5);

            // If the distance between the two is greater than their widths, then they're not colliding.
            if(distance >= (this.getWidth() - hitbox2.getWidth()) / 2) {
                return false;
            }
            
            // Getting perpendical angle of the tangent line for the point of contact on the opposing circle.
            const normalizedTangentAngle = Math.atan2(
                potentialPosition1[1] - potentialPosition2[1],
                potentialPosition1[0] - potentialPosition2[0]
            );

            // The normalized surface angle with be the same since the tangents are the same for both circles.
            return [normalizedTangentAngle, normalizedTangentAngle];
        } 

        // Otherwise we have to use the seperating axis theorem.
        else {
            // Projecting the center of the circle on the angle of the first edge of the rectangle.
            const projectedCenter1A = potentialPosition1[0] * Math.cos(hitbox2.getRotation() * (Math.PI/180));
            // Projecting the center of the rectangle on the angle of the first edge of the rectangle.
            const projectedCenter1B = potentialPosition2[0] * Math.cos(hitbox2.getRotation() * (Math.PI/180));

            // We can just add / subtract the radius of the circle for the min and max since it's a circle.
            const min1A = projectedCenter1A - (this.getWidth()/2);
            const max1A = projectedCenter1A + (this.getWidth()/2);

            // We can just add / subtract the width for the first edge for the min and max since a rectangle's vertices are always 90 degrees and our rotation is in reference to the x axis.
            const min1B = projectedCenter1B - (hitbox2.getWidth()/2);
            const max1B = projectedCenter1B + (hitbox2.getWidth()/2);

            // Same as before but instead with the second edge of the rectangle.
            const projectedCenter2A = potentialPosition1[0] * Math.sin(Math.PI - (hitbox2.getRotation() * (Math.PI/180)));
            const projectedCenter2B = potentialPosition2[0] * Math.sin(Math.PI - (hitbox2.getRotation() * (Math.PI/180)));
            
            const min2A = projectedCenter2A - (this.getWidth()/2);
            const max2A = projectedCenter2A + (this.getWidth()/2);
            
            // This time we use height for the second edge.
            const min2B = projectedCenter2B - (hitbox2.getHeight()/2);
            const max2B = projectedCenter2B + (hitbox2.getHeight()/2);
            
            // If there's overlap on both project angles, then it's a collsion.
            // Now we'll calculate for the contact point.
            const parallelProjectionDifference = max1A - min1B < max1B - min1A
                ? max1A - min1B
                : max1B - min1A;
            const perpendicularProjectionDifference = max2A - min2B < max2B - min2A
                ? max2A - min2B
                : max2B - min2A;
            const total1 = max1B - min1A > max1A - min1B ? max1B - min1A : max1A - min1B;
            const total2 = max2B - min2A > max2A - min2B ? max2B - min2A : max2A - min2B;

            if (parallelProjectionDifference > 0 && perpendicularProjectionDifference > 0) {
                // Getting normalized angle of the tangent line for the point of contact on the circle.
                const normalizedTangentAngle = Math.atan2(
                    potentialPosition1[1] - potentialPosition2[1],
                    potentialPosition1[0] - potentialPosition2[0]
                );

                console.log(parallelProjectionDifference, total1, perpendicularProjectionDifference, total2)

                // If both of the distances between projected overlapping mins and maxes are less than the circle's width, then the circle's point of contact is one of the rectangle's vertices.
                if(parallelProjectionDifference < this.width / 2 && perpendicularProjectionDifference < this.width / 2) {
                    // Getting the position of the collided vertex.
                    const vertexPosition = [
                        potentialPosition2[0] + (hitbox2.getWidth() * max1A - min1B < max1B - min1A ? -1 : 1),
                        potentialPosition2[1] + (hitbox2.getHeight() * max2A - min2B < max2B - min2A ? -1 : 1)
                    ]
                    
                    // Getting the normalized tangent at that point.
                    const vertexNormalizedTangentAngle = Math.atan2(
                        potentialPosition1[1] - vertexPosition[1],
                        potentialPosition1[0] - vertexPosition[0]
                    );

                    console.log(vertexNormalizedTangentAngle * (180/Math.PI))

                    return [normalizedTangentAngle, vertexNormalizedTangentAngle];
                }

                // Otherwise it's made contact with the edge, and return the edge that has the largest projected distance.
                return [
                    normalizedTangentAngle,
                    parallelProjectionDifference < perpendicularProjectionDifference
                        ? (hitbox2.getRotation()) * (Math.PI / 180)
                        : (hitbox2.getRotation() + 90) * (Math.PI / 180)
                ];
            }
            else {
                return false;
            }
        }
    }
}

export default CircularHitbox;