export const GENOME_SIZE = 16;

export class Organism {
    public fitness: number = 0;
    public energy: number = 100;
    public maxEnergy: number = 100;
    public hydration: number = 100;
    public maxHydration: number = 100;
    public age: number = 0;
    public fruitsEaten: number = 0;
    public waterDrinks: number = 0;
    public generation: number = 1;
    public x: number;
    public y: number;
    public angle: number;
    public genome: number[];

    // Swarm pheromone emission state
    public pheromoneCooldown: number = 0;
    public matingCooldown: number = 0;

    constructor(
        x: number,
        y: number,
        angle: number,
        genome: number[],
        energy: number = 100,
        generation: number = 1,
        hydration: number = 100
    ) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.genome = genome;
        this.energy = energy;
        this.generation = generation;
        this.hydration = hydration;
    }

    public isStarved(): boolean {
        return this.energy <= 0 || this.hydration <= 0;
    }

    public canReproduce(reproductionThreshold: number = 75): boolean {
        return this.energy >= reproductionThreshold && this.hydration >= reproductionThreshold && this.age > 30;
    }

    public eatFruit(nutrition: number): void {
        this.energy = Math.min(this.maxEnergy, this.energy + nutrition);
        this.fruitsEaten++;
        this.fitness++;
        this.pheromoneCooldown = 40; // Emit food discovery pheromones for the next 40 ticks!
    }

    public drinkWater(hydrationAmount: number = 2.5): void {
        this.hydration = Math.min(this.maxHydration, this.hydration + hydrationAmount);
        this.waterDrinks++;
    }
}
