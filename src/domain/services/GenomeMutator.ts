import { GENOME_SIZE } from "../entities/Organism";

export class GenomeMutator {
    public static randomGenome(): number[] {
        const genome: number[] = [];
        for (let i = 0; i < GENOME_SIZE; i++) {
            genome.push(this.random(-1, 1));
        }
        return genome;
    }

    public static crossover(parentA: number[], parentB: number[], crossoverRate: number, mutationRate: number): number[] {
        const genome: number[] = [];

        for (let i = 0; i < GENOME_SIZE; i++) {
            let gene: number;

            if (Math.random() < crossoverRate) {
                gene = Math.random() < 0.5 ? parentA[i] : parentB[i];
            } else {
                gene = parentA[i];
            }

            // Mutation
            if (Math.random() < mutationRate) {
                gene = this.random(-1, 1);
            }

            genome.push(gene);
        }

        return genome;
    }

    private static random(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }
}
