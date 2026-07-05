"use client";

import React, { useRef, useEffect } from "react";
import { SimulationConfig, GlobalSettings, Ball, Vector2 } from "@/lib/physics/ai-simulator-presets";
import { generatePolygon, generateStar, add, mult, dot, sub, normalize, mag } from "@/lib/physics/ai-simulator-math";

interface PhysicsCanvasProps {
    config: SimulationConfig;
    globalSettings: GlobalSettings;
}

export function PhysicsCanvas({ config, globalSettings }: PhysicsCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const requestRef = useRef<number | null>(null);
    const stateRef = useRef<{
        balls: Ball[];
        rotation: number;
        width: number;
        height: number;
        dpr: number;
    }>({
        balls: [],
        rotation: 0,
        width: 0,
        height: 0,
        dpr: 1
    });

    // Re-Initialize Simulation when config or ball properties change
    useEffect(() => {
        const balls: Ball[] = [];
        const count = Math.floor(config.ballCount);

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 30; // Spawn near center
            const speed = config.initialSpeed * (0.5 + Math.random());
            const velAngle = Math.random() * Math.PI * 2;

            // HSL color palette ranging from Blue to Cyan/Teal
            const hue = 190 + Math.random() * 40;

            balls.push({
                id: `${config.id}-${i}`,
                pos: { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist }, // Relative to center 0,0
                vel: { x: Math.cos(velAngle) * speed, y: Math.sin(velAngle) * speed },
                radius: config.ballSize,
                color: `hsl(${hue}, 80%, 60%)`,
            });
        }

        stateRef.current.balls = balls;
        stateRef.current.rotation = 0;
    }, [config.id, config.ballCount, config.initialSpeed, config.ballSize]);

    // Main tick loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        const resize = () => {
            const el = containerRef.current;
            if (!el) return;
            const width = el.clientWidth;
            const height = el.clientHeight;
            const dpr = window.devicePixelRatio || 1;

            if (stateRef.current.width !== width || stateRef.current.height !== height || stateRef.current.dpr !== dpr) {
                canvas.width = width * dpr;
                canvas.height = height * dpr;
                canvas.style.width = `${width}px`;
                canvas.style.height = `${height}px`;

                stateRef.current.width = width;
                stateRef.current.height = height;
                stateRef.current.dpr = dpr;
            }
        };

        const resizeObserver = new ResizeObserver(() => resize());
        if (containerRef.current) resizeObserver.observe(containerRef.current);
        resize();

        const updatePhysics = (width: number, height: number) => {
            const state = stateRef.current;
            const { gravityMultiplier, timeScale, rotationMultiplier, bouncinessMultiplier } = globalSettings;

            const shapeRadius = Math.min(width, height) * 0.40;

            // 1. Update Rotation
            state.rotation += config.rotationSpeed * rotationMultiplier * timeScale;

            // 2. Generate Shape Vertices (Local Space around 0,0)
            let localVertices: Vector2[] = [];
            if (config.shapeType === 'star') {
                localVertices = generateStar(config.vertexCount || 5, shapeRadius, shapeRadius * 0.4, { x: 0, y: 0 }, state.rotation);
            } else {
                localVertices = generatePolygon(config.vertexCount || 4, shapeRadius, { x: 0, y: 0 }, state.rotation);
            }

            // 3. Update Balls
            state.balls.forEach(ball => {
                // Apply Forces & Velocity
                ball.vel.y += config.gravity * gravityMultiplier * timeScale;
                ball.vel = mult(ball.vel, 1 - config.friction * timeScale);
                ball.pos = add(ball.pos, mult(ball.vel, timeScale));

                // Collision with Container Walls
                const restitution = config.restitution * bouncinessMultiplier;

                for (let i = 0; i < localVertices.length; i++) {
                    const p1 = localVertices[i];
                    const p2 = localVertices[(i + 1) % localVertices.length];
                    const edge = sub(p2, p1);

                    // Calculate normal pointing inward
                    const edgeNormal = normalize({ x: -edge.y, y: edge.x });
                    if (dot(edgeNormal, mult(p1, -1)) < 0) {
                        edgeNormal.x *= -1;
                        edgeNormal.y *= -1;
                    }

                    const relPos = sub(ball.pos, p1);
                    const dist = dot(relPos, edgeNormal);

                    if (dist < ball.radius) {
                        // Position correction (push it strictly out of the wall)
                        const penetration = ball.radius - dist;
                        ball.pos = add(ball.pos, mult(edgeNormal, penetration));

                        // Reflect Velocity
                        const velDotNormal = dot(ball.vel, edgeNormal);
                        if (velDotNormal < 0) {
                            const reflect = mult(edgeNormal, 2 * velDotNormal);
                            ball.vel = sub(ball.vel, mult(reflect, 1));
                            ball.vel = mult(ball.vel, restitution);
                            // Tiny push to prevent sticking to the line perfectly
                            ball.vel = add(ball.vel, mult(edgeNormal, 0.1));
                        }
                    }
                }
            });

            // 4. Ball-to-Ball Collisions
            const balls = state.balls;
            for (let i = 0; i < balls.length; i++) {
                for (let j = i + 1; j < balls.length; j++) {
                    const ballA = balls[i];
                    const ballB = balls[j];

                    const distVec = sub(ballB.pos, ballA.pos);
                    const distance = mag(distVec);
                    const totalRadius = ballA.radius + ballB.radius;

                    if (distance < totalRadius) {
                        // Collision detected! Position Correction (push apart)
                        const overlap = totalRadius - distance;
                        const correctionNormal = distance === 0 ? { x: 1, y: 0 } : normalize(distVec);
                        const correctionA = mult(correctionNormal, -overlap / 2);
                        const correctionB = mult(correctionNormal, overlap / 2);
                        ballA.pos = add(ballA.pos, correctionA);
                        ballB.pos = add(ballB.pos, correctionB);

                        // Velocity Update (elastic collision swapping momentum)
                        const collisionNormal = normalize(distVec);
                        const relativeVelocity = sub(ballB.vel, ballA.vel);
                        const speedAlongNormal = dot(relativeVelocity, collisionNormal);

                        // Only resolve if balls are actually moving towards each other
                        if (speedAlongNormal < 0) {
                            const v1n_scalar = dot(ballA.vel, collisionNormal);
                            const v2n_scalar = dot(ballB.vel, collisionNormal);

                            const v1n_vec = mult(collisionNormal, v1n_scalar);
                            const v2n_vec = mult(collisionNormal, v2n_scalar);

                            const v1t_vec = sub(ballA.vel, v1n_vec);
                            const v2t_vec = sub(ballB.vel, v2n_vec);

                            // Swap normal components
                            ballA.vel = add(v1t_vec, v2n_vec);
                            ballB.vel = add(v2t_vec, v1n_vec);
                        }
                    }
                }
            }

            // 5. Bounds Safefall (reset if ball escapes the polygon bounds entirely)
            balls.forEach(ball => {
                if (mag(ball.pos) > shapeRadius + 150) {
                    ball.pos = { x: 0, y: 0 };
                    ball.vel = { x: 0, y: 0 };
                }
            });
        };

        const draw = (ctx: CanvasRenderingContext2D, width: number, height: number, dpr: number) => {
            // Reset transform to draw background
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            ctx.fillStyle = "#09090b"; // zinc-950
            ctx.fillRect(0, 0, width, height);

            const center = { x: width / 2, y: height / 2 };
            const state = stateRef.current;
            const shapeRadius = Math.min(width, height) * 0.40;

            // Draw Polygon Shape Outline
            let points: Vector2[] = [];
            if (config.shapeType === 'star') {
                points = generateStar(config.vertexCount || 5, shapeRadius, shapeRadius * 0.4, center, state.rotation);
            } else {
                points = generatePolygon(config.vertexCount || 4, shapeRadius, center, state.rotation);
            }

            ctx.beginPath();
            if (points.length > 0) {
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                ctx.closePath();
            }

            ctx.strokeStyle = '#3b82f6'; // blue-500
            ctx.lineWidth = 3;
            ctx.lineJoin = 'round';
            ctx.stroke();

            ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
            ctx.fill();

            // Draw Balls
            state.balls.forEach(ball => {
                const screenX = center.x + ball.pos.x;
                const screenY = center.y + ball.pos.y;

                ctx.beginPath();
                ctx.arc(screenX, screenY, ball.radius, 0, Math.PI * 2);
                ctx.fillStyle = ball.color;
                ctx.fill();
            });
        };

        const tick = () => {
            const state = stateRef.current;
            if (state.width > 0 && state.height > 0) {
                updatePhysics(state.width, state.height);
                draw(ctx, state.width, state.height, state.dpr);
            }
            requestRef.current = requestAnimationFrame(tick);
        };

        requestRef.current = requestAnimationFrame(tick);

        return () => {
            resizeObserver.disconnect();
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [config, globalSettings]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full min-h-[400px] bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden relative shadow-[0_0_40px_rgba(0,0,0,0.5)] cursor-crosshair"
        >
            <canvas
                ref={canvasRef}
                className="block w-full h-full touch-none"
            />
        </div>
    );
}
