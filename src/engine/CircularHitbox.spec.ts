import CircularHitbox from "./CircularHitbox"
import MoveableObject from "./MoveableObject";
import RectangularHitbox from "./RectangularHitbox";

describe("Testing the SAT collision detection between a circle and angled rectangle", () => {
    // A 20x20 circle on at position 5,25.
    const circle1 = new MoveableObject({
        position: [15, 5],
        mass: 20,
        hitboxes: [new CircularHitbox(20, [0,0])]
    });
    // A 20x30 rectangle rotated 30 degrees at position 5,5.
    const angledRectangle1 = new MoveableObject({
        position: [15, 25],
        mass: 20,
        hitboxes: [new RectangularHitbox(20, 20, [0,0], 45)]
    });

    // A collision test for the circle and rectangle 1.
    const collisionResult = circle1.getHitboxes()[0].testCollision(angledRectangle1.getHitboxes()[0], circle1.getPosition(), angledRectangle1.getPosition());

    it("A collision should fire if they're overlapping.", () => {
        expect(Array.isArray(collisionResult)).toEqual(true);
    });

    it("A collision should return a normalized tangent angle for the circle and a normalized tangent angle for the rectangle if they collide on a rectangle's vertex.", () => {
        expect(((collisionResult as [number, number])[0])).toEqual(-Math.PI/2);
        expect(((collisionResult as [number, number])[1])).toEqual(-Math.PI/2);
    });


    // A 20x20 at 5,5
    const circle2 = new MoveableObject({
        position: [15, 5],
        mass: 20,
        hitboxes: [new CircularHitbox(20, [0,0])]
    });
    // A 20x30 rectangle rotated 30 degrees at position 15,15.
    const angledRectangle2 = new MoveableObject({
        position: [25, 15],
        mass: 20,
        hitboxes: [new RectangularHitbox(20, 30, [0,0], -60)]
    });

    // A collision test for the circle and rectangle 1.
    const collisionResult2 = circle2.getHitboxes()[0].testCollision(angledRectangle2.getHitboxes()[0], circle2.getPosition(), angledRectangle2.getPosition());

    it("A collision should return a normalized tangent angle for the circle and a normalized surface angle for the rectangle's edge if they collide on a rectangle's edge.", () => {
        expect(((collisionResult2 as [number, number])[0])).toEqual(Math.PI/4);
        expect(((collisionResult2 as [number, number])[1])).toEqual(Math.PI/6);
    });



    // A 20x30 rectangle rotated 45 degrees at position 45,5
    const angledRectangle3 = new MoveableObject({
        position: [45, 45],
        mass: 20,
        hitboxes: [new RectangularHitbox(20, 30, [0,0], 120)]
    });
    // A collision test for the circle and rectangle 2.
    const collisionResult3 = circle1.getHitboxes()[0].testCollision(angledRectangle3.getHitboxes()[0], circle1.getPosition(), angledRectangle3.getPosition());

    it("A collision shouldn't fire if they're not touching.", () => {
        expect(collisionResult3).toEqual(false);
    });
});