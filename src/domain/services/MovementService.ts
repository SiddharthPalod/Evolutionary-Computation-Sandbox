import { Organism, GENOME_SIZE } from '../entities/Organism';
import { Food } from '../entities/Food';

export class MovementService {
    public static updateOrganism(organism: Organism, foods: Food[], width: number, height: number): void {
        organism.age++;

        // Genome controls turning behaviour
        const geneIndex = Math.floor(organism.age / 35) % GENOME_SIZE;
        const gene = organism.genome[geneIndex];
        organism.angle += gene * 0.15;

        // Find nearest food
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

        if (nearestFood) {
            const dx = nearestFood.x - organism.x;
            const dy = nearestFood.y - organism.y;
            const targetAngle = Math.atan2(dy, dx);
            let difference = targetAngle - organism.angle;

            while (difference > Math.PI) difference -= Math.PI * 2;
            while (difference < -Math.PI) difference += Math.PI * 2;

            organism.angle += difference * 0.015 * (1 + gene);
        }

        const speed = 1.7;
        organism.x += Math.cos(organism.angle) * speed;
        organism.y += Math.sin(organism.angle) * speed;

        // Boundaries
        if (organism.x < 5 || organism.x > width - 5) {
            organism.angle = Math.PI - organism.angle;
        }
        if (organism.y < 5 || organism.y > height - 5) {
            organism.angle = -organism.angle;
        }

        organism.x = Math.max(5, Math.min(width - 5, organism.x));
        organism.y = Math.max(5, Math.min(height - 5, organism.y));

        // Eat food
        for (const food of foods) {
            if (food.eaten) continue;
            const distance = Math.hypot(organism.x - food.x, organism.y - food.y);
            if (distance < 8) {
                food.eaten = true;
                organism.fitness++;
                organism.energy++;
            }
        }
    }
}
