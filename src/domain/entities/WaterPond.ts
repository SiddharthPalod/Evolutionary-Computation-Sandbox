export class WaterPond {
    public x: number;
    public y: number;
    public radius: number;

    constructor(x: number, y: number, radius: number = 42) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    public isInside(x: number, y: number): boolean {
        return Math.hypot(this.x - x, this.y - y) <= this.radius;
    }
}
