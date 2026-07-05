export interface Vector2 {
    x: number;
    y: number;
}

export interface Ball {
    id: string;
    pos: Vector2;
    vel: Vector2;
    radius: number;
    color: string;
}

export interface SimulationConfig {
    id: number;
    name: string;
    shapeType: 'triangle' | 'square' | 'pentagon' | 'hexagon' | 'octagon' | 'star';
    vertexCount: number;
    gravity: number; // Multiplier relative to base
    friction: number; // 0 to 1
    restitution: number; // Bounciness (0 to 1+)
    rotationSpeed: number; // Radians per frame
    ballCount: number;
    ballSize: number;
    initialSpeed: number;
    nuanceDescription: string;
}

export interface GlobalSettings {
    timeScale: number;
    gravityMultiplier: number;
    rotationMultiplier: number;
    bouncinessMultiplier: number;
}

const baseConfig: Omit<SimulationConfig, 'id' | 'name' | 'nuanceDescription'> = {
    shapeType: 'square',
    vertexCount: 4,
    gravity: 0.15,
    friction: 0.001,
    restitution: 0.8,
    rotationSpeed: 0.005,
    ballCount: 3,
    ballSize: 8,
    initialSpeed: 5,
};

export const physicsPresets: SimulationConfig[] = [
    {
        ...baseConfig,
        id: 1,
        name: "Standard Square",
        shapeType: 'square',
        nuanceDescription: "Classic physics. Moderate gravity and bounce.",
        rotationSpeed: 0.005,
    },
    {
        ...baseConfig,
        id: 2,
        name: "High Gravity Triangle",
        shapeType: 'triangle',
        vertexCount: 3,
        gravity: 0.5,
        restitution: 0.6,
        nuanceDescription: "Heavy balls in a tight space.",
        ballCount: 2,
    },
    {
        ...baseConfig,
        id: 3,
        name: "Zero-G Hexagon",
        shapeType: 'hexagon',
        vertexCount: 6,
        gravity: 0,
        friction: 0,
        restitution: 1.0,
        ballCount: 6,
        nuanceDescription: "No gravity, perfect energy conservation.",
        rotationSpeed: 0.01,
    },
    {
        ...baseConfig,
        id: 4,
        name: "Fast Spin Octagon",
        shapeType: 'octagon',
        vertexCount: 8,
        rotationSpeed: 0.04,
        gravity: 0.1,
        ballCount: 15,
        ballSize: 4,
        nuanceDescription: "Centrifugal chaos with many small particles.",
    },
    {
        ...baseConfig,
        id: 5,
        name: "Sticky Pentagon",
        shapeType: 'pentagon',
        vertexCount: 5,
        restitution: 0.4,
        friction: 0.05,
        nuanceDescription: "Low bounciness, balls tend to roll.",
    },
    {
        ...baseConfig,
        id: 7,
        name: "Reverse Gravity",
        shapeType: 'square',
        gravity: -0.1,
        ballCount: 5,
        nuanceDescription: "Gravity pulls upwards.",
    },
    {
        ...baseConfig,
        id: 8,
        name: "Heavy Friction",
        shapeType: 'hexagon',
        friction: 0.1,
        restitution: 0.5,
        rotationSpeed: 0.02,
        nuanceDescription: "Balls slow down rapidly in air.",
    },
    {
        ...baseConfig,
        id: 9,
        name: "Swarm",
        shapeType: 'octagon',
        ballCount: 40,
        ballSize: 2,
        gravity: 0.05,
        nuanceDescription: "Massive amount of tiny particles.",
    },
    {
        ...baseConfig,
        id: 10,
        name: "Slow Motion",
        shapeType: 'pentagon',
        initialSpeed: 1,
        gravity: 0.02,
        rotationSpeed: 0.002,
        nuanceDescription: "Everything moves at a glacial pace.",
    },
    {
        ...baseConfig,
        id: 11,
        name: "Hyper Speed",
        shapeType: 'triangle',
        initialSpeed: 15,
        gravity: 0.3,
        restitution: 0.9,
        nuanceDescription: "High velocity impacts.",
    },
    {
        ...baseConfig,
        id: 12,
        name: "Heavy Ball",
        shapeType: 'square',
        ballCount: 1,
        ballSize: 25,
        gravity: 0.4,
        nuanceDescription: "One massive ball dominates the space.",
    },
    {
        ...baseConfig,
        id: 13,
        name: "Reverse Spin",
        shapeType: 'hexagon',
        rotationSpeed: -0.03,
        ballCount: 4,
        nuanceDescription: "Shape rotates counter-clockwise quickly.",
    },
    {
        ...baseConfig,
        id: 18,
        name: "Nano Bots",
        shapeType: 'hexagon',
        ballCount: 50,
        ballSize: 1.5,
        gravity: 0,
        initialSpeed: 8,
        nuanceDescription: "Cloud of tiny particles in zero G.",
    },
    {
        ...baseConfig,
        id: 19,
        name: "Lazy Spinner",
        shapeType: 'octagon',
        rotationSpeed: 0.001,
        gravity: 0.2,
        ballCount: 5,
        nuanceDescription: "Barely rotating container.",
    }
];
