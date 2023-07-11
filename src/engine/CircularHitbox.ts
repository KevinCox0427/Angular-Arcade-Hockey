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
        // Getting the potentional position and the magnitude of that position for the first object.
        potentialPosition1 = [
            potentialPosition1[0] + this.getDistanceFromCenter()[0],
            potentialPosition1[1] + this.getDistanceFromCenter()[1]
        ];
        // Getting the potentional position and the magnitude of that position for the second object.
        potentialPosition2 = [
            potentialPosition2[0] + hitbox2.getDistanceFromCenter()[0],
            potentialPosition2[1] + hitbox2.getDistanceFromCenter()[1]
        ];

        // If we have two circular hitboxes, just find the distance between the two and compare it to their widths.
        if(!(hitbox2 instanceof RectangularHitbox)) {
             // Triangulating the distance between the two objects.
             const distance = Math.sqrt(Math.pow(potentialPosition1[0] - potentialPosition2[0], 2) + Math.pow(potentialPosition1[1] - potentialPosition2[1], 2));

            // If the distance between the two is greater than their widths, then they're not colliding.
            if(distance >= (this.getWidth() + hitbox2.getWidth()) / 2) {
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
        
        // Projecting the center of the circle on the angle of the first edge of the rectangle.
        const projectedCenter1A = this.projectVector(potentialPosition1, hitbox2.getRotation());
        // Projecting the center of the rectangle on the angle of the first edge of the rectangle.
        const projectedCenter1B = this.projectVector(potentialPosition2, hitbox2.getRotation());

        // We can just add / subtract the radius of the circle for the min and max since it's a circle.
        const min1A = projectedCenter1A - (this.getWidth()/2);
        const max1A = projectedCenter1A + (this.getWidth()/2);

        // We can just add / subtract the width for the first edge for the min and max since a rectangle's vertices are always 90 degrees and our rotation is in reference to the x axis.
        const min1B = projectedCenter1B - (hitbox2.getWidth()/2);
        const max1B = projectedCenter1B + (hitbox2.getWidth()/2);

        // Same as before but instead with the second edge of the rectangle.
        const projectedCenter2A = this.projectVector(potentialPosition1, hitbox2.getRotation() + Math.PI/2);
        const projectedCenter2B = this.projectVector(potentialPosition2, hitbox2.getRotation() + Math.PI/2);
        
        const min2A = projectedCenter2A - (this.getWidth()/2);
        const max2A = projectedCenter2A + (this.getWidth()/2);
        
        // This time we use height for the second edge.
        const min2B = projectedCenter2B - (hitbox2.getHeight()/2);
        const max2B = projectedCenter2B + (hitbox2.getHeight()/2);
        
        // If there's overlap on both project angles, then it's a collsion.
        // Then we'll calculate for the contact point.
        const parallelProjectionDifference = max1A - min1B < max1B - min1A
            ? max1A - min1B
            : max1B - min1A;
        const perpendicularProjectionDifference = max2A - min2B < max2B - min2A
            ? max2A - min2B
            : max2B - min2A;

        console.log(projectedCenter1A, projectedCenter1B, parallelProjectionDifference)

        // Gaurd clause if no collision was detected.
        if(parallelProjectionDifference <= 0 || perpendicularProjectionDifference <= 0) {
            return false;
        }

        // Getting normalized angle of the tangent line for the point of contact on the circle.
        const normalizedTangentAngle = Math.atan2(
            potentialPosition1[1] - potentialPosition2[1],
            potentialPosition1[0] - potentialPosition2[0]
        );

        // If both of the distances between projected overlapping mins and maxes are greater than the circle's width, then the circle's point of contact is one of the rectangle's edges.
        if(parallelProjectionDifference > this.getWidth() / 2 && perpendicularProjectionDifference > this.getWidth() / 2) {
            return [
                normalizedTangentAngle,
                parallelProjectionDifference < perpendicularProjectionDifference
                    ? hitbox2.getRotation()
                    : hitbox2.getRotation() + Math.PI/2
            ];
        }

        // Otherwse it's made contact with a vertex, and return the nomralized tangent angle of that vertex.

        // Getting the position of the collided vertex centered on the XY plane.
        let vertexPosition = [
            (hitbox2.getWidth()/2) * (max1A - min1B < max1B - min1A ? -1 : 1),
            (hitbox2.getHeight()/2) * (max2A - min2B < max2B - min2A ? -1 : 1)
        ];

        // Rotating the vertex based on the how much the hitbox is rotated.
        vertexPosition = [
            (vertexPosition[0] * Math.cos(hitbox2.getRotation())) - (vertexPosition[0] * Math.sin(hitbox2.getRotation())),
            (vertexPosition[1] * Math.sin(hitbox2.getRotation())) + (vertexPosition[1] * Math.cos(hitbox2.getRotation())),
        ];
        
        // Translating the vertex to the position it should be.
        vertexPosition = [
            vertexPosition[0] + potentialPosition2[0],
            vertexPosition[1] + potentialPosition2[1],
        ];
        
        // Getting the normalized tangent at that point.
        const vertexNormalizedTangentAngle = Math.atan2(
            potentialPosition1[1] - vertexPosition[1],
            potentialPosition1[0] - vertexPosition[0]
        );

        return [normalizedTangentAngle, vertexNormalizedTangentAngle];
    }

    private projectVector(point: [number, number], angle: number): number {
        // Arbitrary vector based on the angle provided.
        const projectionVector = [
            Math.cos(angle) * 10000,
            Math.sin(angle) * 10000
        ];

        // Projecting the point onto the arbitrary vector.
        return (point[0] * projectionVector[0]) + (point[1] * projectionVector[1]) / Math.sqrt(projectionVector[0] * projectionVector[0]) + (point[1] * projectionVector[1])
    }
}

export default CircularHitbox;