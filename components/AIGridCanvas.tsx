"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { createGridMesh, updateGridMesh, GridNode } from "@/lib/physics/ai-kinetic-shapes";

interface AIGridCanvasProps {
    stiffness: number;
    damping: number;
    repulsionRadius: number;
    nodeSize: number;
    resolution: number; // Num rows/cols
    resetKey: number;
}

export function AIGridCanvas(props: AIGridCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const simulationRef = useRef({
        mesh: [] as GridNode[][],
        mx: -1000,
        my: -1000,
        width: 0,
        height: 0,
        dpr: 1
    });

    // Rebuild grid when resolution or reset key changes
    useEffect(() => {
        const sim = simulationRef.current;
        if (sim.width > 0 && sim.height > 0) {
            // padding = 10% of smallest dimension
            const padding = Math.min(sim.width, sim.height) * 0.1;
            sim.mesh = createGridMesh(props.resolution, props.resolution, padding, sim.width, sim.height);
        }
    }, [props.resolution, props.resetKey]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: false });
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

            // Rebuild mesh on resize to maintain proportions
            const padding = Math.min(width, height) * 0.1;
            simulationRef.current.mesh = createGridMesh(props.resolution, props.resolution, padding, width, height);
        };

        const resizeObserver = new ResizeObserver(() => resize());
        if (containerRef.current) resizeObserver.observe(containerRef.current);
        resize();

        const render = () => {
            const sim = simulationRef.current;
            if (sim.mesh.length === 0) return;

            // 1. Physics Step
            updateGridMesh(sim.mesh, {
                stiffness: props.stiffness,
                damping: props.damping,
                repulsionRadius: props.repulsionRadius,
                mx: sim.mx,
                my: sim.my
            });

            // 2. Render Step
            ctx.setTransform(sim.dpr, 0, 0, sim.dpr, 0, 0);
            ctx.fillStyle = "#09090b"; // zinc-950
            ctx.fillRect(0, 0, sim.width, sim.height);

            const rows = sim.mesh.length;
            const cols = sim.mesh[0].length;
            const nodeSize = props.nodeSize;

            // Draw Connecting Lines
            ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
            ctx.lineWidth = 1;
            ctx.beginPath();

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const node = sim.mesh[r][c];

                    // Line to right neighbor
                    if (c < cols - 1) {
                        const right = sim.mesh[r][c + 1];
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(right.x, right.y);
                    }

                    // Line to bottom neighbor
                    if (r < rows - 1) {
                        const bottom = sim.mesh[r + 1][c];
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(bottom.x, bottom.y);
                    }
                }
            }
            ctx.stroke();

            // Draw Nodes (only if node size > 0)
            if (nodeSize > 0) {
                ctx.fillStyle = "rgba(161, 161, 170, 0.8)"; // zinc-400
                ctx.beginPath();
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const node = sim.mesh[r][c];
                        // For performance, use rects or path moves. rects are generally faster than arcs.
                        // Since these are very small (1-2px) rects look fine and render faster.
                        if (nodeSize < 3) {
                            ctx.rect(node.x - nodeSize / 2, node.y - nodeSize / 2, nodeSize, nodeSize);
                        } else {
                            ctx.moveTo(node.x, node.y);
                            ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);
                        }
                    }
                }
                ctx.fill();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(animationFrameId);
        };
    }, [props.stiffness, props.damping, props.repulsionRadius, props.nodeSize, props.resolution]);

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
            className="w-full h-full min-h-[400px] bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden relative shadow-[0_0_40px_rgba(0,0,0,0.5)] cursor-crosshair"
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
