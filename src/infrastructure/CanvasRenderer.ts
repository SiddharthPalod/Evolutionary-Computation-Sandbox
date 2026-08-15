import type { EngineState } from "../domain/Engine";
import { Organism } from "../domain/entities/Organism";
import { Food } from "../domain/entities/Food";
import { PheromoneGrid } from "../domain/services/PheromoneGrid";

export interface IRenderer {
    draw(state: EngineState, width: number, height: number): void;
}

export class CanvasRenderer implements IRenderer {
    private ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    public draw(state: EngineState, width: number, height: number): void {
        this.drawBackground(width, height);

        // In Swarm Mode: render soft glowing pheromone heatmaps of discovered food clusters
        if (state.algorithmMode === 'ANT_COLONY') {
            this.drawPheromones(state.pheromoneGrid);
        }

        // Draw Infinite Water Pond Oasis
        this.drawWaterPond(state.waterPond);

        // Draw Food Clusters
        this.drawFood(state.foods);

        if (state.organisms.length === 0) return;

        // Find oldest organism
        let oldestOrg = state.organisms[0];
        for (const org of state.organisms) {
            if (org.age > oldestOrg.age) {
                oldestOrg = org;
            }
        }

        for (const org of state.organisms) {
            this.drawOrganism(org, org === oldestOrg, state.algorithmMode === 'ANT_COLONY');
        }
    }

