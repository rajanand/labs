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

            // Two-pass connection line rendering for optimal speed and visual aesthetics
            // Pass A: Draw quiet connections in a single, fast batch stroke
            ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
            ctx.lineWidth = 1;
            ctx.beginPath();

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const node = sim.mesh[r][c];
                    const distNode = node.disturbance || 0;

                    // Line to right neighbor
                    if (c < cols - 1 && node.rightConnected) {
                        const right = sim.mesh[r][c + 1];
                        const distAvg = (distNode + (right.disturbance || 0)) / 2;
                        if (distAvg <= 0.05) {
                            ctx.moveTo(node.x, node.y);
                            ctx.lineTo(right.x, right.y);
                        }
                    }

                    // Line to bottom neighbor
                    if (r < rows - 1 && node.bottomConnected) {
                        const bottom = sim.mesh[r + 1][c];
                        const distAvg = (distNode + (bottom.disturbance || 0)) / 2;
                        if (distAvg <= 0.05) {
                            ctx.moveTo(node.x, node.y);
                            ctx.lineTo(bottom.x, bottom.y);
                        }
                    }
                }
            }
            ctx.stroke();

            // Pass B: Draw active connections (glowing color ripple wave) individually
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const node = sim.mesh[r][c];
                    const distNode = node.disturbance || 0;

                    // Line to right neighbor
                    if (c < cols - 1 && node.rightConnected) {
                        const right = sim.mesh[r][c + 1];
                        const distAvg = (distNode + (right.disturbance || 0)) / 2;
                        if (distAvg > 0.05) {
                            ctx.beginPath();
                            ctx.moveTo(node.x, node.y);
                            ctx.lineTo(right.x, right.y);
                            
                            const hue = 200 + distAvg * 110; // Shift from cyan to purple/pink
                            const alpha = 0.15 + distAvg * 0.75;
                            ctx.strokeStyle = `hsla(${hue}, 95%, 60%, ${alpha})`;
                            ctx.lineWidth = 1 + distAvg * 2.5;
                            ctx.stroke();
                        }
                    }

                    // Line to bottom neighbor
                    if (r < rows - 1 && node.bottomConnected) {
                        const bottom = sim.mesh[r + 1][c];
                        const distAvg = (distNode + (bottom.disturbance || 0)) / 2;
                        if (distAvg > 0.05) {
                            ctx.beginPath();
                            ctx.moveTo(node.x, node.y);
                            ctx.lineTo(bottom.x, bottom.y);
                            
                            const hue = 200 + distAvg * 110;
                            const alpha = 0.15 + distAvg * 0.75;
                            ctx.strokeStyle = `hsla(${hue}, 95%, 60%, ${alpha})`;
                            ctx.lineWidth = 1 + distAvg * 2.5;
                            ctx.stroke();
                        }
                    }
                }
            }

            // Draw Nodes
            if (nodeSize > 0) {
                // Pass 1: Quiet nodes
                ctx.fillStyle = "rgba(161, 161, 170, 0.4)"; // zinc-400 translucent
                ctx.beginPath();
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const node = sim.mesh[r][c];
                        const dist = node.disturbance || 0;
                        if (dist <= 0.05) {
                            if (nodeSize < 3) {
                                ctx.rect(node.x - nodeSize / 2, node.y - nodeSize / 2, nodeSize, nodeSize);
                            } else {
                                ctx.moveTo(node.x, node.y);
                                ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);
                            }
                        }
                    }
                }
                ctx.fill();

                // Pass 2: Active nodes (glowing ripple points)
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const node = sim.mesh[r][c];
                        const dist = node.disturbance || 0;
                        if (dist > 0.05) {
                            ctx.beginPath();
                            const hue = 200 + dist * 110;
                            ctx.fillStyle = `hsla(${hue}, 95%, 60%, 0.95)`;
                            const pulseSize = nodeSize + dist * 3;
                            ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }
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
