export interface GridNode {
    x: number;
    y: number;
    rx: number; // Rest X
    ry: number; // Rest Y
    vx: number;
    vy: number;
    col: number; // Grid X index
    row: number; // Grid Y index
    rightConnected?: boolean;
    bottomConnected?: boolean;
    disturbance?: number; // 0 to 1, propagates as a color ripple wave
}

// Generates a 2D map of nodes centered in the canvas
export function createGridMesh(cols: number, rows: number, padding: number, width: number, height: number): GridNode[][] {
    const mesh: GridNode[][] = [];

    // Calculate usable visual space
    const usableWidth = width - (padding * 2);
    const usableHeight = height - (padding * 2);

    // Calculate spacing per cell
    const spacingX = cols > 1 ? usableWidth / (cols - 1) : 0;
    const spacingY = rows > 1 ? usableHeight / (rows - 1) : 0;

    const startX = padding;
    const startY = padding;

    for (let r = 0; r < rows; r++) {
        const rowArr: GridNode[] = [];
        for (let c = 0; c < cols; c++) {
            const px = startX + c * spacingX;
            const py = startY + r * spacingY;
            rowArr.push({
                x: px,
                y: py,
                rx: px,
                ry: py,
                vx: 0,
                vy: 0,
                col: c,
                row: r,
                rightConnected: true,
                bottomConnected: true,
                disturbance: 0
            });
        }
        mesh.push(rowArr);
    }

    return mesh;
}

interface PhysicsParams {
    stiffness: number;
    damping: number;
    repulsionRadius: number;
    mx: number;
    my: number;
}

export function updateGridMesh(mesh: GridNode[][], params: PhysicsParams) {
    const { stiffness, damping, repulsionRadius, mx, my } = params;

    if (mesh.length === 0) return;

    const rows = mesh.length;
    const cols = mesh[0].length;

    // 1. Accumulate Mouse Disturbance
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const node = mesh[r][c];
            if (node.disturbance === undefined) node.disturbance = 0;
            if (node.rightConnected === undefined) node.rightConnected = true;
            if (node.bottomConnected === undefined) node.bottomConnected = true;

            if (mx > -999 && my > -999) {
                const dxMouse = node.x - mx;
                const dyMouse = node.y - my;
                const distMouseSq = dxMouse * dxMouse + dyMouse * dyMouse;
                if (distMouseSq < repulsionRadius * repulsionRadius) {
                    const dist = Math.sqrt(distMouseSq);
                    const factor = (repulsionRadius - dist) / repulsionRadius;
                    node.disturbance = Math.max(node.disturbance, factor);
                }
            }
        }
    }

    // 2. Propagate / Diffuse Disturbance to Neighbors (Ripple propagation wave)
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const node = mesh[r][c];
            let neighborSum = 0;
            let count = 0;

            if (c > 0 && mesh[r][c - 1].rightConnected) { neighborSum += mesh[r][c - 1].disturbance || 0; count++; }
            if (c < cols - 1 && node.rightConnected) { neighborSum += mesh[r][c + 1].disturbance || 0; count++; }
            if (r > 0 && mesh[r - 1][c].bottomConnected) { neighborSum += mesh[r - 1][c].disturbance || 0; count++; }
            if (r < rows - 1 && node.bottomConnected) { neighborSum += mesh[r + 1][c].disturbance || 0; count++; }

            if (count > 0) {
                const avg = neighborSum / count;
                node.disturbance = (node.disturbance || 0) * 0.88 + avg * 0.1;
            }
            node.disturbance = Math.max(0, (node.disturbance || 0) * 0.94); // decay
        }
    }

    // Force accumulators
    const forceX: number[][] = Array(rows).fill(0).map(() => Array(cols).fill(0));
    const forceY: number[][] = Array(rows).fill(0).map(() => Array(cols).fill(0));

    // 3. Calculate Physics Forces
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const node = mesh[r][c];

            // A. Anchor Spring Force (Pulling node back to its original rest position)
            const dxAnchor = node.rx - node.x;
            const dyAnchor = node.ry - node.y;
            forceX[r][c] += dxAnchor * (stiffness * 0.5);
            forceY[r][c] += dyAnchor * (stiffness * 0.5);

            // B. Mouse Repulsion Force
            if (mx > -999 && my > -999) {
                const dxMouse = node.x - mx;
                const dyMouse = node.y - my;
                const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

                if (distMouse < repulsionRadius) {
                    const force = (repulsionRadius - distMouse) / repulsionRadius;
                    // Push away from mouse
                    forceX[r][c] += (dxMouse / (distMouse || 1)) * force * 15;
                    forceY[r][c] += (dyMouse / (distMouse || 1)) * force * 15;
                }
            }

            // C. Neighbor Spring Forces
            // Right Neighbor (Tearable connection)
            if (c < cols - 1 && node.rightConnected) {
                const right = mesh[r][c + 1];
                const expectedDistX = right.rx - node.rx;

                const dxNeighbor = right.x - node.x;
                const dyNeighbor = right.y - node.y;
                const currentDist = Math.sqrt(dxNeighbor * dxNeighbor + dyNeighbor * dyNeighbor) || 1;

                // Snap/Tear connection if stretched beyond 2.3x the rest distance
                if (currentDist > expectedDistX * 2.3) {
                    node.rightConnected = false;
                } else {
                    const stretch = currentDist - expectedDistX;
                    const fx = (dxNeighbor / currentDist) * stretch * stiffness;
                    const fy = (dyNeighbor / currentDist) * stretch * stiffness;

                    forceX[r][c] += fx;
                    forceY[r][c] += fy;
                    forceX[r][c + 1] -= fx;
                    forceY[r][c + 1] -= fy;
                }
            }

            // Bottom Neighbor (Tearable connection)
            if (r < rows - 1 && node.bottomConnected) {
                const bottom = mesh[r + 1][c];
                const expectedDistY = bottom.ry - node.ry;

                const dxNeighbor = bottom.x - node.x;
                const dyNeighbor = bottom.y - node.y;
                const currentDist = Math.sqrt(dxNeighbor * dxNeighbor + dyNeighbor * dyNeighbor) || 1;

                // Snap/Tear connection if stretched beyond 2.3x the rest distance
                if (currentDist > expectedDistY * 2.3) {
                    node.bottomConnected = false;
                } else {
                    const stretch = currentDist - expectedDistY;
                    const fx = (dxNeighbor / currentDist) * stretch * stiffness;
                    const fy = (dyNeighbor / currentDist) * stretch * stiffness;

                    forceX[r][c] += fx;
                    forceY[r][c] += fy;
                    forceX[r + 1][c] -= fx;
                    forceY[r + 1][c] -= fy;
                }
            }
        }
    }

    // 4. Apply Acceleration & Velocity
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const node = mesh[r][c];

            node.vx += forceX[r][c];
            node.vy += forceY[r][c];

            node.vx *= damping;
            node.vy *= damping;

            node.x += node.vx;
            node.y += node.vy;
        }
    }
}
