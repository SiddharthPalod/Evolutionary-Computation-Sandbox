import { Organism } from './entities/Organism';
import { Food } from './entities/Food';
import { GenomeMutator } from './services/GenomeMutator';
import { MovementService } from './services/MovementService';

export interface EngineConfig {
    populationSize: number;
    mutationRate: number;
    crossoverRate: number;
    selectionPressure: number;
    speed: number;
    width: number;
    height: number;
}

export interface EngineState {
    organisms: Organism[];
    foods: Food[];
    generation: number;
    simulationFrame: number;
    bestFitness: number;
    averageFitness: number;
}

export class Engine {
    public config: EngineConfig;
    public state: EngineState;

    private readonly GENERATION_LENGTH = 600;

    constructor(initialConfig: Partial<EngineConfig> = {}) {
        this.config = {
            populationSize: 100,
            mutationRate: 0.03,
            crossoverRate: 0.70,
            selectionPressure: 4,
            speed: 5,
            width: 800,
            height: 600,
            ...initialConfig
        };

        this.state = {
            organisms: [],
            foods: [],
            generation: 0,
            simulationFrame: 0,
            bestFitness: 0,
            averageFitness: 0
        };

        this.initialize();
    }

    public updateConfig(newConfig: Partial<EngineConfig>) {
        this.config = { ...this.config, ...newConfig };
    }

    public initialize() {
        this.state.organisms = [];
        this.state.generation = 0;
        this.state.simulationFrame = 0;

        for (let i = 0; i < this.config.populationSize; i++) {
            this.state.organisms.push(this.createOrganism());
        }

        this.generateFood();
        this.updateStats();
    }

    public step() {
        for (let i = 0; i < this.config.speed; i++) {
            for (const organism of this.state.organisms) {
                this.updateOrganism(organism);
            }

            this.state.simulationFrame++;

            if (this.state.simulationFrame >= this.GENERATION_LENGTH) {
                this.evolve();
            }
        }
        this.updateStats();
    }

    private createOrganism(genome: number[] | null = null): Organism {
        return new Organism(
            this.random(20, this.config.width - 20),
            this.random(20, this.config.height - 20),
            this.random(0, Math.PI * 2),
            genome || GenomeMutator.randomGenome()
        );
    }

    private generateFood() {
        this.state.foods = [];
        const amount = Math.max(30, Math.floor(this.config.populationSize * 0.45));

        for (let i = 0; i < amount; i++) {
            this.state.foods.push(new Food(
                this.random(15, this.config.width - 15),
                this.random(15, this.config.height - 15)
            ));
        }
    }

    private updateOrganism(organism: Organism) {
        MovementService.updateOrganism(organism, this.state.foods, this.config.width, this.config.height);
    }

    private selectParent(): Organism {
        let best: Organism | null = null;

        for (let i = 0; i < this.config.selectionPressure; i++) {
            const candidate = this.state.organisms[Math.floor(Math.random() * this.state.organisms.length)];
            if (best === null || candidate.fitness > best.fitness) {
                best = candidate;
            }
        }
        // Fallback in case of empty array somehow
        return best || this.state.organisms[0];
    }

    private evolve() {
        this.state.organisms.sort((a, b) => b.fitness - a.fitness);
        const nextGeneration: Organism[] = [];

        // Elitism: keep best
        const eliteGenome = [...this.state.organisms[0].genome];
        nextGeneration.push(this.createOrganism(eliteGenome));

        // Generate children
        while (nextGeneration.length < this.config.populationSize) {
            const parentA = this.selectParent();
            const parentB = this.selectParent();

            const childGenome = GenomeMutator.crossover(
                parentA.genome,
                parentB.genome,
                this.config.crossoverRate,
                this.config.mutationRate
            );

            nextGeneration.push(this.createOrganism(childGenome));
        }

        this.state.organisms = nextGeneration;
        this.state.generation++;
        this.state.simulationFrame = 0;

        this.generateFood();
        this.updateStats();
    }

    private updateStats() {
        if (this.state.organisms.length === 0) return;

        let best = 0;
        let total = 0;

        for (const organism of this.state.organisms) {
            best = Math.max(best, organism.fitness);
            total += organism.fitness;
        }

        this.state.bestFitness = best;
        this.state.averageFitness = total / this.state.organisms.length;
    }

    private random(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }
}
