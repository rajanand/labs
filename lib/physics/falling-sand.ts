// Cellular Automata Rules for Falling Sand

// Material IDs
export const MAT_EMPTY = 0;
export const MAT_SAND = 1;
export const MAT_WATER = 2;
export const MAT_WALL = 3;

// Material Colors (R, G, B)
export const colors: Record<number, [number, number, number]> = {
    [MAT_EMPTY]: [9, 9, 11], // bg-zinc-950
    [MAT_SAND]: [253, 224, 71], // yellow-300
    [MAT_WATER]: [96, 165, 250], // blue-400
    [MAT_WALL]: [113, 113, 122], // zinc-500
};

export class SandGrid {
    width: number;
    height: number;
    grid: Uint8Array;
    processed: Uint8Array;
    frameId: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.grid = new Uint8Array(width * height);
        this.processed = new Uint8Array(width * height);
        this.frameId = 1;
    }

    // Helper to get index
    getIndex(x: number, y: number): number {
        return y * this.width + x;
    }

    // Safely check what is at x,y
    get(x: number, y: number): number {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return MAT_WALL; // Treat out of bounds as walls
        }
        return this.grid[this.getIndex(x, y)];
    }

    // Safely set what is at x,y
    set(x: number, y: number, mat: number) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
        this.grid[this.getIndex(x, y)] = mat;
    }

    // Swap two cells and mark both as processed
    swap(x1: number, y1: number, x2: number, y2: number) {
        const idx1 = this.getIndex(x1, y1);
        const idx2 = this.getIndex(x2, y2);

        const temp = this.grid[idx1];
        this.grid[idx1] = this.grid[idx2];
        this.grid[idx2] = temp;

        this.processed[idx1] = this.frameId;
        this.processed[idx2] = this.frameId;
    }

    // Draw a circle of a material
    drawCircle(cx: number, cy: number, radius: number, mat: number) {
        // Simple bounding box iteration for speed
        const r2 = radius * radius;
        for (let y = Math.max(0, cy - radius); y <= Math.min(this.height - 1, cy + radius); y++) {
            for (let x = Math.max(0, cx - radius); x <= Math.min(this.width - 1, cx + radius); x++) {
                const dx = x - cx;
                const dy = y - cy;
                if (dx * dx + dy * dy <= r2) {
                    // Only draw sand/water if space is empty, or if we are drawing walls/erasing
                    if (mat === MAT_WALL || mat === MAT_EMPTY || this.get(x, y) === MAT_EMPTY) {
                        this.set(x, y, mat);
                    }
                }
            }
        }
    }

    // Main update loop
    update() {
        this.frameId++;
        if (this.frameId > 250) this.frameId = 1; // Prevent overflow

        // Alternate directions to prevent leaning bias
        const dir = Math.random() > 0.5 ? 1 : -1;

        // Iterate from bottom up, so falling elements don't fall infinitely in one frame
        for (let y = this.height - 2; y >= 0; y--) {
            // Iterate horizontally (direction determined above)
            const startX = dir === 1 ? 0 : this.width - 1;
            const endX = dir === 1 ? this.width : -1;
            const stepX = dir;

            for (let x = startX; x !== endX; x += stepX) {
                const idx = this.getIndex(x, y);
                if (this.processed[idx] === this.frameId) continue;

                const type = this.grid[idx];

                if (type === MAT_SAND) {
                    this.updateSand(x, y);
                } else if (type === MAT_WATER) {
                    this.updateWater(x, y, dir);
                }
            }
        }
    }

    // Sand Rules
    updateSand(x: number, y: number) {
        const below = this.get(x, y + 1);

        // 1. Fall straight down through empty space or water
        if (below === MAT_EMPTY || below === MAT_WATER) {
            this.swap(x, y, x, y + 1);
            return;
        }

        // 2. Try falling diagonally (randomize left/right preference)
        const checkLeftFirst = Math.random() > 0.5;
        const diagLeft = this.get(x - 1, y + 1);
        const diagRight = this.get(x + 1, y + 1);

        if (checkLeftFirst) {
            if (diagLeft === MAT_EMPTY || diagLeft === MAT_WATER) { this.swap(x, y, x - 1, y + 1); return; }
            if (diagRight === MAT_EMPTY || diagRight === MAT_WATER) { this.swap(x, y, x + 1, y + 1); return; }
        } else {
            if (diagRight === MAT_EMPTY || diagRight === MAT_WATER) { this.swap(x, y, x + 1, y + 1); return; }
            if (diagLeft === MAT_EMPTY || diagLeft === MAT_WATER) { this.swap(x, y, x - 1, y + 1); return; }
        }
    }

    // Water Rules
    updateWater(x: number, y: number, dir: number) {
        const below = this.get(x, y + 1);

        // 1. Fall straight down
        if (below === MAT_EMPTY) {
            this.swap(x, y, x, y + 1);
            return;
        }

        // 2. Try falling diagonally
        const diagLeft = this.get(x - 1, y + 1);
        const diagRight = this.get(x + 1, y + 1);

        // Direction is biased by the main loop scan direction to encourage flow
        if (dir === 1) {
            if (diagRight === MAT_EMPTY) { this.swap(x, y, x + 1, y + 1); return; }
            if (diagLeft === MAT_EMPTY) { this.swap(x, y, x - 1, y + 1); return; }
        } else {
            if (diagLeft === MAT_EMPTY) { this.swap(x, y, x - 1, y + 1); return; }
            if (diagRight === MAT_EMPTY) { this.swap(x, y, x + 1, y + 1); return; }
        }

        // 3. Flow horizontally
        const left = this.get(x - 1, y);
        const right = this.get(x + 1, y);

        if (dir === 1) {
            if (right === MAT_EMPTY) { this.swap(x, y, x + 1, y); return; }
            if (left === MAT_EMPTY) { this.swap(x, y, x - 1, y); return; }
        } else {
            if (left === MAT_EMPTY) { this.swap(x, y, x - 1, y); return; }
            if (right === MAT_EMPTY) { this.swap(x, y, x + 1, y); return; }
        }
    }
}