    private drawWaterPond(pond: { x: number; y: number; radius: number }) {
        this.ctx.save();
        // Deep blue outer water aura
        const gradient = this.ctx.createRadialGradient(pond.x, pond.y, pond.radius * 0.2, pond.x, pond.y, pond.radius + 14);
        gradient.addColorStop(0, "rgba(56, 189, 248, 0.45)");
        gradient.addColorStop(0.7, "rgba(14, 165, 233, 0.25)");
        gradient.addColorStop(1, "rgba(14, 165, 233, 0.0)");

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(pond.x, pond.y, pond.radius + 14, 0, Math.PI * 2);
        this.ctx.fill();

        // Solid Water Pool
        this.ctx.fillStyle = "#0369a1";
        this.ctx.strokeStyle = "#38bdf8";
        this.ctx.lineWidth = 2.5;
        this.ctx.shadowColor = "rgba(56, 189, 248, 0.8)";
        this.ctx.shadowBlur = 18;
        this.ctx.beginPath();
        this.ctx.arc(pond.x, pond.y, pond.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Inner crystalline pool
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = "rgba(186, 230, 253, 0.35)";
        this.ctx.beginPath();
        this.ctx.arc(pond.x - 4, pond.y - 4, pond.radius * 0.6, 0, Math.PI * 2);
        this.ctx.fill();

        // Water Oasis Label
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "bold 11px Inter, sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText("💧 Oasis", pond.x, pond.y);

        this.ctx.restore();
    }

    private drawBackground(width: number, height: number) {
        this.ctx.fillStyle = "#090d1a";
        this.ctx.fillRect(0, 0, width, height);

        // Tech grid
        this.ctx.strokeStyle = "rgba(100, 130, 180, 0.04)";
        this.ctx.lineWidth = 1;
        const gridSize = 32;

        for (let x = 0; x < width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }

        for (let y = 0; y < height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
    }

    private drawPheromones(grid: PheromoneGrid) {
        const { cols, rows, cellSize, grid: pGrid } = grid;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const val = pGrid[r * cols + c];
                if (val > 0.02) {
                    const x = c * cellSize;
                    const y = r * cellSize;
                    const alpha = Math.min(0.55, val * 0.6);
                    this.ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`; // Glowing purple beacon
                    this.ctx.fillRect(x, y, cellSize, cellSize);
                }
            }
        }
    }

    private drawFood(foods: Food[]) {
        for (const food of foods) {
            if (food.eaten) continue;

            this.ctx.save();
            // Fruit glow
            this.ctx.fillStyle = "#f59e0b";
            this.ctx.shadowColor = "rgba(245, 158, 11, 0.75)";
            this.ctx.shadowBlur = 10;

            this.ctx.beginPath();
            this.ctx.arc(food.x, food.y, 4.5, 0, Math.PI * 2);
            this.ctx.fill();

            // Inner sweet core highlight
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = "#fef08a";
            this.ctx.beginPath();
            this.ctx.arc(food.x - 1, food.y - 1, 1.8, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        }
    }

    private drawOrganism(organism: Organism, isElder: boolean, isSwarmMode: boolean) {
        this.ctx.save();
        this.ctx.translate(organism.x, organism.y);

        // --- 1. Draw Dual Status Bars (Hunger & Thirst) ---
        const barWidth = 18;
        const barHeight = 2.5;
        const energyRatio = Math.max(0, Math.min(1, organism.energy / organism.maxEnergy));
        const hydrationRatio = Math.max(0, Math.min(1, organism.hydration / organism.maxHydration));

        // Upper Bar: Energy / Hunger (Green -> Amber -> Red)
        const energyY = -16;
        this.ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        this.ctx.beginPath();
        this.ctx.roundRect(-barWidth / 2, energyY, barWidth, barHeight, 1.5);
        this.ctx.fill();

        let energyColor = "#10b981";
        if (energyRatio < 0.3) energyColor = "#ef4444";
        else if (energyRatio < 0.6) energyColor = "#f59e0b";

        if (energyRatio > 0) {
            this.ctx.fillStyle = energyColor;
            this.ctx.beginPath();
            this.ctx.roundRect(-barWidth / 2, energyY, barWidth * energyRatio, barHeight, 1.5);
            this.ctx.fill();
        }

        // Lower Bar: Hydration / Thirst (Cyan -> Deep Blue)
        const waterY = -12;
        this.ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        this.ctx.beginPath();
        this.ctx.roundRect(-barWidth / 2, waterY, barWidth, barHeight, 1.5);
        this.ctx.fill();

        let waterColor = "#38bdf8";
        if (hydrationRatio < 0.3) waterColor = "#ef4444";
        else if (hydrationRatio < 0.6) waterColor = "#0284c7";

        if (hydrationRatio > 0) {
            this.ctx.fillStyle = waterColor;
            this.ctx.beginPath();
            this.ctx.roundRect(-barWidth / 2, waterY, barWidth * hydrationRatio, barHeight, 1.5);
            this.ctx.fill();
        }

        // --- 2. Draw Organism / Ant Sprite ---
        this.ctx.rotate(organism.angle);

        const baseColor = isElder ? "#38bdf8" : (isSwarmMode ? "#c084fc" : "#22d3ee");
        this.ctx.fillStyle = baseColor;
        this.ctx.shadowColor = isElder ? "rgba(56, 189, 248, 0.8)" : (isSwarmMode ? "rgba(192, 132, 252, 0.6)" : "rgba(34, 211, 238, 0.5)");
        this.ctx.shadowBlur = isElder ? 14 : 7;

        if (isSwarmMode) {
            // 🐜 ANT / FORAGER MORPHOLOGY (Head, Thorax, Abdomen, Antennae, Legs)
            // Abdomen (back)
            this.ctx.beginPath();
            this.ctx.ellipse(-5.5, 0, 5, 3.5, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Thorax (middle)
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, 3.2, 2.4, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Head (front)
            this.ctx.beginPath();
            this.ctx.ellipse(5.2, 0, 3, 2.5, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Antennae
            this.ctx.strokeStyle = baseColor;
            this.ctx.lineWidth = 1.2;
            this.ctx.beginPath();
            this.ctx.moveTo(7, -1);
            this.ctx.lineTo(10.5, -4);
            this.ctx.moveTo(7, 1);
            this.ctx.lineTo(10.5, 4);
            this.ctx.stroke();

            // Legs
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(0, -2);
            this.ctx.lineTo(-2, -6);
            this.ctx.moveTo(0, 2);
            this.ctx.lineTo(-2, 6);
            this.ctx.stroke();
        } else {
            // 🦠 ORGANISM / MICROBE MORPHOLOGY (Cell membrane, nucleus, tail flagellum)
            // Main cell body (organic rounded teardrop / amoeba)
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, 7.5, 5.5, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Front snout / sensory head
            this.ctx.beginPath();
            this.ctx.arc(5, 0, 3.5, 0, Math.PI * 2);
            this.ctx.fill();

            // Flagellum / wiggle tail
            this.ctx.strokeStyle = baseColor;
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.moveTo(-7.5, 0);
            this.ctx.quadraticCurveTo(-11, -3, -14, 0);
            this.ctx.stroke();

            // Cell Nucleus Core
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = isElder ? "#ffffff" : "rgba(255, 255, 255, 0.75)";
            this.ctx.beginPath();
            this.ctx.arc(1.5, 0, 2.2, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Elder marker crown
        if (isElder) {
            this.ctx.fillStyle = "#fef08a";
            this.ctx.beginPath();
            this.ctx.arc(5.5, 0, 1.8, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();
    }
}
