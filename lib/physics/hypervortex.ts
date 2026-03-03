export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    colorIndex: number;
    life: number;
    maxLife: number;
}

export interface PhysicsParams {
    width: number;
    height: number;
    time: number;
    rotationSpeed: number;
    turbulenceFactor: number;
    gravityConstant: number;

    // Interaction params
    interactionMode: 'attract' | 'repel' | 'pan';
    isMouseDown: boolean;
    mx: number;
    my: number;
}

export function initParticles(count: number, width: number, height: number): Particle[] {
    const particles = new Array<Particle>(count);
    for (let i = 0; i < count; i++) {
        particles[i] = {
            x: Math.random() * width,
            y: Math.random() * height,
            vx: 0,
            vy: 0,
            size: Math.random() * 1.5 + 0.5,
            colorIndex: 0,
            life: Math.random() * 200 + 100,
            maxLife: 300,
        };
    }
    return particles;
}

export function updateParticles(particles: Particle[], params: PhysicsParams): void {
    const { width, height, time, rotationSpeed, turbulenceFactor, gravityConstant, interactionMode, isMouseDown, mx, my } = params;
    const cx = width / 2;
    const cy = height / 2;

    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const tx = -dy / dist;
        const ty = dx / dist;

        const ix = -dx / dist;
        const iy = -dy / dist;

        // Create elegant noise wave
        const nx = Math.sin(p.y * 0.005 + time * 0.5) * turbulenceFactor;
        const ny = Math.cos(p.x * 0.005 + time * 0.5) * turbulenceFactor;

        // Calculate force vector
        const forceX = tx * rotationSpeed * 0.5 + ix * (gravityConstant * 0.2) + nx;
        const forceY = ty * rotationSpeed * 0.5 + iy * (gravityConstant * 0.2) + ny;

        let targetVx = forceX;
        let targetVy = forceY;

        // Apply Interaction Forces
        if (isMouseDown && (interactionMode === 'attract' || interactionMode === 'repel')) {
            const mdx = p.x - mx;
            const mdy = p.y - my;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy) || 1;
            const effectRadius = 300;

            if (mDist < effectRadius) {
                const force = (effectRadius - mDist) / effectRadius;
                const forceMlt = interactionMode === 'attract' ? -20 : 20;
                targetVx += (mdx / mDist) * force * forceMlt;
                targetVy += (mdy / mDist) * force * forceMlt;
            }
        }

        // Smooth velocity interpolation for fluid feel
        p.vx += (targetVx - p.vx) * 0.05;
        p.vy += (targetVy - p.vy) * 0.05;

        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;

        // Map speed to color (0 to 19 range)
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        p.colorIndex = Math.min(19, Math.floor(speed * 1.5));

        // Respawn if offscreen or dead
        if (p.life <= 0 || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
            p.x = Math.random() * width;
            p.y = Math.random() * height;
            p.vx = 0;
            p.vy = 0;
            p.life = p.maxLife;
        }
    }
}
