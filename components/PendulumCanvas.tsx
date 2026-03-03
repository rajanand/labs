"use client";

import React, { useEffect, useRef, useState } from "react";
import { stepPhysics, initDoublePendulums } from "@/lib/physics/double-pendulum";

interface PendulumCanvasProps {
    mass1: number;
    mass2: number;
    length1: number;
    length2: number;
    gravity: number;
    trailLength: number;
    showMultiple: boolean;
    resetKey: number;
    resetVariant: "top" | "horizontal";
}

export function PendulumCanvas(props: PendulumCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // We keep the actual simulation data inside a ref to avoid React overhead during the 60FPS loop
    const simulationRef = useRef({
        pendulums: initDoublePendulums(props.showMultiple ? 5 : 1, props.resetVariant),
        width: 0,
        height: 0,
        dpr: 1
    });

    // Re-initialize physics when requested via the "Drop" buttons
    useEffect(() => {
        simulationRef.current.pendulums = initDoublePendulums(props.showMultiple ? 5 : 1, props.resetVariant);
    }, [props.showMultiple, props.resetKey, props.resetVariant]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;

        // Responsive Resizing
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
        };

        const resizeObserver = new ResizeObserver(() => resize());
        if (containerRef.current) resizeObserver.observe(containerRef.current);
        resize();

        // The Main Loop
        const render = () => {
            const sim = simulationRef.current;
            const { width, height, dpr } = sim;

            // 1. Math Step (Perform multiple sub-steps for higher integration accuracy / numerical stability)
            const subSteps = 4;
            const dt = 0.5 / subSteps;
            const cx = width / 2;
            const cy = height / 2;

            for (let s = 0; s < subSteps; s++) {
                stepPhysics(sim.pendulums, {
                    m1: props.mass1,
                    m2: props.mass2,
                    l1: props.length1,
                    l2: props.length2,
                    g: props.gravity,
                    cx,
                    cy,
                    trailLength: props.trailLength
                }, dt);
            }

            // 2. Render Step
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // Reset for clearing
            ctx.fillStyle = "#09090b"; // zinc-950
            ctx.fillRect(0, 0, width, height);

            // Draw Pivot Point
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(cx, cy, 5, 0, Math.PI * 2);
            ctx.fill();

            for (let i = 0; i < sim.pendulums.length; i++) {
                const p = sim.pendulums[i];

                // Draw Trail first (so arms draw on top)
                if (p.path.length > 2) {
                    ctx.beginPath();
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = i === 0 ? 2 : 1; // Primary pendulum has thicker trail

                    for (let j = 0; j < p.path.length - 1; j++) {
                        // Fade out the tail
                        ctx.globalAlpha = j / p.path.length;
                        ctx.beginPath();
                        ctx.moveTo(p.path[j].x, p.path[j].y);
                        ctx.lineTo(p.path[j + 1].x, p.path[j + 1].y);
                        ctx.stroke();
                    }
                    ctx.globalAlpha = 1.0; // Reset
                }

                // Calculate current arm positions
                const x1 = cx + props.length1 * Math.sin(p.theta1);
                const y1 = cy + props.length1 * Math.cos(p.theta1);
                const x2 = x1 + props.length2 * Math.sin(p.theta2);
                const y2 = y1 + props.length2 * Math.cos(p.theta2);

                // Draw Arms
                ctx.strokeStyle = "#52525b"; // zinc-600
                ctx.lineWidth = 3;
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();

                // Draw Masses (scale by mass square root to look proportional to area)
                const rad1 = Math.max(4, Math.sqrt(props.mass1) * 2);
                const rad2 = Math.max(4, Math.sqrt(props.mass2) * 2);

                // Mass 1
                ctx.fillStyle = "#a1a1aa"; // zinc-400
                ctx.beginPath();
                ctx.arc(x1, y1, rad1, 0, Math.PI * 2);
                ctx.fill();

                // Mass 2 (Color matches trail)
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(x2, y2, rad2, 0, Math.PI * 2);
                ctx.fill();

                ctx.lineWidth = 2;
                ctx.strokeStyle = "#ffffff";
                ctx.stroke();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(animationFrameId);
        };
    }, [props.mass1, props.mass2, props.length1, props.length2, props.gravity, props.trailLength]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    return (
        <div
            ref={containerRef}
            className={`w-full h-full min-h-[400px] bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden relative shadow-lg
           ${isFullscreen ? 'rounded-none border-none' : ''}
        `}
        >
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />

            <div className="absolute top-4 right-4 z-20">
                <button
                    onClick={toggleFullscreen}
                    className="bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur border border-zinc-800 rounded-lg p-2 text-zinc-400 hover:text-white transition-colors"
                    title="Toggle Fullscreen"
                >
                    {isFullscreen ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20V14H3m12 6v-6h6m-12-6v-6H3m12 0v6h6" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}
