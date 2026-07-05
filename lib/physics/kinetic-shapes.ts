export interface KineticParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    tx: number; // Target X
    ty: number; // Target Y
    char: string;
    size: number;
    color: string;
}

export interface KineticPhysicsParams {
    springStiffness: number;
    damping: number;
    repulsionRadius: number;
    repulsionStrength: number;
    mx: number;
    my: number;
}

const CHARACTERS = ["+", "-", "•", ".", "x"];
const COLORS = ["#fbbf24", "#60a5fa", "#a8a29e", "#d6d3d1"]; // amber, blue, warm-grey

export function createKineticParticles(count: number, width: number, height: number): KineticParticle[] {
    const particles: KineticParticle[] = [];

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: 0,
            vy: 0,
            tx: width / 2,
            ty: height / 2,
            char: CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)],
            size: Math.random() * 4 + 8,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
    }

    return particles;
}

export function updateKineticParticles(particles: KineticParticle[], params: KineticPhysicsParams, width: number, height: number) {
    const { springStiffness, damping, repulsionRadius, repulsionStrength, mx, my } = params;
    const repulsionRadSq = repulsionRadius * repulsionRadius;

    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Spring Force (Hooke's Law)
        const dxTarget = p.tx - p.x;
        const dyTarget = p.ty - p.y;

        p.vx += dxTarget * springStiffness;
        p.vy += dyTarget * springStiffness;

        // 2. Repulsion from Mouse
        if (mx >= 0 && mx <= width && my >= 0 && my <= height) {
            const dxMouse = p.x - mx;
            const dyMouse = p.y - my;
            const distSq = dxMouse * dxMouse + dyMouse * dyMouse;

            if (distSq < repulsionRadSq) {
                const dist = Math.sqrt(distSq) || 1;
                const force = (repulsionRadius - dist) / repulsionRadius;

                p.vx += (dxMouse / dist) * force * repulsionStrength;
                p.vy += (dyMouse / dist) * force * repulsionStrength;
            }
        }

        // 3. Damping
        p.vx *= damping;
        p.vy *= damping;

        // 4. Update Position
        p.x += p.vx;
        p.y += p.vy;
    }
}

// Scans an offscreen canvas to extract targets for text
export function extractTextTargets(text: string, width: number, height: number, fontSize: number): { x: number, y: number }[] {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return [];

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = 'white';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.font = `bold ${fontSize}px Inter, sans-serif`;

    const lines = text.split('\n');
    const lineHeight = fontSize * 1.1;
    const totalHeight = (lines.length - 1) * lineHeight;
    const startY = height / 2 - totalHeight / 2;

    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], width / 2, startY + i * lineHeight);
    }

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const targets: { x: number, y: number }[] = [];

    const skip = 4;
    for (let y = 0; y < height; y += skip) {
        for (let x = 0; x < width; x += skip) {
            const alphaIndex = (y * width + x) * 4 + 3;
            if (data[alphaIndex] > 128) {
                targets.push({ x, y });
            }
        }
    }

    return targets;
}

// Generate mathematical/parametric shape coordinates
export function extractShapeTargets(shapeType: string, width: number, height: number, count: number): { x: number, y: number }[] {
    const targets: { x: number, y: number }[] = [];
    const cx = width / 2;
    const cy = height / 2;

    if (shapeType === "circle") {
        const radius = Math.min(width, height) * 0.32;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            targets.push({
                x: cx + Math.cos(angle) * radius,
                y: cy + Math.sin(angle) * radius
            });
        }
    } else if (shapeType === "spiral") {
        const maxRadius = Math.min(width, height) * 0.38;
        for (let i = 0; i < count; i++) {
            const theta = (i / count) * Math.PI * 2 * 6.5; // 6.5 rotations
            const r = (i / count) * maxRadius;
            targets.push({
                x: cx + Math.cos(theta) * r,
                y: cy + Math.sin(theta) * r
            });
        }
    } else if (shapeType === "heart") {
        const scale = Math.min(width, height) * 0.016;
        for (let i = 0; i < count; i++) {
            const t = (i / count) * Math.PI * 2;
            const hx = 16 * Math.pow(Math.sin(t), 3);
            const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
            targets.push({
                x: cx + hx * scale,
                y: cy - hy * scale // Invert Y for canvas orientation
            });
        }
    } else if (shapeType === "star") {
        const outerRadius = Math.min(width, height) * 0.38;
        const innerRadius = outerRadius * 0.38;
        const points = 5;

        for (let i = 0; i < count; i++) {
            const step = i / count;
            const angle = step * Math.PI * 2;
            const peakFactor = (step * points * 2) % 2;
            const r = peakFactor < 1
                ? outerRadius - (outerRadius - innerRadius) * peakFactor
                : innerRadius + (outerRadius - innerRadius) * (peakFactor - 1);

            targets.push({
                x: cx + Math.cos(angle) * r,
                y: cy + Math.sin(angle) * r
            });
        }
    }

    return targets;
}
