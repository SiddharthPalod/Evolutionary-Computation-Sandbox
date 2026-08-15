export class PheromoneGrid {
    public cellSize: number;
    public cols: number;
    public rows: number;
    public grid: Float32Array;

    constructor(width: number, height: number, cellSize: number = 14) {
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        this.grid = new Float32Array(this.cols * this.rows);
    }

    public resize(width: number, height: number): void {
        const newCols = Math.ceil(width / this.cellSize);
        const newRows = Math.ceil(height / this.cellSize);
        if (newCols === this.cols && newRows === this.rows) return;

        this.cols = newCols;
        this.rows = newRows;
        this.grid = new Float32Array(this.cols * this.rows);
    }

    public clear(): void {
        this.grid.fill(0);
    }

    public deposit(x: number, y: number, strength: number = 0.8): void {
        const c = Math.floor(x / this.cellSize);
        const r = Math.floor(y / this.cellSize);
        if (c < 0 || c >= this.cols || r < 0 || r >= this.rows) return;

        // Deposit in target cell and subtle bleed to neighbors for soft diffusion
        const idx = r * this.cols + c;
        this.grid[idx] = Math.min(1.0, this.grid[idx] + strength);

        // Gentle 3x3 diffusion radius
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                    const nIdx = nr * this.cols + nc;
                    this.grid[nIdx] = Math.min(1.0, this.grid[nIdx] + strength * 0.25);
                }
            }
        }
    }

    public sample(x: number, y: number): number {
        const c = Math.floor(x / this.cellSize);
        const r = Math.floor(y / this.cellSize);
        if (c < 0 || c >= this.cols || r < 0 || r >= this.rows) return 0;

        return this.grid[r * this.cols + c];
    }

    public stepEvaporation(evaporationRate: number = 0.008): void {
        const decay = 1 - evaporationRate;
        const total = this.cols * this.rows;
        for (let i = 0; i < total; i++) {
            if (this.grid[i] > 0.001) {
                this.grid[i] *= decay;
            } else {
                this.grid[i] = 0;
            }
        }
    }
}
