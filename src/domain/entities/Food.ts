export class Food {
    public x: number;
    public y: number;
    public eaten: boolean;

    constructor(x: number, y: number, eaten: boolean = false) {
        this.x = x;
        this.y = y;
        this.eaten = eaten;
    }
}
