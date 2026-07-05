"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { SandGrid, colors, MAT_EMPTY } from "@/lib/physics/falling-sand";

interface SandCanvasProps {
    brushSize: number;
    material: number;
    isPlaying: boolean;
    resetKey: number;
    speed: number; // 1 to 4 physics steps per frame
}

const GRID_WIDTH = 250;
const GRID_HEIGHT = 200;

export function SandCanvas(props: SandCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const brushRef = useRef<HTMLDivElement>(null);

    const simulationRef = useRef({
        grid: new SandGrid(GRID_WIDTH, GRID_HEIGHT),
        isMouseDown: false,
        mx: 0,
        my: 0,
        pmx: 0, // Previous mouse positions for line interpolation
        pmy: 0,
    });

    // Re-initialize completely
    useEffect(() => {
        simulationRef.current.grid = new SandGrid(GRID_WIDTH, GRID_HEIGHT);
    }, [props.resetKey]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            if (!containerRef.current) return;
            const ch = containerRef.current.clientHeight;
            const cw = containerRef.current.clientWidth;

            canvas.style.width = `${cw}px`;
            canvas.style.height = `${ch}px`;
        };

        const resizeObserver = new ResizeObserver(() => resize());
        if (containerRef.current) resizeObserver.observe(containerRef.current);
        resize();

        const imageData = ctx.createImageData(GRID_WIDTH, GRID_HEIGHT);

        let animationFrameId: number;

        const render = () => {
            const sim = simulationRef.current;

            // 1. Inputs (Paint continuous lines from previous coordinate to current)
            if (sim.isMouseDown) {
                sim.grid.drawLine(sim.pmx, sim.pmy, sim.mx, sim.my, props.brushSize, props.material);
                sim.pmx = sim.mx;
                sim.pmy = sim.my;
            }

            // 2. Physics Step (Run multiple iterations per frame for faster, smoother flow)
            if (props.isPlaying) {
                for (let i = 0; i < props.speed; i++) {
                    sim.grid.update();
                }
            }

            // 3. Render Step (Extract packing: lower 4 bits = material, upper 4 bits = variation shade)
            const data = imageData.data;
            const grid = sim.grid.grid;

            for (let i = 0; i < grid.length; i++) {
                const val = grid[i];
                const mat = val & 0x0F;
                const variation = (val >> 4) & 0x0F;
                const color = colors[mat];

                // Noise shade offset to give materials a premium, textured look (grains/ripples)
                const shadeOffset = mat === MAT_EMPTY ? 0 : (variation - 8) * 2;

                const px = i * 4;
                data[px] = Math.max(0, Math.min(255, color[0] + shadeOffset));
                data[px + 1] = Math.max(0, Math.min(255, color[1] + shadeOffset));
                data[px + 2] = Math.max(0, Math.min(255, color[2] + shadeOffset));
                data[px + 3] = 255;
            }

            ctx.putImageData(imageData, 0, 0);

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(animationFrameId);
        };
    }, [props.isPlaying, props.brushSize, props.material, props.speed]);

    const getGridCoords = useCallback((e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ("touches" in e) {
            if (e.touches.length === 0) return { x: 0, y: 0 };
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = Math.floor((clientX - rect.left) * scaleX);
        const y = Math.floor((clientY - rect.top) * scaleY);

        return { x, y };
    }, []);

    // Update screen overlay brush size & position at 60fps directly in DOM for max performance
    const updateBrushOverlay = useCallback((e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        const brush = brushRef.current;
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!brush || !canvas || !container) return;

        const rect = container.getBoundingClientRect();
        let clientX, clientY;

        if ("touches" in e) {
            if (e.touches.length === 0) return;
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Radius is props.brushSize grid cells. Diameter is props.brushSize * 2.
        const size = (props.brushSize * 2 * rect.width) / GRID_WIDTH;

        brush.style.width = `${size}px`;
        brush.style.height = `${size}px`;
        brush.style.left = `${x}px`;
        brush.style.top = `${y}px`;

        if (props.material === MAT_EMPTY) {
            brush.style.borderColor = "rgba(239, 68, 68, 0.7)"; // red dashed border for Eraser
            brush.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
            brush.style.borderStyle = "dashed";
        } else {
            brush.style.borderColor = "rgba(255, 255, 255, 0.65)"; // white border for drawing
            brush.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
            brush.style.borderStyle = "solid";
        }

        brush.style.display = "block";
    }, [props.brushSize, props.material]);

    const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
        simulationRef.current.isMouseDown = true;
        const { x, y } = getGridCoords(e);
        simulationRef.current.mx = x;
        simulationRef.current.my = y;
        simulationRef.current.pmx = x;
        simulationRef.current.pmy = y;
    };

    const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
        const { x, y } = getGridCoords(e);
        simulationRef.current.mx = x;
        simulationRef.current.my = y;
    };

    const handlePointerUp = () => {
        simulationRef.current.isMouseDown = false;
    };

    const handlePointerLeave = () => {
        simulationRef.current.isMouseDown = false;
        if (brushRef.current) {
            brushRef.current.style.display = "none";
        }
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full min-h-[400px] bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden relative shadow-lg cursor-none"
            onMouseMove={(e) => {
                handlePointerMove(e);
                updateBrushOverlay(e);
            }}
            onMouseDown={(e) => {
                handlePointerDown(e);
                updateBrushOverlay(e);
            }}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerLeave}
            onTouchStart={(e) => {
                handlePointerDown(e);
                updateBrushOverlay(e);
            }}
            onTouchMove={(e) => {
                handlePointerMove(e);
                updateBrushOverlay(e);
            }}
            onTouchEnd={handlePointerUp}
        >
            <canvas
                ref={canvasRef}
                width={GRID_WIDTH}
                height={GRID_HEIGHT}
                className="block w-full h-full touch-none"
                style={{ imageRendering: "pixelated" }}
            />
            {/* Anti-aliased high-resolution screen cursor overlay */}
            <div
                ref={brushRef}
                className="pointer-events-none absolute rounded-full border mix-blend-difference hidden"
                style={{
                    transform: "translate(-50%, -50%)",
                    left: 0,
                    top: 0,
                    width: 0,
                    height: 0,
                }}
            />
        </div>
    );
}
