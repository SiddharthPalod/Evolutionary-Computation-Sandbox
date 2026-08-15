export class Food {
    public x: number;
    public y: number;
    public nutrition: number;
    public eaten: boolean;

    constructor(x: number, y: number, nutrition: number = 35, eaten: boolean = false) {
        this.x = x;
        this.y = y;
        this.nutrition = nutrition;
        this.eaten = eaten;
    }
}
