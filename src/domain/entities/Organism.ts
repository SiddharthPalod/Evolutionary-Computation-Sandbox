export const GENOME_SIZE = 16;

export class Organism {
    public fitness: number = 0;
    public energy: number = 0;
    public age: number = 0;
    public x: number;
    public y: number;
    public angle: number;
    public genome: number[];

    constructor(x: number, y: number, angle: number, genome: number[]) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.genome = genome;
    }
}
