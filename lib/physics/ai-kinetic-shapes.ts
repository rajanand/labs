export interface GridNode {
    x: number;
    y: number;
    rx: number; // Rest X
    ry: number; // Rest Y
    vx: number;
    vy: number;
    col: number; // Grid X index
    row: number; // Grid Y index
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

    // Center offset if grid is smaller than canvas
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
                row: r
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

    // We process the mesh in two passes: calculate forces, then apply velocities.
    // This ensures order of iteration doesn't bias the springs (similar to cloth physics).

    // Force accumulators
    const forceX: number[][] = Array(rows).fill(0).map(() => Array(cols).fill(0));
    const forceY: number[][] = Array(rows).fill(0).map(() => Array(cols).fill(0));

    // 1. Calculate Forces
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const node = mesh[r][c];

            // A. Anchor Spring Force (Pulling node back to its original rest position)
            const dxAnchor = node.rx - node.x;
            const dyAnchor = node.ry - node.y;
            // The anchor spring is slightly softer than neighbor springs
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
            // To prevent calculating each spring twice, a node only pulls towards its Right and Bottom neighbors.
            // When it does, it applies equal and opposite force to the neighbor immediately.

            // Right Neighbor
            if (c < cols - 1) {
                const right = mesh[r][c + 1];
                const expectedDistX = right.rx - node.rx; // Horizontal grid spacing

                const dxNeighbor = right.x - node.x;
                const dyNeighbor = right.y - node.y;
                const currentDist = Math.sqrt(dxNeighbor * dxNeighbor + dyNeighbor * dyNeighbor) || 1;

                const stretch = currentDist - expectedDistX;

                const fx = (dxNeighbor / currentDist) * stretch * stiffness;
                const fy = (dyNeighbor / currentDist) * stretch * stiffness;

                // Pull node towards right, pull right towards node
                forceX[r][c] += fx;
                forceY[r][c] += fy;
                forceX[r][c + 1] -= fx;
                forceY[r][c + 1] -= fy;
            }

            // Bottom Neighbor
            if (r < rows - 1) {
                const bottom = mesh[r + 1][c];
                const expectedDistY = bottom.ry - node.ry; // Vertical grid spacing

                const dxNeighbor = bottom.x - node.x;
                const dyNeighbor = bottom.y - node.y;
                const currentDist = Math.sqrt(dxNeighbor * dxNeighbor + dyNeighbor * dyNeighbor) || 1;

                const stretch = currentDist - expectedDistY;

                const fx = (dxNeighbor / currentDist) * stretch * stiffness;
                const fy = (dyNeighbor / currentDist) * stretch * stiffness;

                // Pull node towards bottom, pull bottom towards node
                forceX[r][c] += fx;
                forceY[r][c] += fy;
                forceX[r + 1][c] -= fx;
                forceY[r + 1][c] -= fy;
            }
        }
    }

    // 2. Apply Acceleration & Velocity
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
