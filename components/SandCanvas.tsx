"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { SandGrid, colors, MAT_EMPTY } from "@/lib/physics/falling-sand";

interface SandCanvasProps {
    brushSize: number;
    material: number;
    isPlaying: boolean;
    resetKey: number;
}

// Fixed canvas resolution for the physics grid to ensure performance
// We will scale this up to exactly fit the monitor via CSS
const GRID_WIDTH = 250;
const GRID_HEIGHT = 200;

export function SandCanvas(props: SandCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const simulationRef = useRef({
        grid: new SandGrid(GRID_WIDTH, GRID_HEIGHT),
        isMouseDown: false,
        mx: 0, // In Grid Space
        my: 0, // In Grid Space
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

        // We only need to adjust CSS size when the container resizes, not internal canvas resolution
        const resize = () => {
            if (!containerRef.current) return;
            const ch = containerRef.current.clientHeight;
            const cw = containerRef.current.clientWidth;

            // Maintain roughly exact aspect ratio if possible, or stretch to fill
            canvas.style.width = `${cw}px`;
            canvas.style.height = `${ch}px`;
        };

        const resizeObserver = new ResizeObserver(() => resize());
        if (containerRef.current) resizeObserver.observe(containerRef.current);
        resize();

        // Setup an imagedata buffer for lightning fast rendering over the grid
        const imageData = ctx.createImageData(GRID_WIDTH, GRID_HEIGHT);

        let animationFrameId: number;

        const render = () => {
            const sim = simulationRef.current;

            // 1. Inputs (Painting)
            if (sim.isMouseDown) {
                sim.grid.drawCircle(sim.mx, sim.my, props.brushSize, props.material);
            }

            // 2. Physics Step
            if (props.isPlaying) {
                sim.grid.update();
            }

            // 3. Render Step
            const data = imageData.data;
            const grid = sim.grid.grid;

            for (let i = 0; i < grid.length; i++) {
                const mat = grid[i];
                const color = colors[mat];

                // Data array is flat RGBA layout
                const px = i * 4;
                data[px] = color[0];
                data[px + 1] = color[1];
                data[px + 2] = color[2];
                data[px + 3] = 255; // Alpha
            }

            // Slam the pixel buffer directly onto the canvas
            ctx.putImageData(imageData, 0, 0);

            // 4. Draw Brush overlay (scaled from grid to actual pixels isn't easy via API, 
            // but since we scale via CSS, drawing on the canvas directly works perfectly)
            if (props.material !== MAT_EMPTY) {
                ctx.beginPath();
                ctx.strokeStyle = "rgba(255,255,255,0.3)";
                ctx.lineWidth = 1;
                ctx.arc(sim.mx, sim.my, props.brushSize, 0, Math.PI * 2);
                ctx.stroke();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(animationFrameId);
        };
    }, [props.isPlaying, props.brushSize, props.material]);

    // Interaction Mapping function maps CSS actual mouse pixels back to our low-res GRID pixels
    const getGridCoords = useCallback((e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ("touches" in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        // This converts from the CSS display size back to our internal GRID_WIDTH resolution
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = Math.floor((clientX - rect.left) * scaleX);
        const y = Math.floor((clientY - rect.top) * scaleY);

        return { x, y };
    }, []);

    const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
        simulationRef.current.isMouseDown = true;
        const { x, y } = getGridCoords(e);
        simulationRef.current.mx = x;
        simulationRef.current.my = y;
    };

    const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
        const { x, y } = getGridCoords(e);
        simulationRef.current.mx = x;
        simulationRef.current.my = y;
    };

    const handlePointerUp = () => {
        simulationRef.current.isMouseDown = false;
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full min-h-[400px] bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden relative shadow-lg"
        >
            {/* 
        Must set width and height attributes to identical to GRID variables. 
        CSS will override visual scale, allowing nearest-neighbor upscale for that retro look.
      */}
            <canvas
                ref={canvasRef}
                width={GRID_WIDTH}
                height={GRID_HEIGHT}
                className="block w-full h-full touch-none"
                style={{ imageRendering: "pixelated" }} // Make the pixels chunky instead of blurry
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
            />
        </div>
    );
}
