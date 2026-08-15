import { Organism } from './entities/Organism';
import { Food } from './entities/Food';
import { WaterPond } from './entities/WaterPond';
import { GenomeMutator } from './services/GenomeMutator';
import { MovementService } from './services/MovementService';
import { PheromoneGrid } from './services/PheromoneGrid';

export type AlgorithmMode = 'GENETIC' | 'ANT_COLONY';

export interface EngineConfig {
    algorithmMode: AlgorithmMode;
    initialPopulation: number;
    maxFood: number;
    foodSpawnRate: number;
    foodNutrition: number;
    hungerDrain: number;
    thirstDrain: number;
    mutationRate: number;
    speed: number;
    width: number;
    height: number;
    // Pheromone Swarm specific settings
    pheromoneEvaporation: number;
    pheromoneDepositRate: number;
    sensorDistance: number;
    sensorAngle: number;
}

export interface EngineState {
    algorithmMode: AlgorithmMode;
    organisms: Organism[];
    foods: Food[];
    waterPond: WaterPond;
    pheromoneGrid: PheromoneGrid;
    tick: number;
    aliveCount: number;
    oldestAge: number;
    highestGeneration: number;
    totalBirths: number;
    totalDeaths: number;
    averageEnergy: number;
    averageHydration: number;
    totalFruitsEaten: number;
}

export class Engine {
    public config: EngineConfig;
    public state: EngineState;

    constructor(initialConfig: Partial<EngineConfig> = {}) {
        const width = initialConfig.width || 800;
        const height = initialConfig.height || 600;

        this.config = {
            algorithmMode: 'GENETIC',
            initialPopulation: 25,
            maxFood: 80,
            foodSpawnRate: 0.08,
            foodNutrition: 45,
            hungerDrain: 0.12,
            thirstDrain: 0.14,
            mutationRate: 0.08,
            speed: 2,
            width,
            height,
            pheromoneEvaporation: 0.010,
            pheromoneDepositRate: 0.95,
            sensorDistance: 42,
            sensorAngle: 0.50,
            ...initialConfig
        };

        const grid = new PheromoneGrid(width, height);
        const pond = new WaterPond(width * 0.22, height * 0.28, 48);

        this.state = {
            algorithmMode: this.config.algorithmMode,
            organisms: [],
            foods: [],
            waterPond: pond,
            pheromoneGrid: grid,
            tick: 0,
            aliveCount: 0,
            oldestAge: 0,
            highestGeneration: 1,
            totalBirths: 0,
            totalDeaths: 0,
            averageEnergy: 100,
            averageHydration: 100,
            totalFruitsEaten: 0
        };

        this.initialize();
    }

    public setAlgorithmMode(mode: AlgorithmMode) {
        this.config.algorithmMode = mode;
        this.state.algorithmMode = mode;
        this.initialize();
    }

    public updateConfig(newConfig: Partial<EngineConfig>) {
        this.config = { ...this.config, ...newConfig };
        if (newConfig.algorithmMode && newConfig.algorithmMode !== this.state.algorithmMode) {
            this.state.algorithmMode = newConfig.algorithmMode;
            this.initialize();
        }
        if (newConfig.width || newConfig.height) {
            this.state.pheromoneGrid.resize(this.config.width, this.config.height);
            this.state.waterPond.x = this.config.width * 0.22;
            this.state.waterPond.y = this.config.height * 0.28;
        }
    }

    public initialize() {
        this.state.organisms = [];
        this.state.foods = [];
        this.state.tick = 0;
        this.state.totalBirths = this.config.initialPopulation;
        this.state.totalDeaths = 0;
        this.state.highestGeneration = 1;
        this.state.totalFruitsEaten = 0;
        this.state.pheromoneGrid.clear();

        for (let i = 0; i < this.config.initialPopulation; i++) {
            this.state.organisms.push(this.createOrganism());
        }

        // Spawn natural food clusters for both modes
        this.spawnInitialClusters();
        this.updateStats();
    }

    public seedOrganisms(count: number = 15) {
        for (let i = 0; i < count; i++) {
            this.state.organisms.push(this.createOrganism());
            this.state.totalBirths++;
        }
        this.updateStats();
    }

    public clearPheromones() {
        this.state.pheromoneGrid.clear();
    }

    public spawnFoodCluster(clusterSize: number = 18) {
        const padding = 50;
        const centerX = this.random(padding, this.config.width - padding);
        const centerY = this.random(padding, this.config.height - padding);

        for (let i = 0; i < clusterSize; i++) {
            if (this.state.foods.length < this.config.maxFood * 2) {
                // Organic scatter cluster
                const radius = this.random(5, 38);
                const angle = this.random(0, Math.PI * 2);
                const x = Math.max(15, Math.min(this.config.width - 15, centerX + Math.cos(angle) * radius));
                const y = Math.max(15, Math.min(this.config.height - 15, centerY + Math.sin(angle) * radius));

                this.state.foods.push(new Food(x, y, this.config.foodNutrition));
            }
        }
    }

