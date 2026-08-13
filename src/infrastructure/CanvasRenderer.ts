import type { EngineState } from "../domain/Engine";
import { Organism } from "../domain/entities/Organism";
import { Food } from "../domain/entities/Food";

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
        this.drawFood(state.foods);

        if (state.organisms.length === 0) return;

        let best = state.organisms[0];
        for (const org of state.organisms) {
            if (org.fitness > best.fitness) {
                best = org;
            }
        }

        for (const org of state.organisms) {
            this.drawOrganism(org, org === best);
        }
    }

    private drawBackground(width: number, height: number) {
        this.ctx.fillStyle = "#0d1428";
        this.ctx.fillRect(0, 0, width, height);

        // Grid
        this.ctx.strokeStyle = "rgba(100,130,180,0.08)";
        this.ctx.lineWidth = 1;
        const gridSize = 30;

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

    private drawFood(foods: Food[]) {
        for (const food of foods) {
            if (food.eaten) continue;

            this.ctx.fillStyle = "#ffd166";
            this.ctx.shadowColor = "#ffd166";
            this.ctx.shadowBlur = 10;

            this.ctx.beginPath();
            this.ctx.arc(food.x, food.y, 4, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }
    }

    private drawOrganism(organism: Organism, isBest: boolean) {
        this.ctx.save();
        this.ctx.translate(organism.x, organism.y);
        this.ctx.rotate(organism.angle);

        const color = isBest ? "#55efc4" : "#65d9ff";

        this.ctx.fillStyle = color;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = isBest ? 18 : 8;

        // Triangle
        this.ctx.beginPath();
        this.ctx.moveTo(9, 0);
        this.ctx.lineTo(-6, -5);
        this.ctx.lineTo(-4, 0);
        this.ctx.lineTo(-6, 5);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.restore();
    }
}
