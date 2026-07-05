// Cellular Automata Rules for Falling Sand

// Material IDs
export const MAT_EMPTY = 0;
export const MAT_SAND = 1;
export const MAT_WATER = 2;
export const MAT_WALL = 3;
export const MAT_WOOD = 4;
export const MAT_ACID = 5;
export const MAT_FIRE = 6;
export const MAT_LAVA = 7;

// Material Colors (R, G, B)
export const colors: Record<number, [number, number, number]> = {
    [MAT_EMPTY]: [9, 9, 11],     // bg-zinc-950
    [MAT_SAND]: [253, 224, 71],   // yellow-300
    [MAT_WATER]: [96, 165, 250],  // blue-400
    [MAT_WALL]: [113, 113, 122],  // zinc-500
    [MAT_WOOD]: [120, 53, 4],     // amber-900 (brownish wood)
    [MAT_ACID]: [34, 197, 94],    // green-500 (bright corrosive acid)
    [MAT_FIRE]: [239, 68, 68],    // red-500 (bright fire)
    [MAT_LAVA]: [249, 115, 22],   // orange-500 (glowing hot lava)
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

    // Safely check what is at x,y (extract lower 4 bits for material ID)
    get(x: number, y: number): number {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return MAT_WALL; // Treat out of bounds as walls
        }
        return this.grid[this.getIndex(x, y)] & 0x0F;
    }

    // Safely set what is at x,y (pack material ID and random variation shade)
    set(x: number, y: number, mat: number) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
        const variation = mat === MAT_EMPTY ? 0 : Math.floor(Math.random() * 16);
        this.grid[this.getIndex(x, y)] = (mat & 0x0F) | (variation << 4);
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
        const r2 = radius * radius;
        for (let y = Math.max(0, cy - radius); y <= Math.min(this.height - 1, cy + radius); y++) {
            for (let x = Math.max(0, cx - radius); x <= Math.min(this.width - 1, cx + radius); x++) {
                const dx = x - cx;
                const dy = y - cy;
                if (dx * dx + dy * dy <= r2) {
                    if (mat === MAT_WALL || mat === MAT_WOOD || mat === MAT_EMPTY || this.get(x, y) === MAT_EMPTY) {
                        this.set(x, y, mat);
                    }
                }
            }
        }
    }

    // Bresenham's line algorithm to paint continuous smooth strokes
    drawLine(x0: number, y0: number, x1: number, y1: number, radius: number, mat: number) {
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;

        let x = x0;
        let y = y0;

        while (true) {
            this.drawCircle(x, y, radius, mat);

            if (x === x1 && y === y1) break;
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
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
            // Iterate horizontally
            const startX = dir === 1 ? 0 : this.width - 1;
            const endX = dir === 1 ? this.width : -1;
            const stepX = dir;

            for (let x = startX; x !== endX; x += stepX) {
                const idx = this.getIndex(x, y);
                if (this.processed[idx] === this.frameId) continue;

                const type = this.grid[idx] & 0x0F;

                if (type === MAT_SAND) {
                    this.updateSand(x, y);
                } else if (type === MAT_WATER) {
                    this.updateLiquid(x, y, dir);
                } else if (type === MAT_ACID) {
                    this.updateAcid(x, y, dir);
                } else if (type === MAT_FIRE) {
                    this.updateFire(x, y);
                } else if (type === MAT_LAVA) {
                    this.updateLava(x, y, dir);
                }
            }
        }
    }

    // Sand Rules
    updateSand(x: number, y: number) {
        const below = this.get(x, y + 1);

        if (below === MAT_EMPTY || below === MAT_WATER || below === MAT_ACID) {
            this.swap(x, y, x, y + 1);
            return;
        }

        const checkLeftFirst = Math.random() > 0.5;
        const diagLeft = this.get(x - 1, y + 1);
        const diagRight = this.get(x + 1, y + 1);

        if (checkLeftFirst) {
            if (diagLeft === MAT_EMPTY || diagLeft === MAT_WATER || diagLeft === MAT_ACID) { this.swap(x, y, x - 1, y + 1); return; }
            if (diagRight === MAT_EMPTY || diagRight === MAT_WATER || diagRight === MAT_ACID) { this.swap(x, y, x + 1, y + 1); return; }
        } else {
            if (diagRight === MAT_EMPTY || diagRight === MAT_WATER || diagRight === MAT_ACID) { this.swap(x, y, x + 1, y + 1); return; }
            if (diagLeft === MAT_EMPTY || diagLeft === MAT_WATER || diagLeft === MAT_ACID) { this.swap(x, y, x - 1, y + 1); return; }
        }
    }

    // Generalized liquid movement helper
    updateLiquid(x: number, y: number, dir: number) {
        const below = this.get(x, y + 1);

        if (below === MAT_EMPTY) {
            this.swap(x, y, x, y + 1);
            return;
        }

        const diagLeft = this.get(x - 1, y + 1);
        const diagRight = this.get(x + 1, y + 1);

        if (dir === 1) {
            if (diagRight === MAT_EMPTY) { this.swap(x, y, x + 1, y + 1); return; }
            if (diagLeft === MAT_EMPTY) { this.swap(x, y, x - 1, y + 1); return; }
        } else {
            if (diagLeft === MAT_EMPTY) { this.swap(x, y, x - 1, y + 1); return; }
            if (diagRight === MAT_EMPTY) { this.swap(x, y, x + 1, y + 1); return; }
        }

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

    // Acid Rules (liquid behavior + corrosiveness)
    updateAcid(x: number, y: number, dir: number) {
        const checkCoords = [
            { x: x, y: y + 1 },
            { x: x - 1, y: y + 1 },
            { x: x + 1, y: y + 1 },
            { x: x - 1, y: y },
            { x: x + 1, y: y }
        ];

        for (const coord of checkCoords) {
            const neighbor = this.get(coord.x, coord.y);
            if (neighbor === MAT_SAND || neighbor === MAT_WOOD || neighbor === MAT_WALL) {
                if (Math.random() < 0.2) {
                    this.set(coord.x, coord.y, MAT_EMPTY);
                    this.set(x, y, MAT_EMPTY);
                    return;
                }
            }
        }

        this.updateLiquid(x, y, dir);
    }

    // Fire Rules (floats up/sideways, burns wood, evaporates water)
    updateFire(x: number, y: number) {
        if (Math.random() < 0.12) {
            this.set(x, y, MAT_EMPTY);
            return;
        }

        const checkCoords = [
            { x: x, y: y + 1 },
            { x: x, y: y - 1 },
            { x: x - 1, y: y },
            { x: x + 1, y: y }
        ];

        for (const coord of checkCoords) {
            const neighbor = this.get(coord.x, coord.y);
            if (neighbor === MAT_WOOD) {
                if (Math.random() < 0.25) {
                    this.set(coord.x, coord.y, MAT_FIRE);
                }
            } else if (neighbor === MAT_WATER) {
                this.set(x, y, MAT_EMPTY);
                this.set(coord.x, coord.y, MAT_EMPTY);
                return;
            }
        }

        const moveY = Math.random() < 0.65 ? -1 : 0;
        const moveX = Math.floor(Math.random() * 3) - 1;

        if (moveY !== 0 || moveX !== 0) {
            const tx = x + moveX;
            const ty = y + moveY;
            if (this.get(tx, ty) === MAT_EMPTY) {
                this.swap(x, y, tx, ty);
            }
        }
    }

    // Lava Rules (slow liquid flow, sets wood on fire, melts sand, freezes in water)
    updateLava(x: number, y: number, dir: number) {
        const checkCoords = [
            { x: x, y: y + 1 },
            { x: x - 1, y: y + 1 },
            { x: x + 1, y: y + 1 },
            { x: x - 1, y: y },
            { x: x + 1, y: y }
        ];

        for (const coord of checkCoords) {
            const neighbor = this.get(coord.x, coord.y);
            if (neighbor === MAT_WOOD) {
                if (Math.random() < 0.3) {
                    this.set(coord.x, coord.y, MAT_FIRE);
                }
            } else if (neighbor === MAT_WATER) {
                this.set(x, y, MAT_WALL);
                this.set(coord.x, coord.y, MAT_EMPTY);
                return;
            } else if (neighbor === MAT_SAND) {
                if (Math.random() < 0.1) {
                    this.set(coord.x, coord.y, MAT_LAVA);
                }
            }
        }

        if (Math.random() < 0.3) {
            this.updateLiquid(x, y, dir);
        }
    }
}
