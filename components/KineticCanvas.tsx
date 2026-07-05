"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { createKineticParticles, updateKineticParticles, extractTextTargets, extractShapeTargets, KineticParticle } from "@/lib/physics/kinetic-shapes";

interface KineticCanvasProps {
    inputText: string;
    particleCount: number;
    springStiffness: number;
    damping: number;
    repulsionRadius: number;
    repulsionStrength: number;
    fontSize: number;
    resetKey: number;
    shapeMode: "text" | "circle" | "spiral" | "heart" | "star";
}

export function KineticCanvas(props: KineticCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Track simulation inside a ref to prevent garbage collection and react renders during the 60fps loop
    const simulationRef = useRef({
        particles: [] as KineticParticle[],
        mx: -1000, // Mouse off-screen by default
        my: -1000,
        width: 0,
        height: 0,
        dpr: 1
    });

    // Re-initialize all particles (Scatter instantly) when count changes or reset is hit
    useEffect(() => {
        simulationRef.current.particles = createKineticParticles(props.particleCount, simulationRef.current.width || 800, simulationRef.current.height || 600);
    }, [props.particleCount, props.resetKey]);

    // When Text/Shape changes, re-calculate targets and assign them to existing particles smoothly
    useEffect(() => {
        const sim = simulationRef.current;
        if (sim.width === 0 || sim.height === 0 || sim.particles.length === 0) return;

        let targets: { x: number, y: number }[] = [];
        if (props.shapeMode === "text") {
            targets = extractTextTargets(props.inputText, sim.width, sim.height, props.fontSize);
        } else {
            targets = extractShapeTargets(props.shapeMode, sim.width, sim.height, props.particleCount);
        }

        if (targets.length === 0) return; // If text/shape is empty, they just stay where they are

        // Randomly shuffle targets so assignments look more organic
        const shuffledTargets = [...targets].sort(() => Math.random() - 0.5);

        // Re-assign particle targets
        for (let i = 0; i < sim.particles.length; i++) {
            const t = shuffledTargets[i % shuffledTargets.length];
            sim.particles[i].tx = t.x;
            sim.particles[i].ty = t.y;
        }
    }, [props.inputText, props.fontSize, props.particleCount, props.shapeMode]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { alpha: false }); // Opt out of alpha blending for slight perf boost
        if (!ctx) return;

        let animationFrameId: number;

        const resize = () => {
            const container = containerRef.current;
            if (!container) return;

            const width = container.clientWidth;
            const height = container.clientHeight;
            const dpr = window.devicePixelRatio || 1;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            simulationRef.current.width = width;
            simulationRef.current.height = height;
            simulationRef.current.dpr = dpr;

            // Force target recalculation on resize so coordinates adapt to screen size
            let targets: { x: number, y: number }[] = [];
            if (props.shapeMode === "text") {
                targets = extractTextTargets(props.inputText, width, height, props.fontSize);
            } else {
                targets = extractShapeTargets(props.shapeMode, width, height, props.particleCount);
            }

            if (targets.length > 0) {
                const shuffledTargets = [...targets].sort(() => Math.random() - 0.5);
                for (let i = 0; i < simulationRef.current.particles.length; i++) {
                    const t = shuffledTargets[i % shuffledTargets.length];
                    simulationRef.current.particles[i].tx = t.x;
                    simulationRef.current.particles[i].ty = t.y;
                }
            }
        };

        const resizeObserver = new ResizeObserver(() => resize());
        if (containerRef.current) resizeObserver.observe(containerRef.current);
        resize();

        const render = () => {
            const sim = simulationRef.current;
            if (sim.particles.length === 0) return;

            // 1. Physics Step
            updateKineticParticles(sim.particles, {
                springStiffness: props.springStiffness,
                damping: props.damping,
                repulsionRadius: props.repulsionRadius,
                repulsionStrength: props.repulsionStrength,
                mx: sim.mx,
                my: sim.my
            }, sim.width, sim.height);

            // 2. Render Step
            ctx.setTransform(sim.dpr, 0, 0, sim.dpr, 0, 0); // Reset for clearing
            ctx.fillStyle = "#09090b"; // zinc-950
            ctx.fillRect(0, 0, sim.width, sim.height);

            // Draw Particles
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";

            for (let i = 0; i < sim.particles.length; i++) {
                const p = sim.particles[i];
                ctx.fillStyle = p.color;
                ctx.font = `${p.size}px monospace`;
                ctx.fillText(p.char, p.x, p.y);
            }

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(animationFrameId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.springStiffness, props.damping, props.repulsionRadius, props.repulsionStrength]);

    const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ("touches" in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        simulationRef.current.mx = clientX - rect.left;
        simulationRef.current.my = clientY - rect.top;
    }, []);

    const handlePointerLeave = () => {
        simulationRef.current.mx = -1000;
        simulationRef.current.my = -1000;
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full min-h-[400px] bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden relative shadow-lg"
        >
            <canvas
                ref={canvasRef}
                className="block w-full h-full touch-none"
                onMouseMove={handlePointerMove}
                onMouseLeave={handlePointerLeave}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerLeave}
                onTouchCancel={handlePointerLeave}
            />
        </div>
    );
}
