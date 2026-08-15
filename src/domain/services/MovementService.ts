import { Organism, GENOME_SIZE } from '../entities/Organism';
import { Food } from '../entities/Food';
import { WaterPond } from '../entities/WaterPond';
import { PheromoneGrid } from './PheromoneGrid';

export interface MovementOptions {
    hungerDrain: number;
    thirstDrain: number;
    speedMultiplier: number;
    usePheromones: boolean;
    pheromoneDepositRate: number;
    sensorDistance: number;
    sensorAngle: number;
}

export class MovementService {
    public static updateOrganism(
        organism: Organism,
        foods: Food[],
        waterPond: WaterPond,
        pheromoneGrid: PheromoneGrid,
        width: number,
        height: number,
        options: MovementOptions
    ): void {
        if (organism.isStarved()) return;

        organism.age++;
        // 1. Hunger & Thirst drain per tick
        organism.energy -= options.hungerDrain;
        organism.hydration -= options.thirstDrain;

        // 2. Swarm Pheromone Emission (if recently ate food in Swarm mode)
        if (options.usePheromones && organism.pheromoneCooldown > 0) {
            organism.pheromoneCooldown--;
            pheromoneGrid.deposit(organism.x, organism.y, options.pheromoneDepositRate);
        }

        // 3. Priority Decision: If thirsty (hydration < 50%), steer towards the Water Pond!
        let steeredTowardsTarget = false;
        const distToWater = Math.hypot(waterPond.x - organism.x, waterPond.y - organism.y);

        // Check if inside pond to drink
        if (distToWater <= waterPond.radius + 6) {
            organism.drinkWater(3.5); // Rapidly replenishes hydration
        }

        if (organism.hydration < 55) {
            // Thirst instinct: steer directly toward the infinite oasis water pond
            const dx = waterPond.x - organism.x;
            const dy = waterPond.y - organism.y;
            const targetAngle = Math.atan2(dy, dx);
            let diff = targetAngle - organism.angle;

            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;

            organism.angle += diff * 0.15;
            steeredTowardsTarget = true;
        }

        // 4. Vision: If not prioritizing thirst, search for direct nearby food in sight
        if (!steeredTowardsTarget) {
            let nearestFood: Food | null = null;
            let nearestDistance = Infinity;

            for (const food of foods) {
                if (food.eaten) continue;
                const dx = food.x - organism.x;
                const dy = food.y - organism.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestFood = food;
                }
            }

            // If food is within close visual range (e.g. 90px), direct vision steer
            if (nearestFood && nearestDistance < 90) {
                const dx = nearestFood.x - organism.x;
                const dy = nearestFood.y - organism.y;
                const targetAngle = Math.atan2(dy, dx);
                let diff = targetAngle - organism.angle;

                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;

                organism.angle += diff * 0.12;
                steeredTowardsTarget = true;
            }
        }

        // In Swarm Mode: if not seeing food directly, sample Pheromone Beacons from peers
        if (!steeredTowardsTarget && options.usePheromones) {
            const sDist = options.sensorDistance;
            const sAngle = options.sensorAngle;

            const fwdX = organism.x + Math.cos(organism.angle) * sDist;
            const fwdY = organism.y + Math.sin(organism.angle) * sDist;

            const leftX = organism.x + Math.cos(organism.angle - sAngle) * sDist;
            const leftY = organism.y + Math.sin(organism.angle - sAngle) * sDist;

            const rightX = organism.x + Math.cos(organism.angle + sAngle) * sDist;
            const rightY = organism.y + Math.sin(organism.angle + sAngle) * sDist;

            const fwdSense = pheromoneGrid.sample(fwdX, fwdY);
            const leftSense = pheromoneGrid.sample(leftX, leftY);
            const rightSense = pheromoneGrid.sample(rightX, rightY);

            if (fwdSense > 0.05 || leftSense > 0.05 || rightSense > 0.05) {
                if (fwdSense >= leftSense && fwdSense >= rightSense) {
                    // Straight ahead
                } else if (leftSense > rightSense) {
                    organism.angle -= sAngle * 0.45;
                } else {
                    organism.angle += sAngle * 0.45;
                }
                steeredTowardsTarget = true;
            }
        }

        // In GA Mode (or Swarm Mode when no pheromone detected): use evolved internal genome
        if (!steeredTowardsTarget) {
            const geneIndex = Math.floor(organism.age / 30) % GENOME_SIZE;
            const gene = organism.genome[geneIndex];
            organism.angle += gene * 0.14;
        }

        // 4. Movement Execution
        const speed = 1.85 * options.speedMultiplier;
        organism.x += Math.cos(organism.angle) * speed;
        organism.y += Math.sin(organism.angle) * speed;

        // 5. Boundary bounce
        if (organism.x < 12 || organism.x > width - 12) {
            organism.angle = Math.PI - organism.angle;
        }
        if (organism.y < 12 || organism.y > height - 12) {
            organism.angle = -organism.angle;
        }

        organism.x = Math.max(12, Math.min(width - 12, organism.x));
        organism.y = Math.max(12, Math.min(height - 12, organism.y));

        // 6. Food Collision & Feeding
        for (const food of foods) {
            if (food.eaten) continue;
            const dist = Math.hypot(organism.x - food.x, organism.y - food.y);
            if (dist < 10) {
                food.eaten = true;
                organism.eatFruit(food.nutrition);
            }
        }
    }
}
