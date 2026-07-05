export interface KineticParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    tx: number; // Target X (where it wants to be)
    ty: number; // Target Y (where it wants to be)
    char: string;
    size: number;
    color: string;
}

export interface KineticPhysicsParams {
    springStiffness: number; // e.g., 0.05
    damping: number;         // e.g., 0.85
    repulsionRadius: number; // e.g., 100
    repulsionStrength: number; // e.g., 20
    mx: number;
    my: number;
}

// Allowed character set for the "tech aesthetic" particles
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
            tx: width / 2, // Default targets center
            ty: height / 2,
            char: CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)],
            size: Math.random() * 4 + 8, // Font size for the individual particle
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
    }

    return particles;
}

// Highly optimized in-place physics step
export function updateKineticParticles(particles: KineticParticle[], params: KineticPhysicsParams, width: number, height: number) {
    const { springStiffness, damping, repulsionRadius, repulsionStrength, mx, my } = params;

    const repulsionRadSq = repulsionRadius * repulsionRadius;

    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Calculate Spring Force towards target (Hooke's Law: F = -k * dx)
        const dxTarget = p.tx - p.x;
        const dyTarget = p.ty - p.y;

        // Convert force into velocity directly
        p.vx += dxTarget * springStiffness;
        p.vy += dyTarget * springStiffness;

        // 2. Calculate Repulsion from Mouse
        // Is mouse inside canvas?
        if (mx >= 0 && mx <= width && my >= 0 && my <= height) {
            const dxMouse = p.x - mx;
            const dyMouse = p.y - my;
            const distSq = dxMouse * dxMouse + dyMouse * dyMouse;

            if (distSq < repulsionRadSq) {
                // Normalize and apply push force inversely proportional to distance
                const dist = Math.sqrt(distSq) || 1;
                const force = (repulsionRadius - dist) / repulsionRadius; // 0 to 1

                p.vx += (dxMouse / dist) * force * repulsionStrength;
                p.vy += (dyMouse / dist) * force * repulsionStrength;
            }
        }

        // 3. Apply Damping (Friction)
        p.vx *= damping;
        p.vy *= damping;

        // 4. Update Position
        p.x += p.vx;
        p.y += p.vy;
    }
}

// Render word to a hidden canvas, scan the pixels, and extract Target Coordinates.
export function extractTextTargets(text: string, width: number, height: number, fontSize: number): { x: number, y: number }[] {
    const canvas = document.createElement('canvas'); // Works exclusively in Browser/Client env
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return [];

    canvas.width = width;
    canvas.height = height;

    // Draw Text
    ctx.fillStyle = 'white';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.font = `bold ${fontSize}px Inter, sans-serif`;

    // Handle multi-line support roughly
    const lines = text.split('\n');
    const lineHeight = fontSize * 1.1;
    const totalHeight = (lines.length - 1) * lineHeight;

    const startY = height / 2 - totalHeight / 2;

    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], width / 2, startY + i * lineHeight);
    }

    // Scan Pixels
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const targets: { x: number, y: number }[] = [];

    // Skip pixels to dramatically speed up scanning and space out targets
    // Skip 4 pixels at a time horizontally and vertically
    const skip = 4;

    for (let y = 0; y < height; y += skip) {
        for (let x = 0; x < width; x += skip) {
            const alphaIndex = (y * width + x) * 4 + 3;
            // If the pixel is fairly opaque
            if (data[alphaIndex] > 128) {
                targets.push({ x, y });
            }
        }
    }

    return targets;
}
