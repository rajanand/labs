export interface PendulumEntity {
    theta1: number;       // Angle of pendulum 1 (radians)
    theta2: number;       // Angle of pendulum 2 (radians)
    p1: number;           // Momentum of pendulum 1
    p2: number;           // Momentum of pendulum 2
    color: string;        // Color for rendering trails
    path: { x: number, y: number }[]; // Tailing path of pendulum 2
}

export interface PhysicsParams {
    m1: number; // Mass 1
    m2: number; // Mass 2
    l1: number; // Length 1
    l2: number; // Length 2
    g: number;  // Gravity
    cx: number; // Center X for drawing
    cy: number; // Center Y for drawing
    trailLength: number;
}

// Helper to convert angles to standard [-PI, PI]
const normalizeAngle = (angle: number) => {
    let a = angle % (Math.PI * 2);
    if (a > Math.PI) a -= Math.PI * 2;
    if (a < -Math.PI) a += Math.PI * 2;
    return a;
};

// RK4 Implementation for solving the Lagrangian equations
// Following the Hamiltonian formulation for stability
export function stepPhysics(pendulums: PendulumEntity[], params: PhysicsParams, timeStep: number = 0.05): void {
    const { m1, m2, l1, l2, g, cx, cy, trailLength } = params;

    // The Hamiltonian equations of motion derivatives
    const getDerivatives = (t1: number, t2: number, p1: number, p2: number) => {
        const delta = t1 - t2;

        // Denominators
        const denom1 = (m1 + m2) * l1 - m2 * l1 * Math.cos(delta) * Math.cos(delta);
        const denom2 = (l2 / l1) * denom1;

        // Angular velocities
        const theta1Dot = (l2 * p1 - l1 * p2 * Math.cos(delta)) / (l1 * l1 * denom1);
        const theta2Dot = (l1 * (m1 + m2) * p2 - l2 * m2 * p1 * Math.cos(delta)) / (m2 * l2 * l2 * denom2);

        // Core forces
        const tdt = theta1Dot * theta2Dot;
        let p1Dot = -(m1 + m2) * g * l1 * Math.sin(t1) - m2 * l1 * l2 * tdt * Math.sin(delta);
        let p2Dot = -m2 * g * l2 * Math.sin(t2) + m2 * l1 * l2 * tdt * Math.sin(delta);

        // Damping (slight friction to prevent numeric explosion over infinite time)
        p1Dot -= 0.005 * p1;
        p2Dot -= 0.005 * p2;

        return { theta1Dot, theta2Dot, p1Dot, p2Dot };
    };

    const dt = timeStep;

    // Runge-Kutta 4 Integrator for all pendulums
    for (let i = 0; i < pendulums.length; i++) {
        const p = pendulums[i];

        // k1
        const k1 = getDerivatives(p.theta1, p.theta2, p.p1, p.p2);

        // k2
        const k2 = getDerivatives(
            p.theta1 + 0.5 * dt * k1.theta1Dot,
            p.theta2 + 0.5 * dt * k1.theta2Dot,
            p.p1 + 0.5 * dt * k1.p1Dot,
            p.p2 + 0.5 * dt * k1.p2Dot
        );

        // k3
        const k3 = getDerivatives(
            p.theta1 + 0.5 * dt * k2.theta1Dot,
            p.theta2 + 0.5 * dt * k2.theta2Dot,
            p.p1 + 0.5 * dt * k2.p1Dot,
            p.p2 + 0.5 * dt * k2.p2Dot
        );

        // k4
        const k4 = getDerivatives(
            p.theta1 + dt * k3.theta1Dot,
            p.theta2 + dt * k3.theta2Dot,
            p.p1 + dt * k3.p1Dot,
            p.p2 + dt * k3.p2Dot
        );

        // Final Integration
        p.theta1 += (dt / 6.0) * (k1.theta1Dot + 2 * k2.theta1Dot + 2 * k3.theta1Dot + k4.theta1Dot);
        p.theta2 += (dt / 6.0) * (k1.theta2Dot + 2 * k2.theta2Dot + 2 * k3.theta2Dot + k4.theta2Dot);
        p.theta1 = normalizeAngle(p.theta1);
        p.theta2 = normalizeAngle(p.theta2);

        p.p1 += (dt / 6.0) * (k1.p1Dot + 2 * k2.p1Dot + 2 * k3.p1Dot + k4.p1Dot);
        p.p2 += (dt / 6.0) * (k1.p2Dot + 2 * k2.p2Dot + 2 * k3.p2Dot + k4.p2Dot);

        // Calculate endpoint for drawing trail
        const x1 = cx + l1 * Math.sin(p.theta1);
        const y1 = cy + l1 * Math.cos(p.theta1);
        const x2 = x1 + l2 * Math.sin(p.theta2);
        const y2 = y1 + l2 * Math.cos(p.theta2);

        // Update trail
        p.path.push({ x: x2, y: y2 });
        if (p.path.length > trailLength) {
            p.path.shift();
        }
    }
}

export function initDoublePendulums(count: number, variant: "top" | "horizontal"): PendulumEntity[] {
    const pendulums: PendulumEntity[] = [];

    // Base angles
    const baseT1 = variant === "top" ? Math.PI - 0.01 : Math.PI / 2;
    const baseT2 = variant === "top" ? Math.PI - 0.02 : Math.PI / 2;

    // Visually distinct colors for multiple pendulums
    const colors = [
        "#60a5fa", // blue-400
        "#f87171", // red-400
        "#4ade80", // green-400
        "#fbbf24", // amber-400
        "#c084fc", // purple-400
    ];

    for (let i = 0; i < count; i++) {
        // If multiple, offset the starting angle by just 0.001 radians (0.05 degrees)
        // This perfectly demonstrates chaos theory as they will diverge rapidly.
        const microOffset = i * 0.001;

        pendulums.push({
            theta1: baseT1 + microOffset,
            theta2: baseT2 + microOffset,
            p1: 0,
            p2: 0,
            color: colors[i % colors.length],
            path: [],
        });
    }

    return pendulums;
}