    public step() {
        const usePheromones = this.state.algorithmMode === 'ANT_COLONY';

        for (let s = 0; s < this.config.speed; s++) {
            this.state.tick++;

            // 1. Evaporate pheromones in Swarm mode
            if (usePheromones) {
                this.state.pheromoneGrid.stepEvaporation(this.config.pheromoneEvaporation);
            }

            // 2. Continuous organic cluster spawning
            if (this.state.foods.length < this.config.maxFood && Math.random() < this.config.foodSpawnRate) {
                this.spawnFoodCluster(this.random(10, 16));
            }

            // 3. Move organisms & drain hunger/thirst
            const movementOptions = {
                hungerDrain: this.config.hungerDrain,
                thirstDrain: this.config.thirstDrain,
                speedMultiplier: 1.0,
                usePheromones,
                pheromoneDepositRate: this.config.pheromoneDepositRate,
                sensorDistance: this.config.sensorDistance,
                sensorAngle: this.config.sensorAngle
            };

            for (const organism of this.state.organisms) {
                MovementService.updateOrganism(
                    organism,
                    this.state.foods,
                    this.state.waterPond,
                    this.state.pheromoneGrid,
                    this.config.width,
                    this.config.height,
                    movementOptions
                );
            }

            // 4. Remove eaten food and track score
            const previousFoodCount = this.state.foods.length;
            this.state.foods = this.state.foods.filter(f => !f.eaten);
            this.state.totalFruitsEaten += (previousFoodCount - this.state.foods.length);

            // 5. Handle Starvation/Dehydration Cleanup & Mating Cooldown
            const livingOrganisms: Organism[] = [];
            for (const org of this.state.organisms) {
                if (org.matingCooldown > 0) {
                    org.matingCooldown--;
                }

                if (org.isStarved()) {
                    this.state.totalDeaths++;
                } else {
                    livingOrganisms.push(org);
                }
            }

            // 6. Proximity Mating (Two healthy & hydrated organisms close together reproduce!)
            const newOffspring: Organism[] = [];
            const matedThisTick = new Set<Organism>();

            const matingRadius = 26; // Distance within which two organisms can mate
            const minHealthForMating = 70; // Must have good energy & hydration

            for (let i = 0; i < livingOrganisms.length; i++) {
                const parentA = livingOrganisms[i];
                if (matedThisTick.has(parentA)) continue;
                if (parentA.energy < minHealthForMating || parentA.hydration < minHealthForMating || parentA.matingCooldown > 0 || parentA.age < 30) continue;

                for (let j = i + 1; j < livingOrganisms.length; j++) {
                    const parentB = livingOrganisms[j];
                    if (matedThisTick.has(parentB)) continue;
                    if (parentB.energy < minHealthForMating || parentB.hydration < minHealthForMating || parentB.matingCooldown > 0 || parentB.age < 30) continue;

                    const dist = Math.hypot(parentA.x - parentB.x, parentA.y - parentB.y);
                    if (dist <= matingRadius) {
                        // Successful Mating!
                        matedThisTick.add(parentA);
                        matedThisTick.add(parentB);

                        // Energy and Hydration investment from both parents
                        parentA.energy -= 25;
                        parentB.energy -= 25;
                        parentA.hydration -= 25;
                        parentB.hydration -= 25;
                        parentA.matingCooldown = 60; // Cooldown before mating again
                        parentB.matingCooldown = 60;

                        // Genome crossover between both parents + mutation
                        const childGenome = GenomeMutator.crossover(
                            parentA.genome,
                            parentB.genome,
                            0.7,
                            this.config.mutationRate
                        );

                        const childGeneration = Math.max(parentA.generation, parentB.generation) + 1;
                        if (childGeneration > this.state.highestGeneration) {
                            this.state.highestGeneration = childGeneration;
                        }

                        // Child spawned between parents
                        const spawnX = (parentA.x + parentB.x) / 2 + this.random(-5, 5);
                        const spawnY = (parentA.y + parentB.y) / 2 + this.random(-5, 5);

                        const child = new Organism(
                            Math.max(15, Math.min(this.config.width - 15, spawnX)),
                            Math.max(15, Math.min(this.config.height - 15, spawnY)),
                            this.random(0, Math.PI * 2),
                            childGenome,
                            55, // Initial child health
                            childGeneration,
                            55  // Initial child hydration
                        );

                        newOffspring.push(child);
                        this.state.totalBirths++;
                        break;
                    }
                }
            }

            this.state.organisms = [...livingOrganisms, ...newOffspring];

            // Extinction safeguard: reseed a couple if extinct
            if (this.state.organisms.length === 0) {
                for (let i = 0; i < 6; i++) {
                    this.state.organisms.push(this.createOrganism());
                    this.state.totalBirths++;
                }
            }
        }

        this.updateStats();
    }

    private spawnInitialClusters() {
        this.state.foods = [];
        this.spawnFoodCluster(20);
        this.spawnFoodCluster(20);
        this.spawnFoodCluster(20);
    }

    private createOrganism(genome: number[] | null = null): Organism {
        return new Organism(
            this.random(25, this.config.width - 25),
            this.random(25, this.config.height - 25),
            this.random(0, Math.PI * 2),
            genome || GenomeMutator.randomGenome(),
            100,
            1,
            100
        );
    }

    private updateStats() {
        this.state.aliveCount = this.state.organisms.length;

        if (this.state.organisms.length === 0) {
            this.state.averageEnergy = 0;
            this.state.averageHydration = 0;
            return;
        }

        let totalEnergy = 0;
        let totalHydration = 0;
        let oldest = 0;

        for (const organism of this.state.organisms) {
            totalEnergy += Math.max(0, organism.energy);
            totalHydration += Math.max(0, organism.hydration);
            if (organism.age > oldest) {
                oldest = organism.age;
            }
        }

        this.state.oldestAge = oldest;
        this.state.averageEnergy = totalEnergy / this.state.organisms.length;
        this.state.averageHydration = totalHydration / this.state.organisms.length;
    }

    private random(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }
}
